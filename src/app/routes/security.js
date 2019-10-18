var tableModel = {
    tableName: 'TBL_User',
    idAttribute: 'idUser'
};
const sha1 = require('sha1');
module.exports = (express, mysql) => {
    const router = express.Router();

    router.route('/changeSecurity').post(
        (req, res) => {

            if (req.body.type === 'mail') {

                mysql.query(
                    "INSERT INTO TBL_UserTypeAuth(idUserAuthType,idTypeAuth,idUser,status) "
                    + "VALUES(" + req.body.temp + "," + req.body.value + "," + req.session.user_id + "," + (req.body.value === 'true' ? 1 : 0) + ") ON DUPLICATE KEY UPDATE "
                    + "status=" + (req.body.value === 'true' ? 1 : 0))
                    .then(
                        result => {
                            console.log(result);
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
        }
    );
    router.route('/signin')
        .get(
            (req, res) => {
                console.log(req.session.user_id);
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
                console.log(req.body);
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
                                console.log("usuario ya existe");
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
                                            req.session.user_username = result.email;
                                            req.session.user_fullname = result.name; + ' ' + (result.lastname || '')
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
                            console.log("error");
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
                        fields: ['idUser', 'email', 'name', 'lastname'],
                        where: "password = '" + sha1(req.body.password) + "'"
                    }
                })
                    .then(
                        result => {
                            if (result) {
                                //Usuario correcto Login
                                req.session.user_id = result.idUser;
                                req.session.username = result.email;
                                req.session.user_fullname = result.name + ' ' + (result.lastname || '');

                                /* Verificación doble autenticación */
                                mysql.query(
                                    "SELECT TAUth.idTypeAuth, " +
                                    "TAUth.code, " +
                                    "TAUth.name, " +
                                    "TAUth.status, " +
                                    "u.username, " +
                                    "u.idUser, " +
                                    "u.email FROM TBL_User u " +
                                    "INNER JOIN TBL_UserTypeAuth UAuth " +
                                    "ON u.idUser = UAuth.idUser " +
                                    "INNER JOIN TBL_TypeAuth TAUth " +
                                    "ON TAUth.idTypeAuth = UAuth.idTypeAuth " +
                                    "WHERE TAUth.status = 1 AND TAUth.code='mail' AND u.idUser = " + req.session.user_id)
                                    .then(
                                        result => {
                                            console.log(result.length);
                                            
                                            if (result.length > 0) { //Encontro verificacion habilitada
                                                req.session.TwoFA = result[0].idUser;
                                                res.redirect('/');
                                            } else {
                                                res.redirect('/');
                                            }
                                        })
                                    .catch(
                                        err => {
                                            res.render('login', {
                                                username: req.body.username,
                                                errors: [
                                                    'A ocurrido un error, intentalo mas tarde'
                                                ]
                                            });
                                            //Ocurrio un error devolver
                                            //response.send(res, null, "A ocurrido un error", "Error", err);
                                            //console.log(err);
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
                res.render('check');
            })
        .post( /* Insertar */
            (req, res) => {
                console.log(req.body);

                mysql.count({
                    tableModel: tableModel,
                    conditions: {
                        where: "email = '" + req.body.email + "' OR username = '" + req.body.username + "'"
                    }
                })
                    .then(
                        result => {
                            if (result.counter > 0) {
                                console.log("usuario ya existe");
                                //Usuario ya existe
                                response.send(res, null, 'Etiqueta  ya existe...', "Error", {});
                            } else {
                                mysql.save({
                                    obj: {
                                        name: req.body.name,
                                        lastname: req.body.description || '',
                                        email: req.body.email,
                                        phone: req.body.phone,
                                        birthday: req.body.birthday || null,
                                        username: req.body.p_username,
                                        password: req.body.p_password
                                    },
                                    tableModel: tableModel
                                })
                                    .then(
                                        result => {
                                            req.session.user_id = result.idUser;
                                            req.session.user_username = result.email;
                                            req.session.user_fullname = result.name /* + ' ' + (result.lastname || '') */
                                            res.redirect('/');
                                            //console.log(result);
                                            //response.send(res, result, 'Usuario Creado', 'Tag add');
                                        })
                                    .catch(
                                        err => {
                                            console.log(err);

                                            response.send(res, null, "A ocurrido un error", "Error", err);
                                        });
                            }
                        })
                    .catch(
                        err => {
                            console.log("error");

                            response.send(res, null, "A ocurrido un error", "Error", err);
                            console.log(err);
                        });
            });
    return router;
};