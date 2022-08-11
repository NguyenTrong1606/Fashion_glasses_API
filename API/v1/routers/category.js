const express = require('express');
const router = express.Router();
const Category = require('../module/category');

const Auth = require('../../../auth');

/**
 * Thêm 1 category
 * @body        name_category
 * @permission  employee
 * @return      201: Tạo thành công, trả về id vừa được thêm
 *              400: Thiếu thông tin đăng ký
 */
 router.post('/', Auth.authenGTModer, async (req, res, next) => {
    try {
        let { name_category } = req.body;

        if (name_category) {
                let nameCategoryExists = await Category.hasByNameCategory(name_category);
                if (nameCategoryExists) {
                    return res.status(400).json({
                        message: 'Tên danh mục đã tồn tại!'
                    })
                }
                let insertCategory = await Category.add(name_category);

                res.status(201).json({
                    message: 'Tạo danh mục mới thành công',
                    data: insertCategory
                });
        } else {
            res.status(400).json({
                message: 'Tên danh mục không được để trống!'
            })
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({
            message: 'Something wrong'
        })
    }

});

//Sửa Danh mục
router.put('/edit/:id_category', Auth.authenGTModer, async (req, res, next) => {
    try {
        let idCategory = req.params.id_category;
        let name_category = req.body.name_category;

        if(name_category){
            let nameCategoryExists = await Category.hasByNameCategory(name_category);
            if(nameCategoryExists){
                return res.status(400).json({
                    message: 'Tên danh mục đã tồn tại!'
                })
            }

            let updateCategory = await Category.updateCategory(idCategory, name_category);
            res.status(200).json({
                message: 'Chỉnh sửa thành công',
                data: updateCategory
            })
        }
        else{
            return res.status(400).json({
                message: 'Tên danh mục không được để trống!'
            })
        }
        
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

//Xóa Danh mục
router.delete('/delete/:id_category', Auth.authenGTModer, async (req, res, next) => {
    try {
        let idCategory = req.params.id_category;
        let existProductbyCategory = await Category.hasProductInCategory(idCategory);
        if(!existProductbyCategory){

            await Category.deleteCategory(idCategory);
            res.status(200).json({
                message: 'Xóa danh mục thành công',
            })
        }
        else{
            return res.status(400).json({
                message: 'Danh mục đã có sản phẩm không thể xóa!'
            })
        }

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.get('/list',  async (req, res, next) => {
    try {

        let listCategory =  await Category.getListCategory();
        return res.status(200).json({
            message:'lấy danh mục sản phẩm thành công',
            data: listCategory
        })
        
        
        
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

module.exports =router;