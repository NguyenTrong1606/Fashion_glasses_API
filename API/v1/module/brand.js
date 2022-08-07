const pool = require('../../../db');
const db = {};

db.hasByNameBrand = (name_brand) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM brand WHERE name_brand = $1",
            [name_brand],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}



db.add = (name_brand) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO brand (name_brand) VALUES ($1) RETURNING id_brand",
            [name_brand],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0].id_brand);
            });
    });
}

db.updateBrand = (id, name) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE brand SET name_brand = $2 WHERE id_brand = $1",
            [id, name],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.hasProductInBrand = (id_brand) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM product WHERE id_brand = $1 `,
            [id_brand],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.deleteBrand = (id_brand) => {
    return new Promise((resolve, reject) => {
        pool.query(`DELETE FROM brand WHERE id_brand = $1`,
            [id_brand],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0)
            })
    })
}

module.exports = db;