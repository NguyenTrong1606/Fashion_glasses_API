const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const saltRounds = 10;

const Auth = require('../../../auth');
const Account = require('../module/account');
const Customer  = require('../module/customer');
const Cart  = require('../module/cart');
const MyDrive = require('../../../drive');


/**
 * Thêm 1 tài khoản thường
 * @body        full_name, email, phone_number, account_name, password, gender, address
 * @permission  Ai cũng có thể thực thi
 * @return      201: Tạo thành công, trả về id vừa được thêm
 *              400: Thiếu thông tin đăng ký
 */
 router.post('/', async (req, res, next) => {
    try {
        var { full_name, email, phone_number, account_name, password, gender, address } = req.body;

        if (account_name && full_name && email && password && phone_number) {
            let role = 0;
            let status = 0;
            bcrypt.hash(password, saltRounds, async (err, hash) => {
                password = hash;
                if (err) {
                    console.log(err);
                    return res.sendStatus(500);
                }

                let accountNameExists = await Account.hasByAccountName(account_name);
                if (accountNameExists) {
                    return res.status(400).json({
                        message: 'Tên tài khoản đã tồn tại!'
                    })
                }

                let emailExists = await Customer.hasEmail(email);
                if (emailExists) {
                    return res.status(400).json({
                        message: 'Email này đã được sử dụng!'
                    })
                }

                let phoneNumberExists = await Customer.hasPhoneNumber(phone_number);
                if (phoneNumberExists) {
                    return res.status(400).json({
                        message: 'SĐT này đã được sử dụng!'
                    })
                }

                let avatar = '';
                let acc = {account_name, password, role, status};
                let id_account = await Account.add(acc);
                let customer ={full_name, email, phone_number, avatar, gender, address, id_account}
                let insertCustomer = await Customer.add(customer);
                let insertCart = await Cart.add(id_account);

                res.status(201).json({
                    message: 'Tạo mới tài khoản thành công',
                    data: id_account
                });
            });

        } else {
            res.status(400).json({
                message: 'Thiếu dữ liệu để tạo tài khoản'
            })
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({
            message: 'Something wrong'
        })
    }

});

/**
 * Thay đổi thông tin tài khoản, chỉ có thể đổi của chính bản thân
 * 
 * @permission  phải đăng nhập thì mới được thực thi (user trở lên)
 * @return      401: Không được sửa thông tin của người khác
 *              400: Thiếu thông tin bắt buộc
 *              200: Cập nhật thành công, trả về tài khoản vừa cập nhật
 */
router.put('/change-infor', Auth.authenGTUser, async (req, res, next) => {
    try {
        var {full_name, gender, address} = req.body;


        let accId = Auth.tokenData(req).id_account;
        let user = await Customer.selectInforByIdAccount(accId);
        let customerId = user.id_customer;

        

        if (full_name) {
            let avatarPath = '';
            if (req.files && req.files.avatar) {
                let image = req.files.avatar;

                //update avt mới
                let idIMGDrive = await MyDrive.uploadImage(image, "avatar_" + customerId);
                if (!idIMGDrive) {
                    return res.status(400).json({
                        message: "Lỗi upload image"
                    })
                }
                let oldAvatarId = MyDrive.getImageId(user.avatar);
                console.log(oldAvatarId)
                await MyDrive.deleteFiles(oldAvatarId);

                avatarPath = "https://drive.google.com/uc?export=view&id=" + idIMGDrive;
            }
            else{
                console.log('lỗi file');
            }
            let result = await Customer.update(customerId, full_name, gender, address, avatarPath);

            return res.status(200).json({
                message: 'Cập nhật thông tin tài khoản thành công',
                data: result
            })
        } else {
            return res.status(400).json({
                message: 'full_name ko được để trống'
            })
        }


    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: 'Something wrong'
        })
    }

})

module.exports = router;