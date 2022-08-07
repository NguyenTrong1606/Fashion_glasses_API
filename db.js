const Pool = require('pg').Pool;

const pool = new Pool({
    host: "localhost",
    database:"DBMatKinh",
    user: "postgres",
    password: "123",
    port: 5432,
});


module.exports = pool;