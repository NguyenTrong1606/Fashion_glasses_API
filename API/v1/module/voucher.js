const pool = require('../../../db');
const db = {};

db.hasTitle = (name_voucher) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM voucher WHERE title = $1",
            [name_voucher],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.hasId = (id) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM voucher WHERE id_voucher = $1",
            [id],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.hasId = (id) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM voucher WHERE id_voucher = $1",
            [id],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.hasVoucherInAccountVoucher = (id) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM account_voucher WHERE id_voucher = $1",
            [id],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.hasVoucherOfAcc= (id_account, id_voucher) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM account_voucher WHERE id_account =$1 AND id_voucher = $2",
            [id_account, id_voucher],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.checkIsUsed= (id_account, id_voucher) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM account_voucher WHERE id_account =$1 AND id_voucher = $2 AND status = 0",
            [id_account, id_voucher],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.addVoucher = (title, quantity, discount, date_start, date_end, description) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO voucher (title, quantity, discount, date_start, date_end, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING * ,TO_CHAR(date_end:: date, 'dd/mm/yyyy') AS date_end, TO_CHAR(date_start:: date, 'dd/mm/yyyy') AS date_start",
            [title, quantity, discount, date_start, date_end, description],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.updateVoucher= (id, quantity, description) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE voucher SET quantity = $2, description = $3 WHERE id_voucher=$1 RETURNING *, TO_CHAR(date_end:: date, 'dd/mm/yyyy') AS date_end ,TO_CHAR(date_start:: date, 'dd/mm/yyyy') AS date_start",
            [id, quantity, description],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.updateStatusUseVoucher= (id_account, id_voucher) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE account_voucher SET status = 1 WHERE id_account = $1 AND id_voucher=$2 RETURNING *",
            [id_account, id_voucher],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.deleteVoucher = (idVoucher) => {
    return new Promise((resolve, reject) => {
        pool.query(`DELETE FROM voucher WHERE id_voucher = $1`,
            [idVoucher],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0)
            })
    })
}
db.getListVoucherOfAccount = (id_account) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM account_voucher  WHERE id_account = $1 AND status = 0",
            [id_account],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.getAllVoucherOfAccount = (id_account) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM account_voucher  WHERE id_account = $1",
            [id_account],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.getAllVoucher = () => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT *, TO_CHAR(date_end:: date, 'dd/mm/yyyy') AS date_end ,TO_CHAR(date_start:: date, 'dd/mm/yyyy') AS date_start FROM voucher ORDER BY id_voucher DESC",
            [],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.getListVoucher= () => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM voucher  WHERE quantity > 0 AND date_end >= CURRENT_TIMESTAMP",
            [],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.check = (id_voucher)=>{
    return new Promise((resolve, reject)=>{
        pool.query(`SELECT (date_start <= CURRENT_TIMESTAMP AND date_end >= CURRENT_TIMESTAMP) AS valid 
        FROM voucher
        WHERE id_voucher = $1 
        ORDER BY date_start DESC LIMIT 1`,
        [id_voucher],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0].valid);
        })
    })
}

db.selectId = (id_voucher) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT *, TO_CHAR(date_end:: date, 'dd/mm/yyyy') AS date_end ,TO_CHAR(date_start:: date, 'dd/mm/yyyy') AS date_start FROM voucher WHERE id_voucher = $1",
            [id_voucher],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.getVoucherId = (id_voucher) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM voucher WHERE id_voucher = $1",
            [id_voucher],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.getSL1Voucher = (id_voucher) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT quantity FROM voucher  WHERE id_voucher = $1",
            [id_voucher],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.updateSL= (id, quantity) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE voucher SET quantity = $2 WHERE id_voucher=$1 RETURNING *",
            [id, quantity],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.updateSL0= (id) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE voucher SET quantity = 0 WHERE id_voucher=$1 RETURNING *",
            [id],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}
module.exports = db;