const pool = require('../../../db');
const db = {};

db.hasByNameCategory = (name_category) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM category WHERE name_category = $1",
            [name_category],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}



db.add = (name_category) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO category (name_category) VALUES ($1) RETURNING *",
            [name_category],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.updateCategory = (id, name) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE category SET name_category = $2 WHERE id_category = $1 RETURNING *",
            [id, name],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.hasProductInCategory = (id_category) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM product WHERE id_category = $1 `,
            [id_category],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.deleteCategory = (idCategory) => {
    return new Promise((resolve, reject) => {
        pool.query(`DELETE FROM category WHERE id_category = $1`,
            [idCategory],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0)
            })
    })
}

db.getListCategory = () => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT *  FROM category",
            [],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

module.exports = db;