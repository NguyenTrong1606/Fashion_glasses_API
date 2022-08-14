const pool = require('../../../db');
const db = {};

db.getListProduct = (page = 0) => {
    if (page === 0) {
        return new Promise((resolve, reject) => {
            pool.query("SELECT id_product FROM product  ORDER BY discount DESC",
                [], (err, result) => {
                    if (err) return reject(err);
                    return resolve(result.rows);
                })
        })
    } else {
        return new Promise((resolve, reject) => {
            pool.query("SELECT id_product FROM product ORDER BY discount DESC LIMIT 12 OFFSET $1",
                [(page - 1) * 12], (err, result) => {
                    if (err) return reject(err);
                    return resolve(result.rows);
                })
        })
    }

}

db.getListProductRamdom = () => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT id_product FROM product WHERE quantity  > 0 ORDER BY random() limit 4",
                [], (err, result) => {
                    if (err) return reject(err);
                    return resolve(result.rows);
                })
        })

}

db.getListProductByCategory = (id_category ,page = 0) => {
    if (page === 0) {
        return new Promise((resolve, reject) => {
            pool.query("SELECT id_product FROM product WHERE  id_category = $1 ORDER BY discount DESC",
                [id_category], (err, result) => {
                    if (err) return reject(err);
                    return resolve(result.rows);
                })
        })
    } else {
        return new Promise((resolve, reject) => {
            pool.query("SELECT id_product FROM product WHERE  id_category = $1 ORDER BY discount DESC LIMIT 12 OFFSET $2",
                [id_category, (page - 1) * 12], (err, result) => {
                    if (err) return reject(err);
                    return resolve(result.rows);
                })
        })
    }

}

db.getListProductByBrand = (id_brand ,page = 0) => {
    if (page === 0) {
        return new Promise((resolve, reject) => {
            pool.query("SELECT id_product FROM product WHERE  id_brand = $1 ORDER BY discount DESC",
                [id_brand], (err, result) => {
                    if (err) return reject(err);
                    return resolve(result.rows);
                })
        })
    } else {
        return new Promise((resolve, reject) => {
            pool.query("SELECT id_product FROM product WHERE  id_brand = $1 ORDER BY discount DESC LIMIT 12 OFFSET $2",
                [id_brand, (page - 1) * 12], (err, result) => {
                    if (err) return reject(err);
                    return resolve(result.rows);
                })
        })
    }

}

db.selectId = (id_product) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM product WHERE id_product = $1",
            [id_product],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.hasId = (id_product) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM product WHERE id_product = $1",
            [id_product],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.hasNameProduct = (name_product) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM product WHERE name_product = $1",
            [name_product],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.getAllImgById = (id_product) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT image FROM product_image  WHERE id_product = $1 ",
            [id_product],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.hasProductInOrderDetail = (id_product) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM order_detail WHERE id_product = $1",
            [id_product],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.deleteProduct = (idProduct) => {
    return new Promise((resolve, reject) => {
        pool.query(`DELETE FROM product WHERE id_product = $1`,
            [idProduct],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0)
            })
    })
}

db.deleteProductIMG = (idIMG) => {
    return new Promise((resolve, reject) => {
        pool.query(`DELETE FROM product_image WHERE id_image = $1`,
            [idIMG],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0)
            })
    })
}


db.addProduct = (name_product, description, price, quantity, discount, date_discount_end, id_category, id_brand) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO product (name_product, description, price, quantity, discount, date_discount_end, id_category, id_brand) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
            [name_product, description, price, quantity, discount, date_discount_end, id_category, id_brand],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}


db.addIMGProduct = (id_product, img) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO product_image (id_product, image) VALUES ($1, $2) RETURNING *",
            [id_product, img],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0].image);
            })
    })
}

db.check = (id_product)=>{
    return new Promise((resolve, reject)=>{
        pool.query(`SELECT date_discount_end <= CURRENT_TIMESTAMP AS valid 
            FROM product
            WHERE id_product = $1 
            ORDER BY date_discount_end DESC LIMIT 1`,
        [id_product],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0].valid);
        })
    })
}

db.updateDiscount = (id, discount) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE product SET discount=$1 WHERE id_product=$2 RETURNING *",
            [discount, id],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.updateQuantity = (id, quantity) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE product SET quantity=$1 WHERE id_product=$2 RETURNING *",
            [quantity, id],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}


db.update= (id, name_product, description, price, quantity, discount, date_discount_end) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE product SET name_product = $2, description = $3, price = $4, quantity = $5, discount = $6, date_discount_end = $7 WHERE id_product=$1 RETURNING *",
            [id, name_product, description, price, quantity, discount, date_discount_end],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.getAllIdImgById = (id_product) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT id_image FROM product_image  WHERE id_product = $1",
            [id_product],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.getSearch = (search, page = 0) => {
    if (page === 0) {
        return new Promise((resolve, reject) => {
            pool.query(`select id_product
                from product
                where lower(name_product) like $1`,
                ['%' + search + '%'],
                (err, result) => {
                    if (err) return reject(err);
                    return resolve(result.rows);
                })
        });
    } else {
        return new Promise((resolve, reject) => {
            pool.query(`select id_product
                from product
                where lower(name_product) like $1 LIMIT 12 OFFSET $2`,
                ['%' + search + '%', (page - 1) * 12],
                (err, result) => {
                    if (err) return reject(err);
                    return resolve(result.rows);
                })
        });
    }
}


module.exports = db;