const pool = require('../../../db');
const db = {};

db.addCommentParent = (id_account, id_product, content) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO comment (id_account, id_product, content) VALUES ($1, $2, $3) RETURNING *, TO_CHAR(date_time:: date, 'dd/mm/yyyy') AS day, TO_CHAR(date_time:: time, 'hh24:mi') AS time ",
            [id_account, id_product, content],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.has = (id_cmt) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT id_product FROM comment WHERE id_cmt = $1",
            [id_cmt],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0])
            });
    })
}

db.addCommentChildren = (id_account, id_product, content, id_cmt_parent) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO comment (id_account, id_product, content, id_cmt_parent) VALUES ($1, $2, $3, $4) RETURNING *, TO_CHAR(date_time:: date, 'dd/mm/yyyy') AS day, TO_CHAR(date_time:: time, 'hh24:mi') AS time ",
            [id_account, id_product, content, id_cmt_parent],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.listCommentParent = (id_product, page = 0) => {
    if (page === 0) {
        return new Promise((resolve, reject) => {
            pool.query("SELECT id_cmt, id_account, content, TO_CHAR(date_time:: date, 'dd/mm/yyyy') AS day, TO_CHAR(date_time:: time, 'hh24:mi') AS time FROM comment WHERE id_product = $1 and id_cmt_parent = 0 ORDER BY date_time DESC",
                [id_product],
                (err, result) => {
                    if (err) return reject(err);
                    return resolve(result.rows);
                })
        })
    }
    else{
        return new Promise((resolve, reject) => {
            pool.query("SELECT id_cmt, id_account, content, TO_CHAR(date_time:: date, 'dd/mm/yyyy') AS day, TO_CHAR(date_time:: time, 'hh24:mi') AS time FROM comment WHERE id_product = $1 and id_cmt_parent = 0 ORDER BY date_time DESC",
                [id_product,(page - 1) * 10],
                (err, result) => {
                    if (err) return reject(err);
                    return resolve(result.rows);
                })
        })
    }
    
}

db.listCommentChildren = (id_cmt, id_product) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT id_cmt, id_account, content, TO_CHAR(date_time:: date, 'dd/mm/yyyy') AS day, TO_CHAR(date_time:: time, 'hh24:mi') AS time  FROM comment WHERE id_cmt_parent = $1 and id_product = $2 ORDER BY date_time DESC",
            [id_cmt, id_product],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.getComment = (id_cmt) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM comment WHERE id_cmt = $1",
            [id_cmt],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}


db.getListCommentChildren = (id_cmt_parent) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT id_cmt, id_account, content, TO_CHAR(date_time:: date, 'dd/mm/yyyy') AS day, TO_CHAR(date_time:: time, 'hh24:mi') AS time  FROM comment WHERE id_cmt_parent = $1",
            [id_cmt_parent],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.selectAccountComment = (id_cmt) => {
    return new Promise((resolve, reject) => {
        pool.query("select id_account from comment where id_cmt = $1",
            [id_cmt],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0].id_account);
            });
    })
}

db.updateComment = (id_cmt, content) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE comment SET content = $1 where id_cmt = $2 RETURNING *, TO_CHAR(date_time:: date, 'dd/mm/yyyy') AS day, TO_CHAR(date_time:: time, 'hh24:mi') AS time",
            [content, id_cmt],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.delete = (id_cmt) => {
    return new Promise((resolve, reject) => {
        pool.query("DELETE FROM comment WHERE id_cmt IN (SELECT id_cmt FROM comment WHERE id_cmt_parent = $1) OR id_cmt = $1",
            [id_cmt],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}



module.exports = db;