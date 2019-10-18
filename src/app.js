const express = require('express');
const app = require('./config/server');
const mysql = require('./config/db-mysql');
const path = require('path');
const session = require('express-session');

const session_middleware = require('./app/middlewares/session');

/* Configuración PUG */
app.set('views', path.join(__dirname, 'views'));
app.use('/public', express.static(__dirname + '/public'));


/* Rutas */
const security = require('./app/routes/security')(express, mysql);
const home = require('./app/routes/home')(express, mysql);


/* Configuracion Session */
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));


/* Routes modules */

app.use(session_middleware, security);
app.use(session_middleware, home);




// Start the server
app.listen(app.get('port'),
    () => {
        console.log('Server on port: ' + app.get('port'));
    });