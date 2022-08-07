const express = require('express');
const router = express.Router();

const Auth = require('../../../auth');

const Voucher = require('../module/voucher');
const Account = require('../module/account');
const AccountVoucher = require('../module/account_voucher');

//thu thập voucher
router.post('/:id_voucher', Auth.authenGTUser, async (req, res, next) => {
    try {

        let id_account = Auth.tokenData(req).id_account;
        let id_voucher = req.params.id_voucher;
        let sl = await Voucher.getSL1Voucher(id_voucher);
        console.log(sl.quantity);

        
        if(sl.quantity > 0){
            let checkExist = await AccountVoucher.has(id_account, id_voucher);
            if(!checkExist){
                let accVoucher = await AccountVoucher.add(id_account, id_voucher);
                if(sl.quantity-1 == 0){
                    await Voucher.updateSL0(id_voucher);
                }
                else await Voucher.updateSL(id_voucher, sl.quantity-1);
                
                
                return res.status(200).json({
                    message: 'Thu thập voucher thành công'
                })
            }
            else{
                return res.status(400).json({
                    message: 'Bạn đã sở hữu mã này ko thể thu thập lần 2'
                })
            }
            

        }else{
            return res.status(400).json({
                message: 'SL voucher đã hết bạn ko thể thu thập'
            })
        }

        
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})



module.exports =router;