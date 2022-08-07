const pool = require('../../../db');
const db = {};

db.has = (id_account, id_product) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM review WHERE id_account = $1 AND id_product =$2",
            [id_account, id_product],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.addReview = (id_account, id_product, star_number, content) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO review (id_account, id_product, star_number, content) VALUES ($1, $2, $3, $4) RETURNING *, TO_CHAR(date_time:: date, 'dd/mm/yyyy') AS day, TO_CHAR(date_time:: time, 'hh24:mi') AS time",
            [id_account, id_product, star_number, content],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.getListReviewOfProduct = (id_product) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM review  WHERE id_product = $1",
            [id_product],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}


module.exports = db;