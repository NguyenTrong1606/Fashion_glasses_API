const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const nodemailer = require("nodemailer");


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
            message: 'Lấy thông tin tài khoản thành công',
            data: data
        });

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
})

//lấy thông tin cá nhân của tài khoản theo id
router.get('/:id_account', Auth.authenGTModer, async (req, res, next) => {
    try {
        let id_account = req.params.id_account

        let acc = await Account.selectId(id_account)

        

        if(acc.role == 0){
            data = await Account.selectInforCustomer(id_account);
        }
        else{
            data = await Account.selectInforEmployee(id_account);
        }

        return res.status(200).json({
            message: 'Lấy thông tin tài khoản thành công',
            data: data
        });

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
})

//thay dổi địa chỉ
router.put('/change-address', Auth.authenGTUser, async (req, res, next) => {
    try {
        let id_account = Auth.tokenData(req).id_account;
        let role = Auth.tokenData(req).role;
        let address = req.body.address

        if(role == 0){
            await Account.updateAddressCustomer(id_account, address)
            data = await Account.selectInforCustomer(id_account);
        }
        else{
            await Account.updateAddressEmployee(id_account, address)
            data = await Account.selectInforEmployee(id_account);
        }

        return res.status(200).json({
            message: 'Cập nhật địa chỉ giao hàng thành công',
            data: data
        });

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
})


const createCode = () => {
    var result = '';
    for (var i = 0; i < 6; i++) {
        result += String(Math.floor(Math.random() * 10));
    }
    return result;
}
router.post('/forget/password', async (req, res) => {
    try {
        const { account_name } = req.body
        const code = createCode()



        const existAccount = await Account.selectByAccountName(account_name)
        
        if (!account_name) {
            return res.status(400).json({
                message: 'Tên tài khoản không được để trống'
            });
        }
        if(!existAccount){
            return res.status(404).json({
                message: 'Không tồn tại tài khoản này'
            });
        } 
        else {
            let inforUser

            if(existAccount.role === 0){
                inforUser = await Account.selectInforCustomer(existAccount.id_account)
            }
            else{
                inforUser = await Account.selectInforEmployee(existAccount.id_account)
            }


            let transporter = nodemailer.createTransport({
                service: 'hotmail',
                auth: {
                    user: process.env.AUTH_EMAIL, // generated ethereal user
                    pass: process.env.AUTH_PASS, // generated ethereal password
                },
            });

            await transporter.sendMail({
                from: process.env.AUTH_EMAIL, // sender address
                to: `${inforUser.email}`, // list of receivers
                subject: "Lấy lại mật khẩu Fashion Glasses", // Subject line
                html: `<h3><b>Xin chao ${inforUser.full_name}</b></h3>
                        <p>Đây là mã code của bạn:</p>
                        <h2>&emsp;Code: ${code}</h2>
                        <p>Quản lý Fashion Glasses</p>
                `, // html body
            })

            const isId = await Account.isHasIdVerification(existAccount.id_account)

            if (isId) {
                await Account.updateVerification(existAccount.id_account, code)
            } else {
                await Account.insertVerification(existAccount.id_account, code)
            }

            return res.status(200).json({
                message: 'Đã gửi mã xác nhận',
            });
        }
    } catch (error) {
        console.log(error);
        return res.sendStatus(500)
    }
})

router.post('/forget/verify', async (req, res) => {
    try {
        const { account_name, code } = req.body
        const existAccount = await Account.selectByAccountName(account_name)

        if (!account_name || !code) {
            return res.status(400).json({
                message: 'Thiếu dữ liệu gửi về'
            });
        }


        if (!existAccount) {
            return res.status(404).json({
                message: 'Không tồn tại tài khoản này'
            });
        }

        const existEmailAndCode = await Account.isHasCodeAndEmail(existAccount.id_account, code)
        
        if (!existEmailAndCode) {
            return res.status(404).json({
                message: 'tên tài khoản và code không trùng nhau'
            });
        }

        const isValidCode = await Account.checkTimeCode(existAccount.id_account)

        if (!isValidCode) {
            return res.status(404).json({
                message: 'Code hết hạn '
            });
        }

        return res.status(200).json({
            message: 'Mã code hợp lệ',
        })
    } catch (error) {
        console.log(error);
        return res.sendStatus(500)
    }
})


router.post('/forget/change', async (req, res,next) => {
    try {
        let { account_name, code, new_password } = req.body
        const existAccount = await Account.selectByAccountName(account_name)

        if (!account_name || !code || !new_password) {
            return res.status(400).json({
                message: 'Thiếu dữ liệu gửi về'
            });
        }


        if (!existAccount) {
            return res.status(404).json({
                message: 'Không tồn tại tài khoản này'
            });
        }

        const existEmailAndCode = await Account.isHasCodeAndEmail(existAccount.id_account, code)
        if (!existEmailAndCode) {
            return res.status(404).json({
                message: 'Email và code không trùng nhau'
            });
        }
        const isValidCode = await Account.checkTimeCode(existAccount.id_account)
        if (!isValidCode) {
            return res.status(404).json({
                message: 'Code hết hạn '
            });
        }
        bcrypt.hash(new_password, saltRounds, async (err, hash) => {
            new_password = hash;
            await Account.updatePassword(existAccount.id_account, new_password);
            await Account.deleteAccountVerification(existAccount.id_account)


            return res.status(200).json({
                message: 'Thay đổi mật khẩu thành công',
            })
        });


    } catch (error) {
        console.log(error);
        return res.sendStatus(500)
    }
})


module.exports = router;