const pool = require('../../../db');
const db = {};

db.add = (employee) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO employee (full_name, email, phone_number, identification, date_of_birth, avatar, gender, address, id_account) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id_employee",
            [employee.full_name, employee.email, employee.phone_number, employee.identification, employee.date_of_birth, employee.avatar, employee.gender, employee.address, employee.id_account],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0].id_account);
            });
    });
}

db.hasEmail = (email) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM employee WHERE email = $1",
            [email],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.hasPhoneNumber = (phone_number) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM employee WHERE phone_number = $1",
            [phone_number],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.hasIdentification = (identification) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM employee WHERE identification = $1",
            [identification],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.update = (id, phone_number, address, avatar = '') => {
    if (avatar == '') {
        return new Promise((resolve, reject) => {
            pool.query("UPDATE employee SET phone_number=$1, address=$2 WHERE id_employee = $3 RETURNING *",
                [phone_number, address, id],
                (err, result) => {
                    if (err) return reject(err);
                    return resolve(result.rows[0]);
                });
        })
    } else {
        return new Promise((resolve, reject) => {
            pool.query("UPDATE employee SET phone_number =$1, address=$2, avatar=$3 WHERE id_employee = $4 RETURNING *",
                [phone_number, address, avatar, id],
                (err, result) => {
                    if (err) return reject(err);
                    return resolve(result.rows[0]);
                });
        })
    }
}

db.selectInforByIdAccount = (id) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM employee WHERE id_account = $1",
            [id],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}



module.exports = db;