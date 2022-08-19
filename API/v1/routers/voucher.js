const express = require('express');
const router = express.Router();

const Auth = require('../../../auth');

const Voucher = require('../module/voucher');
const MyDrive = require('../../../drive');
const Account = require('../module/account');

// Thêm voucher mới
router.post('/', Auth.authenGTModer, async (req, res, next) => {
    try {

        let { title, quantity, discount, date_start, date_end, description } = req.body;

        if (title && quantity && discount && date_start && date_end && description) { 
            //Kiểm tra  tên voucher có tồn tại không
            let existTitle = await Voucher.hasTitle(title);
            if (existTitle) {
                return res.status(400).json({
                    message: 'Mã giảm giá đã tồn tại'
                })
            }
            else {
                let dateNow = new Date();
                let dateStart = new Date(date_start);
                let dateEnd = new Date(date_end);
                if(dateStart < dateNow){
                    return res.status(400).json({
                        message: 'Ngày bắt đầu phải lớn hơn hiện tại',
                    })
                }

                if(dateStart >= dateEnd){
                    return res.status(400).json({
                        message: 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc',
                    })
                }

                if(discount<= 0 || discount >100){
                    return res.status(400).json({
                        message: "discount phải là số nguyên 0 < discount <=100"
                    })
                }
                
                    // Thêm voucher
                let voucherResult = await Voucher.addVoucher(title, quantity, discount, date_start, date_end, description);
            
                    return res.status(200).json({
                        message: 'Thêm sản phẩm thành công',
                        data: voucherResult
                    })
            }
        } else {
            res.status(400).json({
                message: 'Không được để trống dữ liệu'
            })
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

//cập nhật
router.put('/:id_voucher', Auth.authenGTModer, async (req, res, next) => {
    try {

        let id_voucher = req.params.id_voucher;
        let {quantity, description} = req.body;
        let voucherExist = await Voucher.hasId(id_voucher);
        if(voucherExist){
            if(quantity !=="" && description){
                    
                    let voucherUpdate = await Voucher.updateVoucher(id_voucher, quantity, description);
                
                    return res.status(200).json({
                        message: 'cập nhật voucher thành công',
                        data: voucherUpdate
                    })
                }
                else{
                    
                        return res.status(400).json({
                            message: 'không được để trống dữ liệu',
                        })
                    
                }
            }else{
                 return res.status(400).json({
                    message: 'mã giảm giá không tồn tại'
                })
            }     

    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: 'Something wrong'
        })
    }

})

//xóa voucher
router.delete('/delete/:id_voucher', Auth.authenGTModer, async (req, res, next) => {
    try {
        let idVoucher = req.params.id_voucher;
        let voucherExist = await Voucher.hasId(idVoucher);
        if(voucherExist){
            let existVoucherInAccount = await Voucher.hasVoucherInAccountVoucher(idVoucher);
            if(!existVoucherInAccount){

                await Voucher.deleteVoucher(idVoucher);
                res.status(200).json({
                    message: 'Xóa mã khuyến mãi thành công',
                })
            }
            else{
                return res.status(400).json({
                    message: 'mã khuyến mãi này không thể xóa!'
                })
            }
        }
        else{
            return res.status(400).json({
                message: 'mã khuyến mãi này không tồn tại!'
            })
        }
        

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

//lấy ra ds voucher có thể dùng của 1 tài khoản
router.get('/my-voucher', Auth.authenGTUser,  async (req, res, next) => {
    try {

        let account_id = Auth.tokenData(req).id_account;
            let vouchers =  await Voucher.getListVoucherOfAccount(account_id);
            let data = [];
            for(let i = 0; i < vouchers.length; i++ ){
                let statusVoucher = await Voucher.check(vouchers[i].id_voucher);
                if(statusVoucher) {
                    let myVoucher = await Voucher.selectId(vouchers[i].id_voucher);
                    data.push(myVoucher);
                }
            }
            return res.status(200).json({
                message:'lấy ds sản phẩm thành công',
                data: data
            })
        
        
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})


//lấy ra ds voucher có thể thu thập
router.get('/list-voucher', Auth.authenGTUser,  async (req, res, next) => {
    try {

        let account_id = Auth.tokenData(req).id_account;
        let vouchers =  await Voucher.getListVoucher();
        let data = [];
        for(let i = 0; i < vouchers.length; i++ ){
            let statusVoucher = await Voucher.hasVoucherOfAcc(account_id,vouchers[i].id_voucher);
            if(!statusVoucher) {
                let myVoucher = await Voucher.selectId(vouchers[i].id_voucher);
                data.push(myVoucher);
            }
        }
        return res.status(200).json({
            message:'lấy ds voucher thành công',
            data: data
        })
        
        
        
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

//lấy all voucher của tài khoản

router.get('/my-voucher/all', Auth.authenGTUser,  async (req, res, next) => {
    try {

        let account_id = Auth.tokenData(req).id_account;
            let idVouchers =  await Voucher.getAllVoucherOfAccount(account_id);
            let data = []
            for(let idVoucher of idVouchers){
                let voucher = await Voucher.selectId(idVoucher.id_voucher)
                data.push(voucher)
            }
            
            return res.status(200).json({
                message:'lấy ds sản phẩm thành công',
                data: data
            })
        
        
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

//lấy all voucher 

router.get('/all', Auth.authenGTModer,  async (req, res, next) => {
    try {
            let data =  await Voucher.getAllVoucher();
            
            
            return res.status(200).json({
                message:'lấy ds sản phẩm thành công',
                data: data
            })
        
        
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})





module.exports =router;