const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const saltRounds = 10;


const router = express.Router();
const Account = require('../module/account')

const Auth = require('../../../auth');
/**
 * Đăng nhập
 * @body   accountName, password
 * @return  200: Đăng nhập thành công
 *          400: Sai thông tin đăng nhập    
 *          404: Thiếu thông tin đăng nhập
 */
 router.post('/login', async (req, res, next) => {
    try {
        let account_name = req.body.account_name;
        let password = req.body.password;


        if (!(account_name && password)) {
            return res.status(404).json({
                message: 'Thiếu thông tin đăng nhập',
                accountName: account_name,
                pass: password
            })
        }

        let exist = await Account.hasByAccountName(account_name);
        if (exist) {
            let acc = await Account.selectByAccountName(account_name);
            let match = await bcrypt.compare(password, acc.password);

            if (acc.status == 1) {
                return res.status(403).json({
                    message: 'Tài khoản này đã bị vô hiệu hóa!',
                });
            }

            if (match) {
                var data = {
                    "id_account": acc.id_account,
                    "account_name": acc.account_name,
                    "role": acc.role,
                    "status": acc.status,
                }
                const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '3d' });

                return res.status(200).json({
                    message: 'đăng nhập thành công',
                    accessToken: accessToken,
                    data: data
                });
            } else {
                return res.status(400).json({
                    message: 'Mật khẩu hoặc tài khoản không đúng 1'
                });
            }
        } else {
            return res.status(400).json({
                message: 'Mật khẩu hoặc tài khoản không đúng',
            });
        }
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
})

/**
 * Đổi password của cá nhân
 * @body        old_password, new_password
 * @permission  Người đang đăng nhập
 * @return      200: Đổi thành công
 *              400: Thiếu dữ liệu
 *              403: Mật khẩu cũ không chính xác
 */
 router.put('/change/password', Auth.authenGTUser, async (req, res, next) => {
    try {
        //console.log(Auth.tokenData(req));
        let new_password = req.body.new_password;
        let old_password = req.body.old_password;
        let id_account = Auth.tokenData(req).id_account;
        //console.log(id_account);

        if (old_password !== "") {
            let acc = await Account.selectId(id_account);
            //console.log(acc);
            acc = await Account.selectByAccountName(acc.account_name);
            let match = await bcrypt.compare(old_password, acc.password);

            if (match) {
                if (new_password !== "") {
                    bcrypt.hash(new_password, saltRounds, async (err, hash) => {
                        new_password = hash;
                        let changePassword = await Account.updatePassword(id_account, new_password);

                        return res.status(200).json({
                            message: 'Thay đổi mật khẩu thành công',
                        })
                    });
                } else {
                    return res.status(400).json({
                        message: 'Mật khẩu mới không được bỏ trống'
                    });
                }
            } else {
                return res.status(403).json({
                    message: 'Mật khẩu cũ không chính xác!'
                })

            }

        } else {
            return res.status(400).json({
                message: 'Chưa nhập mật khẩu cũ!'
            })
        }

    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
});

/**
 * Lấy ds tài khoản employee
 * @body        
 * @permission  Admin
 * @return      200: Lấy ds thành công
 *             500: lỗi ko xác định
 */

 router.get('/employee', Auth.authenAdmin, async (req, res, next) => {
    try {
        let data = await Account.selectListAccountByRole(1);

        return res.status(200).json({
            message: 'Lấy danh sách tài khoản thành công',
            data: data
        });

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
})


//lấy thông tin cá nhân của tài khoản
router.get('/information', Auth.authenGTUser, async (req, res, next) => {
    try {
        let id_account = Auth.tokenData(req).id_account;
        let role = Auth.tokenData(req).role;

        if(role == 0){
            data = await Account.selectInforCustomer(id_account);
        }
        else{
            data = await Account.selectInforEmployee(id_account);
        }

        return res.status(200).json({
            message: 'thông tin tài khoản thành công',
            data: data
        });

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
})

module.exports = router;