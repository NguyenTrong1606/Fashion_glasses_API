const pool = require('../../../db');
const db = {};


db.hasCartItem = (id_cart, id_product) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM cart_item WHERE id_cart = $1 AND id_product =$2",
            [id_cart, id_product],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.add = (id_account) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO cart (id_account) VALUES ($1) RETURNING id_cart",
            [id_account],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0].id_cart);
            });
    });
}

db.addCartItem = (id_cart, id_product, quantity) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO cart_item (id_cart, id_product, quantity) VALUES ($1,$2,$3) RETURNING *",
            [id_cart, id_product, quantity],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.selectIdCart = (id_account) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM cart where id_account =$1",
            [id_account],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.selectIdItem = (id_cart, id_product) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM cart_item where id_cart =$1 AND id_product = $2",
            [id_cart, id_product],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.selectItems = (id_cart) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM cart_item where id_cart =$1",
            [id_cart],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            });
    });
}

db.updateCartItem = (id_item, quantity) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE cart_item SET quantity = $2 WHERE id_item=$1 RETURNING *",
            [id_item, quantity],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.deleteCartItem = (idItem) => {
    return new Promise((resolve, reject) => {
        pool.query(`DELETE FROM cart_item WHERE id_item = $1`,
            [idItem],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0)
            })
    })
}

module.exports = db;