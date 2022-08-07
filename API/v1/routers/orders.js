const express = require('express');
const router = express.Router();
const Auth = require('../../../auth');
const Voucher = require('../module/voucher');
const Orders = require('../module/orders');
const Cart = require('../module/cart');
const Product = require('../module/product');
const Employee = require('../module/employee');


//tạo hóa đơn
router.post('/', Auth.authenGTUser, async (req, res, next) => {
    try {
        let id_account = Auth.tokenData(req).id_account;
        let id_voucher = req.body.id_voucher;
        if(!id_voucher){
            let order = await Orders.addOrder(id_account);
            let order_details = [];
            let cart = await Cart.selectIdCart(id_account);
            let items = await Cart.selectItems(cart.id_cart);
            for(let i = 0; i < items.length; i ++){
                let product = await Product.selectId(items[i].id_product);
                let priceProduct = product.price -(product.price * product.discount/100);
                let order_dettail = await Orders.addOrderDetail(order.id_order, items[i].id_product, items[i].quantity,priceProduct);
                let item = await Cart.selectIdItem(cart.id_cart, items[i].id_product);
                await Cart.deleteCartItem(item.id_item);
                order_details.push(order_dettail);
            }
            order['detail'] = order_details;
            return res.status(200).json({
                message: 'them hoa don thanh cong',
                data : order
            })

        }else{
            let voucherExist = await Voucher.hasId(id_voucher)
            if(voucherExist){
                let voucher = await Voucher.selectId(id_voucher);
                let dateStart = new Date(voucher.date_start);
                let dateEnd = new Date(voucher.date_end);
                let dateNow = new Date();

                if(dateStart.getTime() > dateNow.getTime() || dateEnd.getTime() < dateNow.getTime()){
                    return res.status(400).json({
                        message: 'voucher khong hop le'
                    })
                }

                let order = await Orders.addOrderHasVoucher(id_account, id_voucher);
                let updateAccountVoucher = await Voucher.updateStatusUseVoucher(id_account,id_voucher);
                let order_details = [];
                let cart = await Cart.selectIdCart(id_account);
                let items = await Cart.selectItems(cart.id_cart);
                for(let i = 0; i < items.length; i ++){
                    let product = await Product.selectId(items[i].id_product);
                    let priceProduct = product.price -(product.price * product.discount/100);
                    let order_dettail = await Orders.addOrderDetail(order.id_order, items[i].id_product, items[i].quantity,priceProduct);
                    let item = await Cart.selectIdItem(cart.id_cart, items[i].id_product);
                    await Cart.deleteCartItem(item.id_item);
                    order_details.push(order_dettail);
                }
                order['detail'] = order_details;
                return res.status(200).json({
                    message: 'them hoa don thanh cong',
                    data : order
                })
            }
            else{
                return res.status(400).json({
                    message: 'voucher khong ton tai',
                })
            }
            
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

//nhân viên sửa đổi trạng thái hóa đơn
router.put('/:id_order/:status', Auth.authenGTModer, async (req, res, next) => {
    try {

        let id_account = Auth.tokenData(req).id_account;
        let employee = await Employee.selectInforByIdAccount(id_account);
        let id_order = req.params.id_order;
        let status = req.params.status;

        let orderExist = await Orders.hasId(id_order);
        if(orderExist){
            if(status == 1){
                let order_details = await Orders.getOrderDetailByIdOrder(id_order);
                let quantityProduct =[];
                for (let i = 0; i < order_details.length; i++){
                    let product = await Product.selectId(order_details[i].id_product);
                    let quantity = +product.quantity - +order_details[i].quantity;
                    console.log(quantity);
                    if(quantity< 0){
                        return res.status(400).json({
                            message: `Số lượng sản phẩm ${product.name_product} trong kho không đủ`,
                        }) 
                    }
                    quantityProduct.push(quantity)                    
                }
                console.log(quantityProduct);

                for(let i = 0; i < order_details.length; i++){
                    console.log(quantityProduct[i]);
                    if(quantityProduct[i] == 0) await Product.updateQuantity(order_details[i].id_product, 0)
                    else await Product.updateQuantity(order_details[i].id_product, quantityProduct[i])
                }

             }
            let order = await Orders.updateStatus(id_order, employee.id_employee, status);

            return res.status(200).json({
                message: 'cập nhật trạng thái hóa đơn thành công',
                data : order
            }) 
        }else{
            return res.status(400).json({
                message: 'hóa đơn không tồn tại'
            }) 
        }
        

    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: 'Something wrong'
        })
    }

})

//Xóa order (khách hàng thực hiện khi đơn hàng chưa đc nv xác nhận)
router.delete('/:id_order', Auth.authenGTUser, async (req, res, next) => {
    try {

        let id_account = Auth.tokenData(req).id_account;
        let id_order = req.params.id_order;

        let checkOrderAccount = await Orders.hasOrderAccount(id_account, id_order);
        if(checkOrderAccount){
            let order_details = await Orders.getOrderDetailByIdOrder(id_order);
            for (let od_detail of order_details){
                await Orders.deleteOrderDetail(od_detail.id_order, od_detail.id_product);
            }
            await Orders.deleteOrder(id_order);
            return res.status(400).json({
                message: 'Xóa hóa đơn thành công'
            })
        }else{
            return res.status(400).json({
                message: 'Không thể xóa hóa đơn này'
            })
        }
        

    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: 'Something wrong'
        })
    }

})

// lấy ds order_tail của 1 order
router.get('/:id_order/detail', Auth.authenGTUser, async (req, res, next) => {
    try {

        let id_account = Auth.tokenData(req).id_account;
        let id_order = req.params.id_order;

        let order_details = await Orders.getOrderDetailByIdOrder(id_order);
        let data =[];
        for (let od_detail of order_details){
            let product = await Product.selectId(od_detail.id_product);
            od_detail['product'] = product;
            data.push(od_detail);
        }
        
        return res.status(200).json({
            message: 'lấy ds thành công',
            data: data
        })
        

    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: 'Something wrong'
        })
    }

})

// lấy ds order của 1 tài khoản
router.get('/my-order', Auth.authenGTUser, async (req, res, next) => {
    try {

        let id_account = Auth.tokenData(req).id_account;

        let orders = await Orders.getOrders(id_account);
        let data =[];
        for (let od of orders){
            let order_details = await Orders.getOrderDetailByIdOrder(od.id_order);
            let order =[];
            for (let od_detail of order_details){
                let product = await Product.selectId(od_detail.id_product);
                od_detail['name_product'] = product.name_product;
                order.push(od_detail);
            }
            od['detail'] = order;
            data.push(od);
        }
        
        return res.status(200).json({
            message: 'lấy ds thành công',
            data: data
        })
        

    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: 'Something wrong'
        })
    }

})

// lấy ds order theo trạng thái
router.get('/status/:status', Auth.authenGTModer, async (req, res, next) => {
    try {

        let status = req.params.status;
        

        let orders = await Orders.getListOrderStatus(status);
        let data =[];
        for (let od of orders){
            let order_details = await Orders.getOrderDetailByIdOrder(od.id_order);
            let order =[];
            for (let od_detail of order_details){
                let product = await Product.selectId(od_detail.id_product);
                od_detail['name_product'] = product.name_product;
                order.push(od_detail);
            }
            od['detail'] = order;
            data.push(od);
        }
        
        return res.status(200).json({
            message: 'lấy ds thành công',
            data: data
        })
        

    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: 'Something wrong'
        })
    }

})

//lấy ds order đã xác nhận theo tháng
router.get('/year/:year/month/:month', Auth.authenGTModer, async (req, res, next) => {
    try {

        let {year, month} = req.params;
        let nextMonth = +month +1;
        let dateStart = year + "/"+ month +"/01";
        let dateEnd = year + "/"+ nextMonth+"/01";

        let orders = await Orders.getListOrderByMonth(dateStart, dateEnd);
        let data =[];
        for (let od of orders){
            let order_details = await Orders.getOrderDetailByIdOrder(od.id_order);
            let order =[];
            for (let od_detail of order_details){
                let product = await Product.selectId(od_detail.id_product);
                od_detail['name_product'] = product.name_product;
                order.push(od_detail);
            }
            od['detail'] = order;
            data.push(od);
        }
        
        return res.status(200).json({
            message: 'lấy ds thành công',
            data: data
        })
        

    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: 'Something wrong'
        })
    }

})

module.exports =router;