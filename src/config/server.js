const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const env = require('dotenv').config();

/* var cors = require('cors'); */


/* Configuration */

app.set('port', process.env.PORTAPP || 3000);





/* Middlewares */


//app.set('views',path.join('/', 'views'));

app.set('view engine', 'pug');


/* app.use(bodyParser.json());

app.use(cors()); */

/* app.use(
  (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");

    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );

    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, DELETE, OPTIONS, PUT");
    next();
  }); */

module.exports = app;