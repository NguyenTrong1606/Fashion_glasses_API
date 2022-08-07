const express = require('express');
const router = express.Router();

const Brand = require('../module/brand');

const Auth = require('../../../auth');

/**
 * Thêm 1 brand
 * @body        name_brand
 * @permission  employee
 * @return      201: Tạo thành công, trả về id vừa được thêm
 *              400: Thiếu thông tin đăng ký
 */
 router.post('/', Auth.authenGTModer, async (req, res, next) => {
    try {
        let { name_brand } = req.body;

        if (name_brand) {
                let nameBrandExists = await Brand.hasByNameBrand(name_brand);
                if (nameBrandExists) {
                    return res.status(400).json({
                        message: 'Tên nhãn hiệu đã tồn tại!'
                    })
                }
                let insertBrand = await Brand.add(name_brand);

                res.status(201).json({
                    message: 'Tạo nhãn hiệu mới thành công',
                    data: insertBrand
                });
        } else {
            res.status(400).json({
                message: 'Tên nhãn hiệu không được để trống!'
            })
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({
            message: 'Something wrong'
        })
    }

});

//Sửa nhãn hiệu
router.put('/edit/:id_brand', Auth.authenGTModer, async (req, res, next) => {
    try {
        let idBrand = req.params.id_brand;
        let name_brand = req.body.name_brand;

        if(name_brand){
            let nameBrandExists = await Brand.hasByNameBrand(name_brand);
            if(nameBrandExists){
                return res.status(400).json({
                    message: 'Tên nhãn hiệu đã tồn tại!'
                })
            }

            let updateBrand = await Brand.updateBrand(idBrand, name_brand);
            res.status(200).json({
                message: 'Chỉnh sửa thành công',
                data: updateBrand
            })
        }
        else{
            return res.status(400).json({
                message: 'Tên nhãn hiệu không được để trống!'
            })
        }
        
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

//Xóa nhãn hiệu
router.delete('/delete/:id_brand', Auth.authenGTModer, async (req, res, next) => {
    try {
        let idBrand = req.params.id_brand;
        let existProductbyBrand = await Brand.hasProductInBrand(idBrand);
        if(!existProductbyBrand){

            await Brand.deleteBrand(idBrand);
            res.status(200).json({
                message: 'Xóa nhãn hiệu thành công',
            })
        }
        else{
            return res.status(400).json({
                message: 'nhãn hiệu đã có sản phẩm không thể xóa!'
            })
        }

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

module.exports =router;