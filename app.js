const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const dotenv = require('dotenv');
const db = require('./db');
const fileUpload = require('express-fileupload');


// const drive = require('./drive');

dotenv.config();

app.use(express.json());

// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// for parsing multipart/form-data
// app.use(upload.array());
app.use(express.static('public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse application/json
app.use(bodyParser.json())

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: false, limit: '30mb' }));

app.use(fileUpload({
    limits: {
        fileSize: 30 * 1024 * 1024
    },
    abortOnLimit: true
}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === "OPTIONS") {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
        message: error
    })
});

// ----- My API V1
const apiUrl = '/api/v1';

//acount
app.use(`${apiUrl}/account`, require('./API/v1/routers/account'));

//customer
app.use(`${apiUrl}/customer`, require('./API/v1/routers/customer'));

//employee
app.use(`${apiUrl}/employee`, require('./API/v1/routers/employee'));

//category
app.use(`${apiUrl}/category`, require('./API/v1/routers/category'));

//Brand
app.use(`${apiUrl}/brand`, require('./API/v1/routers/brand'));

//product
app.use(`${apiUrl}/product`, require('./API/v1/routers/product'));

//comment
app.use(`${apiUrl}/comment`, require('./API/v1/routers/comment'));

//voucher
app.use(`${apiUrl}/voucher`, require('./API/v1/routers/voucher'));

//account-voucher
app.use(`${apiUrl}/account_voucher`, require('./API/v1/routers/account_voucher'));

//cart
app.use(`${apiUrl}/cart`, require('./API/v1/routers/cart'));

//orders
app.use(`${apiUrl}/orders`, require('./API/v1/routers/orders'));

//review
app.use(`${apiUrl}/review`, require('./API/v1/routers/review'));


module.exports = app;