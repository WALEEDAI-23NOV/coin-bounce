const express = require('express');
const {PORT} = require('./config/index');
const dbconnect = require('./database/index');
const errorHandler = require('./middlewares/errorHandler');
const router = require('./routes/index');
const cookieParser = require('cookie-parser')

const app = express();

app.use(cookieParser());

app.use(express.json());

app.use(router);

dbconnect();

app.use(errorHandler);

app.listen(PORT, console.log(`backend is running on port : ${PORT}`));