const express = require('express');
const router = express.Router();
const Auth = require('../../../auth');

const Comment = require('../module/comment')
const Product = require('../module/product')
const Account = require('../module/account')


// lấy ds các bl của sản phẩm
router.get('/:id_product/comment', async (req, res, next) => {
    const id_product = req.params.id_product
    let data = []
    let page = req.query.page;
    const productExists = await Product.hasId(id_product)
    if (productExists) {
        let listParent;
        if(page==0) {listParent = await Comment.listCommentParent(id_product);}
        else {listParent = await Comment.listCommentParent(id_product, page);}
        for (let i = 0; i < listParent.length; i++) {
            let commentChildren = []
            const listChildren = await Comment.listCommentChildren(listParent[i].id_cmt, id_product)
            const account = await Account.selectId(listParent[i].id_account)
            if (listChildren.length > 0) {
                for (let i = 0; i < listChildren.length; i++) {
                    const account = await Account.selectId(listChildren[i].id_account)

                    commentChildren.push({
                        account: account,
                        id_cmt: listChildren[i].id_cmt,
                        content: listChildren[i].content,
                        day: listChildren[i].day,
                        time: listChildren[i].time,
                    })
                }
            }

            data.push({
                account: account,
                id_cmt: listParent[i].id_cmt,
                content: listParent[i].content,
                day: listParent[i].day,
                time: listParent[i].time,
                commentChildren: commentChildren
            })
        }

        return res.status(200).json({
            message: 'Danh sách các comment theo Sản phẩm thành công',
            data
        })
    } else {
        return res.status(404).json({
            message: 'Sản phẩm không tồn tại'
        })
    }
})

//thêm 1 bình luận
router.post('/:id_product/comment', Auth.authenGTUser, async (req, res, next) => {
    try {
        const content = req.body.content.trim()
        const id_account = Auth.tokenData(req).id_account;
        const id_product = req.params.id_product
        const productExists = await Product.hasId(id_product)
        if (productExists) {
            if (content) {
                const comment = await Comment.addCommentParent(id_account, id_product, content)
                comment['account'] = await Account.selectId(id_account)
                comment['commentChildren'] = []
                return res.status(200).json({
                    message: "Bình luận thành công",
                    data: comment
                })
            } else {
                return res.status(400).json({
                    message: 'Bạn chưa nhập nội dung bình luận'
                })
            }

        } else {
            return res.status(404).json({
                message: 'Sản phẩm không tồn tại'
            })
        }

    } catch (error) {
        console.log(error)
        return res.sendStatus(500)
    }
})

//trả lời 1 bl
router.post('/:id_product/comment/:id_cmt_parent/reply', Auth.authenGTUser, async (req, res, next) => {
    try {
        const content = req.body.content.trim()
        const id_account = Auth.tokenData(req).id_account
        const id_product = req.params.id_product
        const id_cmt_parent = req.params.id_cmt_parent

        
        const idProductOfCmt = await Comment.has(id_cmt_parent)
        if (idProductOfCmt) {
            if (idProductOfCmt.id_product != id_product) {
                return res.status(404).json({
                    message: 'Sản phẩm và bình luận không khớp'
                })
            }
        } else {
            return res.status(404).json({
                message: 'Bình luận cha không tồn tại'
            })
        }

        const productExists = await Product.hasId(id_product)
        if (productExists) {
            if (content) {
                const comment = await Comment.addCommentChildren(id_account, id_product, content, id_cmt_parent)
                comment['account'] = await Account.selectId(comment.id_account)
                
                return res.status(200).json({
                    message: "Trả lời bình luận thành công",
                    data: comment
                })
            } else {
                return res.status(400).json({
                    message: 'Bạn chưa nhập nội dung bình luận'
                })
            }
        } else {
            res.status(404).json({
                message: 'Sản phẩm không tồn tại'
            })
        }


    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})
//lấy 1 bình luận theo id
router.get('/comment/:id_cmt', async (req, res, next) => {
    const id_cmt = req.params.id_cmt

    const cmtExists = await Comment.has(id_cmt)
    if (cmtExists) {
        const data = await Comment.getComment(id_cmt)

        return res.status(200).json({
            message: 'Lấy 1 bình luận thành công',
            data
        })
    } else {
        return res.status(404).json({
            message: 'Bình luận này không tồn tại'
        })
    }
})

//lấy 1 bl theo id và các con của nó
router.get('/comment_parent/:id_cmt', async (req, res, next) => {
    const id_cmt = req.params.id_cmt

    const cmtExists = await Comment.has(id_cmt)
    if (cmtExists) {
        const data = await Comment.getComment(id_cmt)
        const listChildren = await Comment.getListCommentChildren(id_cmt)

        return res.status(200).json({
            message: 'Lấy 1 bình luận thành công',
            data: {
                ...data,
                listChildren: listChildren
            }
        })
    } else {
        return res.status(404).json({
            message: 'Bình luận này không tồn tại'
        })
    }
})


// update 1 bl
router.put('/:id_product/comment/:id_cmt/update', Auth.authenGTUser, async (req, res, next) => {
    try {
        const content = req.body.content.trim()
        const id_account = Auth.tokenData(req).id_account
        const id_product = req.params.id_product
        const id_cmt = req.params.id_cmt

        const productExists = await Product.hasId(id_product)
        if (!productExists) {
            res.status(404).json({
                message: 'Sản phẩm không tồn tại'
            })
        }

        const idProductOfCmt = await Comment.has(id_cmt)
        if (idProductOfCmt) {
            if (idProductOfCmt.id_product != id_product) {
                return res.status(404).json({
                    message: 'Sản phẩm và bình luận không khớp'
                })
            }
        } else {
            return res.status(404).json({
                message: 'Bình luận không tồn tại'
            })
        }
        const id_account_comment = await Comment.selectAccountComment(id_cmt)
        if (+id_account === +id_account_comment) {
            if (content) {
                const comment = await Comment.updateComment(id_cmt, content)
                // comment['commentChildren'] = await Comment.getListCommentChildren(id_cmt)
                let commentChildren = []
                const listChildren = await Comment.listCommentChildren(id_cmt, id_product)
                const account = await Account.selectId(comment.id_account)
                if (listChildren.length > 0) {
                    for (let i = 0; i < listChildren.length; i++) {
                        const account = await Account.selectId(listChildren[i].id_account)

                        commentChildren.push({
                            account: account,
                            id_cmt: listChildren[i].id_cmt,
                            content: listChildren[i].content,
                            day: listChildren[i].day,
                            time: listChildren[i].time,
                        })
                    }
                }

                comment['account'] = account
                comment['commentChildren'] = commentChildren
                
                return res.status(200).json({
                    message: "Thay đổi nội dung bình luận thành công",
                    data: comment

                })
            } else {
                return res.status(400).json({
                    message: 'Bạn chưa nhập nội dung bình luận'
                })
            }
        } else {
            return res.status(401).json({
                message: "Không phải chính chủ, không được đổi cmt",
            })
        }
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})


router.delete('/:id_product/comment/:id_cmt/delete', Auth.authenGTUser, async (req, res, next) => {
    try {
        const id_account = Auth.tokenData(req).id_account
        const id_product = req.params.id_product
        const id_cmt = req.params.id_cmt


        const productExists = await Product.hasId(id_product)
        if (!productExists) {
            res.status(404).json({
                message: 'Sản phẩm không tồn tại'
            })
        }

        const cmtExist = await Comment.has(id_cmt)
        if (!cmtExist) {
            return res.status(404).json({
                message: 'Bình luận không tồn tại'
            })
        }

        const id_account_comment = await Comment.selectAccountComment(id_cmt)
        if (+id_account === +id_account_comment) {
            const comment = await Comment.delete(id_cmt)
            return res.status(200).json({
                message: "Xóa bình luận thành công",
            })
        } else {
            return res.status(401).json({
                message: "Không phải chính chủ, không được xóa cmt",
            })
        }
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }

})

module.exports =router;