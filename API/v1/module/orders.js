const pool = require('../../../db');
const db = {};

db.addOrder = (id_account, address) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO orders (id_account, address) VALUES ($1, $2) RETURNING *, TO_CHAR(date_create:: date, 'dd/mm/yyyy') AS day, TO_CHAR(date_create:: time, 'hh24:mi') AS time",
            [id_account,address],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.addOrderHasVoucher = (id_account, id_voucher, address) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO orders (id_account, id_voucher,address) VALUES ($1, $2,$3) RETURNING *, TO_CHAR(date_create:: date, 'dd/mm/yyyy') AS day, TO_CHAR(date_create:: time, 'hh24:mi') AS time",
            [id_account, id_voucher , address],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.addOrderDetail = (id_order, id_product, quantity, price) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO order_detail (id_order, id_product, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *",
            [id_order, id_product, quantity, price],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.hasId = (id_order) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM orders WHERE id_order = $1",
            [id_order],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.hasOrderAccount = (id_account, id_order) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM orders WHERE id_account = $1 AND id_order = $2 AND status = 0",
            [id_account, id_order],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.updateStatus = (id_order, id_employee, status) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE orders SET id_employee = $2, status = $3 WHERE id_order = $1 RETURNING *",
            [id_order, id_employee, status],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}




db.deleteOrderDetail = (id_order, id_product) => {
    return new Promise((resolve, reject) => {
        pool.query(`DELETE FROM order_detail WHERE id_order = $1 AND id_product = $2`,
            [id_order, id_product],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0)
            })
    })
}

db.deleteOrder = (id_order) => {
    return new Promise((resolve, reject) => {
        pool.query(`DELETE FROM orders WHERE id_order = $1`,
            [id_order],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0)
            })
    })
}



db.getOrderDetailByIdOrder = (id_order) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM order_detail where id_order =$1",
            [id_order],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            });
    });
}

db.getOrders = (id_account) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM orders where id_account =$1",
            [id_account],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            });
    });
}

db.getListOrderStatus = (status) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM orders where status =$1",
            [status],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            });
    });

}


db.getListOrderByMonth = (dateStart, dateEnd) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM orders where status = 1 AND date_create > $1::date AND date_create < $2::date ",
            [dateStart, dateEnd],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            });
    });

}


module.exports = db;