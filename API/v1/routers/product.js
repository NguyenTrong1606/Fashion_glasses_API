const express = require('express');
const router = express.Router();
const Auth = require('../../../auth');

const Product = require('../module/product');
const MyDrive = require('../../../drive');

// Thêm sản phẩm mới
router.post('/', Auth.authenGTModer, async (req, res, next) => {
    try {
        if (!req.files) {
            return res.status(400).json({
                message: 'Không có file được tải lên'
            });
        }

        let image1 = req.files.img1;
        let image2 = req.files.img2;
        let image3 = req.files.img3;
        let image4 = req.files.img4;
        let image5 = req.files.img5;
        if (!image1) {
            return res.status(400).json({
                message: 'Không có file hình ảnh được tải lên'
            });
        }

        let { name_product, description, price, quantity, discount, date_discount_end, id_category, id_brand } = req.body;
        console.log(req.body)

        if (name_product && price && quantity && id_category && id_brand) { 
            //Kiểm tra  tên sản phẩm có tồn tại không
            let existNameProduct = await Product.hasNameProduct(name_product);
            if (existNameProduct) {
                return res.status(400).json({
                    message: 'Tên sản phẩm đã tồn tại'
                })
            }
            else {
                let idIMG1Drive = await MyDrive.uploadImage(image1, "img_product_" + name_product +"(1)");
                if (!idIMG1Drive) {
                    return res.status(400).json({
                        message: "Lỗi upload image"
                    })
                }
                IMG1Path = "https://drive.google.com/uc?export=view&id=" + idIMG1Drive;
                IMG2Path = "";
                IMG3Path = "";
                IMG4Path = "";
                IMG5Path = "";
                
                if(discount< 0 || discount >100){
                    return res.status(400).json({
                        message: "discount phải là số nguyên 0<= discount <=100"
                    })
                }
                if(!date_discount_end && discount){
                    return res.status(400).json({
                        message: "Nếu có discount thì phải có ngày kết thúc!"
                    })
                }
                if(image2){
                    let idIMG2Drive = await MyDrive.uploadImage(image2, "img_product_" + name_product +"(2)");
                    if (!idIMG2Drive) {
                        return res.status(400).json({
                            message: "Lỗi upload image"
                        })
                    }
                    IMG2Path = "https://drive.google.com/uc?export=view&id=" + idIMG2Drive;
                }
                if(image3){
                    let idIMG3Drive = await MyDrive.uploadImage(image3, "img_product_" + name_product +"(3)");
                    if (!idIMG3Drive) {
                        return res.status(400).json({
                            message: "Lỗi upload image"
                        })
                    }
                    IMG3Path = "https://drive.google.com/uc?export=view&id=" + idIMG3Drive;
                }
                if(image4){
                    let idIMG4Drive = await MyDrive.uploadImage(image4, "img_product_" + name_product +"(4)");
                    if (!idIMG4Drive) {
                        return res.status(400).json({
                            message: "Lỗi upload image"
                        })
                    }
                    IMG4Path = "https://drive.google.com/uc?export=view&id=" + idIMG4Drive;
                }
                if(image5){
                    let idIMG5Drive = await MyDrive.uploadImage(image5, "img_product_" + name_product +"(5)");
                    if (!idIMG5Drive) {
                        return res.status(400).json({
                            message: "Lỗi upload image"
                        })
                    }
                    IMG5Path = "https://drive.google.com/uc?export=view&id=" + idIMG5Drive;
                }


                    // Thêm sản phẩm
            let productResult = await Product.addProduct(name_product, description, price, quantity, discount, date_discount_end, id_category, id_brand);
            console.log(productResult.id_product);
            let img1 = await Product.addIMGProduct(productResult.id_product, IMG1Path);
            let img =[];
            img.push(img1)
            if(IMG2Path){
                let img2 = await Product.addIMGProduct(productResult.id_product, IMG2Path);
                img.push(img2)
            }
            if(IMG3Path){
                let img3 = await Product.addIMGProduct(productResult.id_product, IMG3Path);
                img.push(img3)
            }
            if(IMG4Path){
                let img4 = await Product.addIMGProduct(productResult.id_product, IMG4Path);
                img.push(img4)
            }
            if(IMG5Path){
                let img5 = await Product.addIMGProduct(productResult.id_product, IMG5Path);
                img.push(img4)
            }
            


                    res.status(201).json({
                        message: 'Thêm sản phẩm thành công',
                        data: {
                            product: productResult,
                            img: img
                        }
                    })
            }
        } else {
            res.status(400).json({
                message: 'Thiếu dữ liệu'
            })
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})


//lấy ds toàn bộ sản phẩm 
router.get('/all', async (req, res, next) => {
    try {
        let page = req.query.page;
        let productsID ;
        if(page)
            productsID = await Product.getListProduct(page);
        else
            productsID = await Product.getListProduct();
        

        let data = [];

        for(let i = 0; i < productsID.length; i++){
            let product = await Product.selectId(productsID[i].id_product);
            if(product.discount > 0){
                let valid = await Product.check(product.id_product);
                if(valid){
                    product = await Product.updateDiscount(productsID[i].id_product, 0);
                }
            }
            let images = [];
            let imgs = await Product.getAllImgById(product.id_product);
            
            for(let i = 0; i< imgs.length; i++){
                images.push(imgs[i].image);
            }
            product['images'] = images;

            data.push(product);
        }

        
        return res.status(200).json({
            message:'lấy ds sản phẩm thành công',
            data : data
        })
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})


//lấy 4 sản phẩm bất kif
router.get('/ramdom', async (req, res, next) => {
    try {
        let productsID  = await Product.getListProductRamdom();
        
        let data = [];

        for(let i = 0; i < productsID.length; i++){
            let product = await Product.selectId(productsID[i].id_product);
            if(product.discount > 0){
                let valid = await Product.check(product.id_product);
                if(valid){
                    product = await Product.updateDiscount(productsID[i].id_product, 0);
                }
            }
            let images = [];
            let imgs = await Product.getAllImgById(product.id_product);
            
            for(let i = 0; i< imgs.length; i++){
                images.push(imgs[i].image);
            }
            product['images'] = images;

            data.push(product);
        }

        
        return res.status(200).json({
            message:'lấy ds sản phẩm thành công',
            data : data
        })
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

//lấy ds sản phẩm theo category
router.get('/category/:id_category', async (req, res, next) => {
    try {
        let page = req.query.page;
        let idCategory = req.params.id_category;
        let productsID ;
        if(page)
            productsID = await Product.getListProductByCategory(idCategory,page);
        else
            productsID = await Product.getListProductByCategory(idCategory);
        

        let data = [];

        for(let i = 0; i < productsID.length; i++){
            let product = await Product.selectId(productsID[i].id_product);
            if(product.discount > 0){
                let valid = await Product.check(product.id_product);
                if(valid){
                    product = await Product.updateDiscount(productsID[i].id_product, 0);
                }
            }
            let images = [];
            let imgs = await Product.getAllImgById(product.id_product);
            
            for(let i = 0; i< imgs.length; i++){
                images.push(imgs[i].image);
            }
            product['images'] = images;
            data.push(product);
        }

        
        return res.status(200).json({
            message:'lấy ds sản phẩm thành công',
            data : data
        })
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

//lấy ds sản phẩm theo brand
router.get('/brand/:id_brand', async (req, res, next) => {
    try {
        let page = req.query.page;
        let idBrand = req.params.id_brand;
        let productsID ;
        if(page)
            productsID = await Product.getListProductByBrand(idBrand,page);
        else
            productsID = await Product.getListProductByBrand(idBrand);
        

        let data = [];

        for(let i = 0; i < productsID.length; i++){
            let product = await Product.selectId(productsID[i].id_product);
            if(product.discount > 0){
                let valid = await Product.check(product.id_product);
                if(valid){
                    product = await Product.updateDiscount(productsID[i].id_product, 0);
                }
            }
            let images = [];
            let imgs = await Product.getAllImgById(product.id_product);
            
            for(let i = 0; i< imgs.length; i++){
                images.push(imgs[i].image);
            }
            product['images'] = images;
            data.push(product);
        }

        
        return res.status(200).json({
            message:'lấy ds sản phẩm thành công',
            data : data
        })
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

//lấy ra 1 sản phẩm có id
router.get('/:id_product', async (req, res, next) => {
    try {

        let product_id = req.params.id_product;
        let images = [];
        let product = await Product.selectId(product_id);
        let imgs = await Product.getAllImgById(product_id);
        
        for(let i = 0; i< imgs.length; i++){
            images.push(imgs[i].image);
        }
        product['images'] = images;
        return res.status(200).json({
            message:'lấy ds sản phẩm thành công',
            data: product
        })
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

//cập nhật 1 sản phẩm
router.put('/:id_product', Auth.authenGTModer, async (req, res, next) => {
    try {

        let id_product = req.params.id_product;
        let {name_product, description, price, quantity, discount, date_discount_end} = req.body;
        let productExist = await Product.hasId(id_product);
        if(productExist){
            if(name_product && price && quantity){
                if(!discount){
                    discount = 0;
                }
                let product = await Product.selectId(id_product);
                if(product.name_product === name_product){
                    if(discount< 0 || discount >100){
                        return res.status(400).json({
                            message: "discount phải là số nguyên 0<= discount <=100"
                        })
                    }
                    if(discount === product.discount || discount === 0 ){
                    }
                    else{
                        if(!date_discount_end){
                            return res.status(400).json({
                                message: 'Nếu có giảm giá thì phải có ngày kết thức giảm giá'
                            })
                        }
                    }
                    let result = await Product.update(id_product,name_product, description, price, quantity, discount, date_discount_end);
                    return res.status(200).json({
                        message: 'cập nhật sản phẩm thành công',
                        data : result
                    })
                }
                else{
                    let nameProductExist = await Product.hasNameProduct(name_product);
                    if(!nameProductExist){
                        if(discount< 0 || discount >100){
                            return res.status(400).json({
                                message: "discount phải là số nguyên 0<= discount <=100"
                            })
                        }
                        if(discount === product.discount || discount === 0 ){
                        }
                        else{
                            if(!date_discount_end){
                                return res.status(400).json({
                                    message: 'Nếu có giảm giá thì phải có ngày kết thúc giảm giá'
                                })
                            }
                        }
                        let result = await Product.update(id_product ,name_product, description, price, quantity, discount, date_discount_end);
                        return res.status(200).json({
                            message: 'cập nhật sản phẩm thành công',
                            data : result
                        })
                    }
                    else{
                        return res.status(400).json({
                            message: 'Tên sản phẩm này được đặt cho 1 sản phẩm khác',
                        })
                    }
                    
                }
            }else{
                 return res.status(400).json({
                    message: 'Tên sản phẩm, giá tiền, số lượng không được để trống'
                })
            }
        }else{
            return res.status(400).json({
                message: 'sản phẩm không tồn tại'
            })
        }      

    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: 'Something wrong'
        })
    }

})

//xóa sản phẩm
router.delete('/delete/:id_product', Auth.authenGTModer, async (req, res, next) => {
    try {
        let idProduct = req.params.id_product;
        
        let existProductInOrder = await Product.hasProductInOrderDetail(idProduct);
        if(!existProductInOrder){
            let imgs = await Product.getAllIdImgById(idProduct);
            for(let i = 0; i < imgs.length; i++){
                await Product.deleteProductIMG(imgs[i].id_image);
            }

            await Product.deleteProduct(idProduct);
            res.status(200).json({
                message: 'Xóa sản phẩm thành công',
            })
        }
        else{
            return res.status(400).json({
                message: 'Sản phẩm này không thể xóa!'
            })
        }

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

//Tìm 1 sản phẩm theo từ khóa
router.get('/', async (req, res, next) => {
    try {
        let { k } = req.query;
        if (!k || k.trim().length == 0) {
            return res.status(400).json({
                message: "Chưa có từ khóa tìm kiếm"
            })
        }

        k = k.toLowerCase();


        let page = req.query.page;

        let list = [];
        let ids;
        if (page) ids = await Product.getSearch(k, page);
        else ids = await Product.getSearch(k);
        

        for (let productId of ids) {
            let product = await Product.selectId(productId.id_product);
            if(product.discount > 0){
                let valid = await Product.check(product.id_product);
                if(valid){
                    product = await Product.updateDiscount(product.id_product, 0);
                }
            }
            let images = [];
            let imgs = await Product.getAllImgById(productId.id_product);
            
            for(let i = 0; i< imgs.length; i++){
                images.push(imgs[i].image);
            }
            product['images'] = images;

            list.push(product)
        }

        return res.status(200).json({
            message: 'Tìm kiếm danh sách Sản phẩm thành công',
            data: list
        });
    } catch (err) {
        console.log(err);
        return res.sendStatus(500)
    }
});

module.exports =router;