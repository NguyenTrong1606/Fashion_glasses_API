const pool = require("../../../db");
const db = {};

db.selectPasswordByAccountName = (accountName) => {
  return new Promise((resolve, reject) => {
    pool.query.apply(
      "SELECT passsword FROM account WHERE account_name = $1",
      [accountName],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result.rows[0].password);
      }
    );
  });
};

db.hasByAccountName = (accountName) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM account WHERE account_name = $1",
      [accountName],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result.rowCount > 0);
      }
    );
  });
};

db.hasId = (accountName) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM account WHERE id_account = $1",
      [accountName],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result.rowCount > 0);
      }
    );
  });
};

db.selectByAccountName = (accountName) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM account WHERE account_name = $1",
      [accountName],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result.rows[0]);
      }
    );
  });
};

db.add = (account) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "INSERT INTO account (account_name, password, role, status) VALUES ($1,$2,$3,$4) RETURNING id_account",
      [account.account_name, account.password, account.role, account.status],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result.rows[0].id_account);
      }
    );
  });
};

db.selectId = (id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT id_account, account_name, role, status FROM account WHERE id_account = $1",
      [id],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result.rows[0]);
      }
    );
  });
};

db.updatePassword = (id, password) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "UPDATE account SET password=$1 WHERE id_account=$2",
      [password, id],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result.rows[0]);
      }
    );
  });
};

db.updateAddressCustomer = (id, address) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "UPDATE customer SET address=$1 WHERE id_account=$2",
      [address, id],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result.rows[0]);
      }
    );
  });
};

db.updateAddressEmployee = (id, address) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "UPDATE employee SET address=$1 WHERE id_account=$2",
      [address, id],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result.rows[0]);
      }
    );
  });
};

db.selectListAccountByRole = (role) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT A.id_account, E.full_name, E.email, E.phone_number, E.identification, A.account_name, E.date_of_birth, A.role, A.status, E.avatar, E.gender, E.address FROM account A INNER JOIN employee E ON A.id_account = E.id_account WHERE A.role = $1 AND A.status = 0",
      [role],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result.rows);
      }
    );
  });
};

db.selectInforCustomer = (id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT A.id_account, C.full_name, C.email, C.phone_number, A.account_name, A.role, A.status, C.avatar, C.gender, C.address FROM account A INNER JOIN customer C ON A.id_account = C.id_account WHERE A.id_account = $1",
      [id],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result.rows[0]);
      }
    );
  });
};

db.selectInforEmployee = (id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT A.id_account, E.full_name, E.email, E.phone_number, E.identification, A.account_name, TO_CHAR(E.date_of_birth:: date, 'dd/mm/yyyy') AS date_of_birth, A.role, A.status, E.avatar, E.gender, E.address FROM account A INNER JOIN employee E ON A.id_account = E.id_account WHERE A.id_account = $1",
      [id],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result.rows[0]);
      }
    );
  });
};

db.isHasIdVerification = (id_account) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT id_account FROM verification WHERE id_account = $1",
      [id_account],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result.rowCount > 0);
      }
    );
  });
};

db.updateVerification = (id_account, code) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE verification SET code=$1, expired = timezone('Asia/Ho_Chi_Minh'::text, now()) WHERE id_account=$2`,
      [code, id_account],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result.rows);
      }
    );
  });
};

db.insertVerification = (id_account, code) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "INSERT INTO verification (id_account, code) values ($1,$2)",
      [id_account, code],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result.rows);
      }
    );
  });
};

db.hasEmailAccount = (email) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM employee WHERE email = $1",
      [email],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result.rows[0]);
      }
    );
  });
};

db.isHasCodeAndEmail = (id_account, code) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT id_account FROM verification WHERE id_account = $1 AND code = $2",
      [id_account, code],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result.rowCount > 0);
      }
    );
  });
};

db.checkTimeCode = (id_account) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT expired + interval '${30}' minute >= timezone('Asia/Ho_Chi_Minh'::text, now()) AS valid FROM verification WHERE id_account = $1 ORDER BY expired DESC LIMIT 1`,
      [id_account],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result.rows[0].valid);
      }
    );
  });
};

db.deleteAccountVerification = (id_account) => {
    return new Promise((resolve, reject) => {
        pool.query('DELETE FROM verification WHERE id_account = $1',
            [id_account],
            (err, result) => {
                if (err) return reject(err);
                return resolve(1);
            })
    })
}

module.exports = db;
