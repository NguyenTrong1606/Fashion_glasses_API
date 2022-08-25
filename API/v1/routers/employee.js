const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const Auth = require('../../../auth');
const nodemailer = require("nodemailer");
const Account = require('../module/account');
const Employee = require('../module/employee');
const Cart  = require('../module/cart');
const MyDrive = require('../../../drive');
/**
 * Thêm 1 tài khoản employee
 * @body        full_name, email, phone_number, identification, date_of_birth, account_name, password, gender, address,
 * @permission  chỉ có admin
 * @return      201: Tạo thành công, trả về id vừa được thêm
 *              400: Thiếu thông tin đăng ký
 */
 router.post('/', Auth.authenAdmin, async (req, res, next) => {
    try {
        let { full_name, email, phone_number, identification, date_of_birth, account_name, password, gender, address } = req.body;
        let pw = password

        if (account_name && full_name && email && password && phone_number && identification && date_of_birth && gender && address) {
            let role = 1;
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

                let emailExists = await Employee.hasEmail(email);
                if (emailExists) {
                    return res.status(400).json({
                        message: 'Email này đã được sử dụng!'
                    })
                }

                let phoneNumberExists = await Employee.hasPhoneNumber(phone_number);
                if (phoneNumberExists) {
                    return res.status(400).json({
                        message: 'SĐT này đã được sử dụng!'
                    })
                }

                let identificationExists = await Employee.hasIdentification(identification);
                if (identificationExists) {
                    return res.status(400).json({
                        message: 'CCCD này đã được sử dụng!'
                    })
                }

                let avatar = '';
                let acc = {account_name, password, role, status};
                let id_account = await Account.add(acc);
                let employee ={full_name, email, phone_number, identification, date_of_birth, avatar, gender, address, id_account}
                let transporter = nodemailer.createTransport({
                    service: 'hotmail',
                    auth: {
                        user: process.env.AUTH_EMAIL, // generated ethereal user
                        pass: process.env.AUTH_PASS, // generated ethereal password
                    },
                });
    
                await transporter.sendMail({
                    from: process.env.AUTH_EMAIL, // sender address
                    to: `${email}`, // list of receivers
                    subject: "Gửi mật khẩu Fashion Glasses", // Subject line
                    html: `<h3><b>Xin chao ${full_name}</b></h3>
                            <p>Đây là mật khẩu của bạn:</p>
                            <h2>&emsp;Password: ${pw}</h2>
                            <p>Quản lý Fashion Glasses</p>
                    `, // html body
                })
                let insertEmployee = await Employee.add(employee);
                let insertCart = await Cart.add(id_account);
                res.status(201).json({
                    message: 'Tạo mới tài khoản thành công',
                    data: id_account
                });
            });

        } else {
            res.status(400).json({
                message: 'Tài khoản nhân viên không được để trống!'
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
 router.put('/change-infor/', Auth.authenGTModer, async (req, res, next) => {
    try {
        var {phone_number, address} = req.body;

        let accId = Auth.tokenData(req).id_account;
        let user = await Employee.selectInforByIdAccount(accId);
        let employeeId = user.id_employee;

        

        if (phone_number && address) {
            if(phone_number === user.phone_number){
                let avatarPath = '';
                if (req.files && req.files.avatar) {
                    let image = req.files.avatar;

                    //update avt mới
                    let idIMGDrive = await MyDrive.uploadImage(image, "avatar_empl_" + employeeId);
                    if (!idIMGDrive) {
                        return res.status(400).json({
                            message: "Lỗi upload image"
                        })
                    }
                    let oldAvatarId = MyDrive.getImageId(user.avatar);
                    await MyDrive.deleteFiles(oldAvatarId);

                    avatarPath = "https://drive.google.com/uc?export=view&id=" + idIMGDrive;
                }
                else{
                    console.log('ko có file tải lên');
                }
                let result = await Employee.update(employeeId, phone_number, address, avatarPath);

                return res.status(200).json({
                    message: 'Cập nhật thông tin tài khoản thành công',
                    data: result
                })
            }
            else{
                let phoneNumberExists = await Employee.hasPhoneNumber(phone_number);
                if (phoneNumberExists) {
                    return res.status(400).json({
                        message: 'SĐT này đã được sử dụng!'
                    })
                }
                let avatarPath = '';
                    if (req.files && req.files.avatar) {
                        let image = req.files.avatar;

                        //update avt mới
                        let idIMGDrive = await MyDrive.uploadImage(image, "avatar_empl_" + employeeId);
                        if (!idIMGDrive) {
                            return res.status(400).json({
                                message: "Lỗi upload image"
                            })
                        }
                        let oldAvatarId = MyDrive.getImageId(user.avatar);
                        await MyDrive.deleteFiles(oldAvatarId);


                        avatarPath = "https://drive.google.com/uc?export=view&id=" + idIMGDrive;
                    }
                    else{
                        console.log('ko có file tải lên');
                    }
                    let result = await Employee.update(employeeId, phone_number, address, avatarPath);

                    return res.status(200).json({
                        message: 'Cập nhật thông tin tài khoản thành công',
                        data: result
                    })

            }
            
        } else {
            return res.status(400).json({
                message: 'Ko được để trống thông tin'
            })
        }


    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: 'Something wrong'
        })
    }

})


module.exports =router;