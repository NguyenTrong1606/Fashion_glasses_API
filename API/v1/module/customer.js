const pool = require('../../../db');
const db = {};

db.add = (user) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO customer (full_name, email, phone_number, avatar, gender, address, id_account) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id_customer",
            [user.full_name, user.email, user.phone_number, user.avatar, user.gender, user.address, user.id_account],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0].id_account);
            });
    });
}

db.hasEmail = (email) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM customer WHERE email = $1",
            [email],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.hasPhoneNumber = (phone_number) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM customer WHERE phone_number = $1",
            [phone_number],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.update = (id, full_name, gender, address, avatar = '') => {
    if (avatar == '') {
        return new Promise((resolve, reject) => {
            pool.query("UPDATE customer SET full_name =$1, gender =$2, address=$3 WHERE id_customer = $4 RETURNING *",
                [full_name, gender, address, id],
                (err, result) => {
                    if (err) return reject(err);
                    return resolve(result.rows[0]);
                });
        })
    } else {
        return new Promise((resolve, reject) => {
            pool.query("UPDATE customer SET full_name =$1, gender =$2, address=$3, avatar=$4 WHERE id_customer = $5 RETURNING *",
                [full_name, gender, address, avatar, id],
                (err, result) => {
                    if (err) return reject(err);
                    return resolve(result.rows[0]);
                });
        })
    }
}

db.selectInforByIdAccount = (id) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM customer WHERE id_account = $1",
            [id],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

module.exports = db;