module.exports = (express, mysql) => {
    const router = express.Router();
    router.route('/')
        .get(
            (req, res) => {
                //req.session.user_id = '00021';
                //console.log(req.session);

                mysql.query(
                    `SELECT  
                TAuth.idTypeAuth,
                UTAuth.idUserAuthType,
                TAuth.code,
                TAuth.description,
                TAuth.status AuthStatus,
                UTAuth.status,
                u.username, 
                u.idUser
                FROM TBL_TypeAuth TAuth
                LEFT JOIN TBL_UserAuthType UTAuth
                ON TAuth.idTypeAuth = UTAuth.idTypeAuth
                LEFT JOIN TBL_User u 
                ON u.idUser = UTAuth.idUser
                WHERE TAuth.status = 1 AND u.idUser = ` + req.session.user_id)
                    .then(
                        result => {
                            // console.log(result);
                            res.render('index', {
                                title: 'Inicio',
                                idUser: req.session.user_id,
                                fullname: req.session.user_fullname,
                                auths: result
                            });
                        })
                    .catch(
                        err => {
                            console.log(err);
                            res.render('index', {
                                title: 'Inicio',
                                idUser: req.session.user_id,
                                fullname: req.session.user_fullname,
                                auths: []
                            });
                        });
            });

    return router;
};