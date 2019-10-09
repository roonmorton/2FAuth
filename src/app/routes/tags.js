var tableModel = {
    tableName: 'TBL_Tag',
    idAttribute: 'idTag'
};
module.exports = (express, mysql, response) => {
    const router = express.Router();

    /* REST Tags */
    router.route('/tags/:id')
        .get( /* Obtener */
            (req, res) => {
                mysql.find({
                    tableModel: tableModel,
                    params: {
                        id: req.params.id,
                        fields: ['idTag', 'name', 'description']
                    }
                })
                    .then(
                        result => {
                            response.send(res, result, 'Successfully', 'Complete transaction');
                        })
                    .catch(err => {
                        response.send(res, null, '', 'Error', err);
                    });
            })
        .put( /* Actualizar */
            (req, res) => {

                mysql.count({
                    tableModel: tableModel,
                    conditions: {
                        where: "idTag <> " + req.params.id + " AND name='" + req.body.name + "'"
                    }
                })
                    .then(
                        result => {
                            if (result.counter > 0) {
                                response.send(res, null, 'Etiqueta ya existe', "Error", {});
                            } else {

                                mysql.save({
                                    obj: {
                                        id: req.params.id,
                                        name: req.body.name,
                                        description: req.body.description,
                                        update_user: req.body.user || ''
                                    },
                                    tableModel: tableModel
                                })
                                    .then(
                                        result => {
                                            console.log("Editado");
                                            response.send(res, result, 'Successfully', 'Complete transaction');

                                        })
                                    .catch(
                                        err => {
                                            response.send(res, null, "A ocurrido un error", "Error", err);
                                        });
                            }
                        })
                    .catch(
                        err => {
                            response.send(res, null, "A ocurrido un error", "Error", err);
                            console.log(err);
                        });

            }).delete( /* Eliminar */
                (req, res) => {
                    mysql.delete({
                        id: req.params.id,
                        tableModel: tableModel
                    })
                        .then(
                            result => {
                                response.send(res, result, 'Successfully', 'Complete transaction');
                                //console.log(result);
                            })
                        .catch(
                            err => {
                                response.send(res, null, "A ocurrido un error", "Error", err);
                                //console.log(err);
                            });
                });


    

    router.route('/tags')
        .get( /* Obtner todo */
            (req, res) => {
                mysql.fetch({
                    tableModel: tableModel,
                    conditions: {
                        fields: ["*"],
                        limit: [0, 10],
                        order: tableModel.idAttribute,
                        orderDESC: true,
                        where: "name like '%" + (req.query.q || '') + "%'"
                    }
                })
                    .then(
                        result => {
                            response.send(res, result, 'Successfully', 'Complete transaction');
                        })
                    .catch(
                        err => {
                            response.send(res, null, "A ocurrido un error", "Error", err);
                        });
            })
        .post( /* Insertar */
            (req, res) => {
                mysql.query("select count(1) counter FROM TBL_Tag tag INNER JOIN Tag_has_Business thb ON tag.idTag = thb.idTag INNER JOIN TBL_Business business ON business.idBusiness = thb.idBusiness INNER JOIN TBL_User u ON u.idUser = business.idUser WHERE u.idUser = " + (req.body.idUser || '0'))
                    .then(
                        result => {
                            if (result.counter > 0) {
                                response.send(res, null, 'Etiqueta  ya existe...', "Error", {});
                            } else {
                                mysql.save({
                                    obj: {
                                        name: req.body.name,
                                        description: req.body.description
                                    },
                                    tableModel: tableModel
                                })
                                    .then(
                                        result => {
                                            response.send(res, result, 'Etiqueta creada', 'Tag add');
                                        })
                                    .catch(
                                        err => {

                                            response.send(res, null, "A ocurrido un error", "Error", err);
                                        });
                            }
                        })
                    .catch(
                        err => {
                            response.send(res, null, "A ocurrido un error", "Error", err);
                            console.log(err);
                        });
            });
    return router;
};