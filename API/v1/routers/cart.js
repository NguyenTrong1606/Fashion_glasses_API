const express = require('express');
const router = express.Router();
const Auth = require('../../../auth');
const Cart = require('../module/cart');
const Product = require('../module/product');


//Thêm sản phẩm vào giở hàng
router.post('/:id_product/:quantity', Auth.authenGTUser, async (req, res, next) => {
    try {
        let id_account = Auth.tokenData(req).id_account;
        let id_product = req.params.id_product;
        let quantity = req.params.quantity;

        let cart = await Cart.selectIdCart(id_account);

        let product = await Product.selectId(id_product);
        let cartItemExist = await Cart.hasCartItem(cart.id_cart, id_product);
        if(cartItemExist){
            return res.status(400).json({
                message: 'Sản phẫm này đã đc cho vào giỏ hàng trước đây'
            })
        }
        if(quantity > product.quantity){
            return res.status(400).json({
                message: 'Số lượng sản phẩm còn lại trong kho không đủ'
            })
        }else{
            let cart_item = await Cart.addCartItem(cart.id_cart, id_product, quantity);
            return res.status(200).json({
                message: 'Thêm sản phẩm vào giỏ hàng thành công',
                data: cart_item
            })
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

//Sửa số lượng của sản phẩm trong giỏ hàng
router.put('/:id_product/:quantity', Auth.authenGTUser, async (req, res, next) => {
    try {

        let id_account = Auth.tokenData(req).id_account;
        let id_product = req.params.id_product;
        let quantity = req.params.quantity;

        let cart = await Cart.selectIdCart(id_account);

        let product = await Product.selectId(id_product);
        let img = await Product.getAllImgById(id_product)
            if(img){
                product['img'] = img[1]
            }
        let cartItemExist = await Cart.hasCartItem(cart.id_cart, id_product);
        if(cartItemExist){
            if(quantity > product.quantity){
                return res.status(400).json({
                    message: 'Số lượng sản phẩm còn lại trong kho không đủ'
                })
            }else{
                let item = await Cart.selectIdItem(cart.id_cart, id_product);
                let cart_item = await Cart.updateCartItem(item.id_item, quantity);
                cart_item['product'] = product
                return res.status(200).json({
                    message: 'cập nhật SL sản phẩm trong giỏ hàng thành công',
                    data: cart_item
                })
            }
        }
        else{
            return res.status(400).json({
                message: 'cart_item không tồn tại'
            })
        }
        

    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: 'Something wrong'
        })
    }

})

//xóa sản phẩm khỏi giỏ giỏ hàng
router.delete('/:id_product/delete', Auth.authenGTUser, async (req, res, next) => {
    try {

        let id_account = Auth.tokenData(req).id_account;
        let id_product = req.params.id_product;

        let cart = await Cart.selectIdCart(id_account);
        let cartItemExist = await Cart.hasCartItem(cart.id_cart, id_product);
        if(cartItemExist){
            let item = await Cart.selectIdItem(cart.id_cart, id_product);

            await Cart.deleteCartItem(item.id_item);
            
            
            return res.status(200).json({
                message: 'xóa sản phẩm giỏ hàng thành công',
            })

        }
        else{
            return res.status(400).json({
                message: 'cart_item không tồn tại'
            })
        }
        

    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: 'Something wrong'
        })
    }

})

//lấy ds sản phẩm trong giỏ hàng
router.get('/', Auth.authenGTUser, async (req, res, next) => {
    try {

        let id_account = Auth.tokenData(req).id_account;

        let cart = await Cart.selectIdCart(id_account);

        let data = [];
        let items = await Cart.selectItems(cart.id_cart);
        for(let item of items){
            let product = await Product.selectId(item.id_product);
            let img = await Product.getAllImgById(product.id_product)
            if(img){
                product['img'] = img[1]
            }
            item['product'] = product;
            data.push(item);
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
//lấy 1 cartItem

router.get('/:id_product', Auth.authenGTUser, async (req, res, next) => {
    try {

        let id_account = Auth.tokenData(req).id_account;
        let id_product = req.params.id_product
        let cart = await Cart.selectIdCart(id_account);

        let item = await Cart.selectItem(cart.id_cart, id_product);
        if(item){
            let product = await Product.selectId(item.id_product);
            let img = await Product.getAllImgById(id_product)
            if(img){
                product['img'] = img[1]
            }
            item['product'] = product;
        }    
        

        
        return res.status(200).json({
            message: 'lấy Cart Item thành công',
            data: item
        })
        

    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: 'Something wrong'
        })
    }

})


module.exports =router;