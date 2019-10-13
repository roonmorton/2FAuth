var tableModel = {
    tableName: 'TBL_User',
    idAttribute: 'idUser'
};
module.exports = (express, mysql) => {
    const router = express.Router();

    router.route('/signin')
        .get(
            (req, res) => {
                console.log(req.session.user_id);
                if (req.session.user_id) {
                    res.redirect('/');
                } else {
                    res.render('signin');
                }
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
                                            req.session.user_username = result.username;
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


    router.route('/login')
        .get(
            (req, res) => {
                console.log(req.session.user_id);
                if (req.session.user_id) {
                    res.redirect('/');
                } else {
                    res.render('login');
                }
            })
        .post(
            (req, res) => {
                //console.log(req.body);

                mysql.find({
                    tableModel: tableModel,
                    params: {
                        id: req.params.id,
                        fields: ['idUser', 'username'],
                        where: "(username='"+ req.body.email +"' OR email='" + req.body.email + "') AND password = '" + req.body.password + "'"
                    }
                })
                    .then(
                        result => {
                            if (result) {
                                //Usuario correcto Login
                                req.session.user_id = result.idUser;
                                mysql.query(
                                    "SELECT TAUth.idTypeAuth, " +
                                    "TAUth.code, " +
                                    "TAUth.name, " +
                                    "TAUth.status, " +
                                    "u.username, " +
                                    "u.idUser  FROM TBL_User u " +
                                    "INNER JOIN TBL_UserAuthType UAuth " +
                                    "ON u.idUser = UAuth.idUser " +
                                    "INNER JOIN TBL_TypeAuth TAUth " +
                                    "ON TAUth.idTypeAuth = UAuth.idTypeAuth " +
                                    "WHERE TAUth.status = 1 AND u.idUser = " + req.session.user_id)
                                    .then(
                                        result => {
                                            console.log(result);
                                            if (result.length > 0) { //Encontro verificacion habilitada

                                                /* mysql.query(
                                                    "SELECT TAUth.idTypeAuth, " +
                                                    "TAUth.code, " +
                                                    "TAUth.name, " +
                                                    "TAUth.status, " +
                                                    "u.username, " +
                                                    "u.idUser  FROM TBL_User u " +
                                                    "INNER JOIN TBL_UserAuthType UAuth " +
                                                    "ON u.idUser = UAuth.idUser " +
                                                    "INNER JOIN TBL_TypeAuth TAUth " +
                                                    "ON TAUth.idTypeAuth = UAuth.idTypeAuth " +
                                                    "WHERE AND u.idUser = " + req.session.user_id)
                                                    .then(
                                                        result => {
                                                            console.log(result);
                                                                res.render('check', {
                                                                    auths: result
                                                                });
                                                        })
                                                    .catch(
                                                        err => {
                                                            //Ocurrio un error devolver
                                                            response.send(res, null, "A ocurrido un error", "Error", err);
                                                            console.log(err);
                                                        }); */
                                                /* res.render('check',{
                                                    auths: result
                                                }); */
                                            } else {
                                                res.redirect('/');
                                            }
                                        })
                                    .catch(
                                        err => {

                                            //Ocurrio un error devolver
                                            //response.send(res, null, "A ocurrido un error", "Error", err);
                                            //console.log(err);
                                        });
                                /* end Auth Type */

                            } else {
                                // Usuario Incorrecto
                                res.render('login', {
                                    username: req.body.username
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
                                            req.session.user_username = result.username;
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