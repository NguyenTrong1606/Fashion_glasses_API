const pool = require('../../../db');
const db = {};


db.add = (id_account, id_voucher) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO account_voucher (id_account, id_voucher,status) VALUES ($1, $2, 0) RETURNING *",
            [id_account, id_voucher],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.has = (id_account, id_voucher) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM account_voucher WHERE id_account = $1 AND id_voucher =$2",
            [id_account, id_voucher],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

module.exports = db;