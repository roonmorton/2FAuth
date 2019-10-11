var tableModel = {
    tableName: 'TBL_User',
    idAttribute: 'idUser'
};
module.exports = (express, mysql) => {
    const router = express.Router();

    router.route('/config')
        .get(
            (req, res) => {
                console.log(req.session.user_id);
                //if (req.session.user_id) {
                   // res.redirect('/');
                //} else {
                    res.render('config');
                //}
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