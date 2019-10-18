var tableModel = {
    tableName: 'TBL_User',
    idAttribute: 'idUser'
};
const sha1 = require('sha1');
const mailer = require('../../config/mailer');

module.exports = (express, mysql) => {
    const router = express.Router();
    router.route('/logout')
        .get(
            (req, res) => {
                delete req.session.user_id;
                delete req.session.username;
                delete req.session.user_fullname;
                res.redirect('/');

            });

    router.route('/changeSecurity').post(
        (req, res) => {
            if (req.body.type === 'mail') {
                mysql.query(
                    "INSERT INTO TBL_UserAuthType(idUserAuthType,idTypeAuth,idUser,status) "
                    + "VALUES(" + req.body.temp + "," + req.body.value + "," + req.session.user_id + "," + (req.body.value === 'true' ? 1 : 0) + ") ON DUPLICATE KEY UPDATE "
                    + "status=" + (req.body.value == 'true' ? 1 : 0)
                    )
                    .then(
                        result => {
                           // console.log(result);
                            res.send({ status: true });

                        })
                    .catch(
                        err => {
                            console.log(err);
                            res.send({ status: false });

                        });
            } else {
                res.send({ status: false });
            }
        });



    router.route('/signin')
        .get(
            (req, res) => {
                //console.log(req.session.user_id);
                if (req.session.user_id) {
                    res.redirect('/');
                } else {
                    res.render('signin',
                        {
                            obj: {},
                            errors: []
                        });
                }
            })
        .post( /* Insertar */
            (req, res) => {
               //console.log(req.body);
                var objTemp = {
                    name: req.body.name,
                    lastname: req.body.lastname,
                    email: req.body.email,
                    phone: req.body.phone,
                    birthday: req.body.birthday || null,
                    //username: req.body.email,
                    password: sha1(req.body.p_password)
                };
                mysql.count({
                    tableModel: tableModel,
                    conditions: {
                        where: "email = '" + req.body.email + "'"
                    }
                })
                    .then(
                        result => {
                            if (result.counter > 0) {
                               // console.log("usuario ya existe");
                                res.render('signin', {
                                    obj: objTemp,
                                    errors: ["Usuario/Correo ya existe..."]
                                });
                                //Usuario ya existe
                                //response.send(res, null, 'Etiqueta  ya existe...', "Error", {});
                            } else {
                                mysql.save({
                                    obj: objTemp,
                                    tableModel: tableModel
                                })
                                    .then(
                                        result => {
                                            req.session.user_id = result.idUser;
                                            req.session.username = result.email;
                                            req.session.user_fullname = result.name + ' ' + (result.lastname || '');
                                            res.redirect('/');
                                            //console.log(result);
                                            //response.send(res, result, 'Usuario Creado', 'Tag add');
                                        })
                                    .catch(
                                        err => {
                                            console.log(err);
                                            res.render('signin', {
                                                obj: objTemp,
                                                errors: ["A ocurrido un error, intente mas tarde"]
                                            });
                                            //response.send(res, null, "A ocurrido un error", "Error", err);
                                        });
                            }
                        })
                    .catch(
                        err => {
                            console.log(err);
                            res.render('signin', {
                                obj: objTemp,
                                errors: ["A ocurrido un error, intente mas tarde"]
                            });
                            //response.send(res, null, "A ocurrido un error", "Error", err);
                            //console.log(err);
                        });
            });


    router.route('/login')
        .get(
            (req, res) => {
                res.render('login', {
                    errors: []
                });
            })
        .post(
            (req, res) => {
                //console.log(req.body);

                mysql.find({
                    tableModel: {
                        tableName: 'TBL_User',
                        idAttribute: 'email'
                    },
                    params: {
                        id: req.body.username,
                        fields: ['idUser', 'email', 'name', 'lastname']
                    },
                    conditions: {
                        where: "password = '" + sha1(req.body.password) + "'"
                    }
                })
                    .then(
                        result => {
                           // console.log(result);

                            if (result.idUser) {
                                
                                //Usuario correcto Login
                                req.session.user_id = result.idUser;
                                req.session.username = result.email;
                                req.session.user_fullname = result.name + ' ' + (result.lastname || '');

                                /* Verificación doble autenticación */
                                mysql.query(
                                    `SELECT TAUth.idTypeAuth, 
                                        TAUth.code, 
                                        TAUth.name, 
                                        UAuth.status, 
                                        u.username, 
                                        u.idUser, 
                                        u.email FROM TBL_User u 
                                        INNER JOIN TBL_UserAuthType UAuth 
                                        ON u.idUser = UAuth.idUser 
                                        INNER JOIN TBL_TypeAuth TAUth 
                                        ON TAUth.idTypeAuth = UAuth.idTypeAuth 
                                        WHERE UAuth.status = 1 AND TAUth.code='mail' 
                                        AND u.idUser =` + req.session.user_id)
                                    .then(
                                        result => {
                                            //console.log(result.length);

                                            if (result.length > 0) { //Encontro verificacion habilitada
                                                req.session.TwoFA = result[0].idUser;
                                                res.redirect('/');
                                            } else {
                                                res.redirect('/');
                                            }
                                        })
                                    .catch(
                                        err => {
                                           console.log(err)
                                            res.render('login', {
                                                username: req.body.username,
                                                errors: [
                                                    'A ocurrido un error, intentalo mas tarde'
                                                ]
                                            });
                                        });
                                /* end Auth Type */

                            } else {
                                // Usuario Incorrecto
                                res.render('login', {
                                    username: req.body.username,
                                    errors: [
                                        'Usuario/Contraseña incorrecto.'
                                    ]
                                });
                            }
                        })
                    .catch(
                        err => {
                            console.log(err);
                            res.render('login', {
                                username: req.body.username,
                                errors: [
                                    'A ocurrido un error, intentalo mas tarde'
                                ]
                            });
                        });
            });



    router.route('/confirm')
        .get(
            (req, res) => {
                //console.log(req.query.resend);
                if (
                    req.session.TwoFA
                    && req.session.user_id
                    && req.session.username
                ) {
                    mysql.query(
                        "INSERT INTO TBL_Token "
                        + "SET token = UPPER(LEFT(UUID(), 5)), "
                        + "expirate = ADDTIME(NOW(), '00:15:00'), "
                        + "idUser = " + req.session.user_id
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
                                                to: req.session.username,
                                                token: result.token
                                            })
                                                .then(result => {
                                                    //console.log(result);
                                                    res.render('check', {
                                                        mail: req.session.username,
                                                        errors: [],
                                                        info: req.query.resend == 'true' ? ['Se a generado un nuevo código, verificar'] : []
                                                    });
                                                })
                                                .catch(
                                                    error => {
                                                        console.log(error);
                                                        res.render('check', {
                                                            mail: req.session.username,
                                                            errors: ['A ocurrido un error, intentar mas tarde...'],
                                                            info: []
                                                        });
                                                        /* res.status = 503;
                                                        res.send(
                                                            {
                                                                error: 1,
                                                                message: 'A ocurrido un error, intentar mas tarde...'
                                                            }); */
                                                    });
                                        })
                                        .catch(
                                            err => {
                                                console.log(err);

                                                res.render('check', {
                                                    mail: req.session.username,
                                                    errors: ['A ocurrido un error, intentar mas tarde...'],
                                                    info: []
                                                });
                                            });
                                } else {

                                    res.render('check', {
                                        mail: req.session.username,
                                        errors: ['A ocurrido un error, intentar mas tarde...'],
                                        info: []
                                    });
                                }

                            }).catch(
                                err => {
                                    console.log(err);

                                    res.render('check', {
                                        mail: req.session.username,
                                        errors: ['A ocurrido un error, intentar mas tarde...'],
                                        info: []
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

            })
        .post( /* Insertar */
            (req, res) => {
                if (
                    req.session.TwoFA
                    && req.session.user_id
                    && req.session.username
                ) {

                    if (req.body.code) {
                        mysql.count(
                            {
                                tableModel: {
                                    idAttribute: 'idToken',
                                    tableName: "TBL_Token"
                                },
                                conditions: {
                                    where: "expirate >= NOW() AND idUser = " + req.session.user_id + " AND token = '" + req.body.code + "'"
                                }
                            }
                        )
                            .then(
                                result => {
                                    //console.log(result);
                                    if (result.counter == 1) {
                                        delete req.session.TwoFA;
                                        res.redirect('/');
                                    } else {
                                        res.render('check', {
                                            mail: req.session.username,
                                            info: [],
                                            errors: ["Código invalido, intentar de nuevo..."]
                                        });
                                    }
                                })
                            .catch(
                                err => {
                                    console.log(err);
                                    res.render('check', {
                                        mail: req.session.username,
                                        info: [],
                                        errors: ["A ocurrido un error, intentar mas tarde..."]
                                    });
                                });
                    } else {
                        res.render('check', {
                            mail: req.session.username,
                            info: [],
                            errors: ["No hay codigo para validar..."]
                        });
                    }

                }
                else {
                    res.status = 401;
                    res.send(
                        {
                            error: 1,
                            message: 'Acciones no autorizadas...'
                        });
                }
            });

    
    return router;
};