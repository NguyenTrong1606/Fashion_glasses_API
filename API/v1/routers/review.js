const express = require('express');
const router = express.Router();
const Auth = require('../../../auth');
const Orders = require('../module/orders');
const Product = require('../module/product');

const Review = require('../module/review');
const Account = require('../module/account');


// Thêm đánh giá mới cho sản phẩm
router.post('/:id_product', Auth.authenGTUser, async (req, res, next) => {
    try {

        let id_account = Auth.tokenData(req).id_account;
        let id_product = req.params.id_product;
        let {content, star_number} = req.body;

        let reviewExist = await Review.has(id_account, id_product);
        if(reviewExist){
            return res.status(400).json({
                message: 'sản phẩm nãy đã được đánh giá trc đây'
            })
        }

        if(star_number){
            let checkBuy = false;
            let listOrder = await Orders.getOrders(id_account);
            for (let od of listOrder){
                let order_details = await Orders.getOrderDetailByIdOrder(od.id_order);
                for (let od_detail of order_details){
                    if(od.status === 3 && od_detail.id_product == id_product){
                        checkBuy = true;
                    }
                }
            }
            if(!checkBuy){
                return res.status(400).json({
                    message: 'bạn phải từng mua sản phẩm mới đc đánh giá'
                })
            }
            let review = await Review.addReview(id_account, id_product, star_number, content);
            review['account'] = await Account.selectId(id_account)
            return res.status(200).json({
                message: 'đánh giá thành công',
                data : review
            })
        }
        else{
            return res.status(400).json({
                message: 'Số sao không được để trống'
            })
        }


    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})


//lấy ds đánh giá của 1 sp
router.get('/:id_product/list-review',  async (req, res, next) => {
    try {
            let id_product = req.params.id_product;
            let listReview = await Review.getListReviewOfProduct(id_product);
            let data = [];
            for(let review of listReview ){
                let acc = await Account.selectId(review.id_account)
                review['account'] = acc;
                data.push(review);
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

//lấy số sao trung bình của sp
router.get('/:id_product/number-star',  async (req, res, next) => {
    try {
            let id_product = req.params.id_product;
            let number_star = 0;
            let i = 0;
            let sum_star = 0;
            let listReview = await Review.getListReviewOfProduct(id_product);
            let data = [];
            for(let review of listReview ){
                sum_star = +sum_star + review.star_number;
                i = +i+1;
                let acc = await Account.selectId(review.id_account)
                review['account'] = acc;
                data.push(review);
            }
            number_star = +sum_star/+i;
            return res.status(200).json({
                message:'lấy ds sản phẩm thành công',
                data: number_star
            })
        
        
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})


module.exports =router;