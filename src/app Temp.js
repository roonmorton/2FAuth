const express = require('express');
const app = require('./config/server');
const mysql = require('./config/db-mysql');
const path = require('path');
const session = require('express-session');
const session_middleware = require('./app/middlewares/session');
const mailer = require('./config/mailer');
app.set('views', path.join(__dirname, 'views'));

const security = require('./app/routes/security')(express, mysql);
const config = require('./app/routes/config')(express, mysql);


app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use('/public', express.static(__dirname + '/public'));





/* Routes modules */

app.use(security);
app.use(config);

app.route('/')
    .post((req, res) => {
        req.session.TwoFA = 2;
        req.session.user = {
            id: 2,
            user: 'roonmorton@gmail.com'
        };
        //console.log(req.session);
        if (
            req.session.TwoFA
            && req.session.user.id
            && req.session.user.user
        ) {

            if (req.body.code) {
                mysql.query(
                    {
                        tableModel: {
                            idAttribute: 'idToken',
                            tableName: "TBL_Token"
                        },
                        conditions: {
                            where: "expirate >= NOW() AND idUser = " + req.session.user.id + " AND token = '" + req.body.code + "'"
                        }
                    }
                )
                    .then(
                        result => {
                            console.log(result);
                            if (result.counter == 1) {
                                delete req.session.TwoFA;
                                res.redirect('/');
                            } else {
                                res.render('check', {
                                    errors: ["Código invalido, intentar de nuevo..."]
                                });
                            }
                        })
                    .catch(
                        err => {
                            res.render('check', {
                                errors: ["A ocurrido un error, intentar mas tarde..."]
                            });
                        });
            } else {
                res.render('check', {
                    errors: ["No hay codigo para validar..."]
                });
            }

        } else {
            res.status = 401;
            res.send(
                {
                    error: 1,
                    message: 'Acciones no autorizadas...'
                });
        }
    });

app.route("/renew-token")
    .get((req, res) => {
        req.session.TwoFA = 2;
        req.session.user = {
            id: 2,
            user: 'roonmorton@gmail.com'
        };
        //console.log(req.session);
        if (
            req.session.TwoFA
            && req.session.user.id
            && req.session.user.user
        ) {
            mysql.query(
                "INSERT INTO TBL_Token "
                + "SET token = UPPER(LEFT(UUID(), 5)), "
                + "expirate = ADDTIME(NOW(), '00:15:00'), "
                + "idUser = " + req.session.user.id
            )
                .then(
                    result => {
                        //console.log(result);
                        if (result.insertId) {
                            mysql.find(
                                {
                                    tableModel: {
                                        idAttribute: 'idToken',
                                        tableName: "TBL_Token"
                                    },
                                    params: {
                                        id: result.insertId
                                    }
                                }
                            ).then(
                                result => {
                                    //console.log(result);
                                    //var token = result.token;
                                    mailer.sendToken({
                                        to: req.session.user.user,
                                        token: result.token
                                    })
                                        .then(result => {
                                            //console.log(result);
                                            res.send({
                                                error: 0,
                                                message: result.info
                                            });
                                        })
                                        .catch(
                                            error => {
                                                //console.log(error);
                                                res.status = 503;
                                                res.send(
                                                    {
                                                        error: 1,
                                                        message: 'A ocurrido un error, intentar mas tarde...'
                                                    });
                                            });
                                })
                                .catch(
                                    err => {
                                        res.status = 503;
                                        res.send(
                                            {
                                                error: 1,
                                                message: 'A ocurrido un error, intentar mas tarde...'
                                            });
                                    });
                        } else {
                            res.status = 503;
                            res.send(
                                {
                                    error: 1,
                                    message: 'A ocurrido un error, intentar mas tarde...'
                                });
                        }

                    }).catch(
                        err => {
                            //console.log(err.sql);
                            res.status = 503;
                            res.send(
                                {
                                    error: 1,
                                    message: 'A ocurrido un error, intentar mas tarde...'
                                });
                        });
        } else {
            res.status = 401;
            res.send(
                {
                    error: 1,
                    message: 'Acciones no autorizadas...'
                });
        }
    });


app.get('/',
    (req, res) => {
        //req.session.user_id = '00021';
        //console.log(req.session);

        mysql.query(
            "SELECT TAUth.idTypeAuth, " +
            "TAUth.code, " +
            "TAUth.name, " +
            "TAUth.status, " +
            "u.username, " +
            "u.idUser, " +
            "u.email FROM TBL_User u " +
            "INNER JOIN TBL_UserAuthType UAuth " +
            "ON u.idUser = UAuth.idUser " +
            "INNER JOIN TBL_TypeAuth TAUth " +
            "ON TAUth.idTypeAuth = UAuth.idTypeAuth " +
            "WHERE TAUth.status = 1 AND u.idUser = " + req.session.user_id)
            .then(
                result => {
                    //console.log(result);
                    if (result.length > 0) { //Encontro verificacion habilitada
                        req.session.TwoFA = result.idUser;
                        res.redirect('/');
                    } else {
                        res.redirect('/');
                    }
                })
            .catch(
                err => {
                    res.redirect('/');
                    //Ocurrio un error devolver
                    //response.send(res, null, "A ocurrido un error", "Error", err);
                    //console.log(err);
                });

        res.render('index', {
            title: 'Inicio',
            idUser: req.session.user_id,
            fullname: req.session.user_fullname
        });
    });

/* app.get('/login',
    (req, res) => {
        res.render('login');
    });
app.post('/login',
    (req, res) => {

        //res.render('login');
    }); */






// Start the server
app.listen(app.get('port'),
    () => {
        console.log('Server on port: ' + app.get('port'));
    });