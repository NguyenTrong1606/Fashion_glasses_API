const pool = require('../../../db');
const db = {};


db.selectPasswordByAccountName = (accountName) =>{
    return new Promise((resolve,reject)=>{
        pool.query.apply('SELECT passsword FROM account WHERE account_name = $1',
        [accountName],
        (err, result) =>{
            if (err) return reject(err);
            return resolve(result.rows[0].password);
        })
    })
}

db.hasByAccountName = (accountName) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM account WHERE account_name = $1",
            [accountName],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.hasId = (accountName) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM account WHERE id_account = $1",
            [accountName],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.selectByAccountName = (accountName) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM account WHERE account_name = $1',
            [accountName],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.add = (account) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO account (account_name, password, role, status) VALUES ($1,$2,$3,$4) RETURNING id_account",
            [account.account_name, account.password, account.role, account.status],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0].id_account);
            });
    });
}

db.selectId = (id) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT id_account, account_name, role, status FROM account WHERE id_account = $1",
            [id],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}


db.updatePassword = (id, password) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE account SET password=$1 WHERE id_account=$2",
            [password, id],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.selectListAccountByRole = (role) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT A.id_account, E.full_name, E.email, E.phone_number, E.identification, A.account_name, E.date_of_birth, A.role, A.status, E.avatar, E.gender, E.address FROM account A INNER JOIN employee E ON A.id_account = E.id_account WHERE A.role = $1 AND A.status = 0",
            [role],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.selectInforCustomer = (id) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT A.id_account, C.full_name, C.email, C.phone_number, A.account_name, A.role, A.status, C.avatar, C.gender, C.address FROM account A INNER JOIN customer C ON A.id_account = C.id_account WHERE A.id_account = $1",
            [id],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.selectInforEmployee = (id) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT A.id_account, E.full_name, E.email, E.phone_number, E.identification, A.account_name, E.date_of_birth, A.role, A.status, E.avatar, E.gender, E.address FROM account A INNER JOIN employee E ON A.id_account = E.id_account WHERE A.id_account = $1",
            [id],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}




module.exports = db;