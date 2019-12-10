let jwt = require('jsonwebtoken');
var randtoken = require('rand-token');
var refreshTokens = {};

module.exports = (mysql) => {
    return {
        login: (req, res) => {
            let username = req.body.username;
            let password = req.body.password;
            if (username && password) { 
                mysql.query("SELECT CONCAT(COALESCE(TBL_User.name,''), ' ' ,COALESCE(TBL_User.lastname,'')) AS fullname FROM TBL_User WHERE TBL_User.username = '" + username + "' AND TBL_User.password = md5('" + password + "')  AND TBL_User.status = 1")
                    .then(
                        result => {
                            //console.log(result);
                            if (result.length == 1) {
                                let token = jwt.sign({ username: username},
                                    process.env.SECRET, { expiresIn: '24h' /* '1h' */ }
                                );
                                var refreshToken = randtoken.uid(256);
                                refreshTokens[refreshToken] = username;
                                // return the JWT token for the future API calls
                                //console.log(refreshTokens);
                                res.status(200).send({
                                    success: true,
                                    message: 'Authentication successful!',
                                    token: "JWT " + token,
                                    rerefreshToken: refreshToken,
                                    fullname: result[0].fullname,
                                    role: 'administrator'
                                });
                            } else {
                                res.status(401).send({
                                    success: false,
                                    message: 'Incorrect username or password'
                                });
                            }
                        })
                    .catch(err => {
                        //code 403
                        res.status(401).send({
                            success: false,
                            message: 'Incorrect username or password'
                        });
                    });
            } else {
                //code 400
                res.status(400).send({
                    success: false,
                    message: 'Authentication failed! Please check the request'
                });
            }
        },
        index: (req, res) => {
            res.send({
                success: true,
                message: 'Index page'
            });
        },
        checkToken: (req, res, next) => {
            //console.log(req.headers);
            let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase

            if (token) {
                if (token.startsWith('Bearer ')) {
                    // Remove Bearer from string
                    token = token.slice(7, token.length);
                    if(token.startsWith('JWT ')){
                        token = token.slice(4,token.length);
                    }
                }

                jwt.verify(token, process.env.SECRET, (err, decoded) => {
                    if (err) {
                        return res.status(401).send({
                            success: false,
                            message: 'Token is not valid'
                        });
                    } else {
                        //console.log(decoded);
                        req.decoded = decoded;
                        next();
                    }
                });
            } else {
                return res.status(401).send({
                    success: false,
                    message: 'Auth token is not supplied'
                });
            }
        },
        refresh: (req, res, next) => {
            var username = req.body.username;
            var refreshToken = req.body.refreshToken;

            if ((refreshToken in refreshTokens) && (refreshTokens[refreshToken] == username)) {

                var newToken= jwt.sign(
                    { username: username },
                    process.env.SECRET, { expiresIn: '1h' }
                )
                res.json({ token: 'JWT ' + newToken });
            }
            else {
                return res.status(401).send({
                    success: false,
                    message: 'Invalid refresh'
                });
            }
            
            
        },
        reject: (req, res, next) => {
            var refreshToken = req.body.refreshToken;
            if (refreshToken in refreshTokens) {
                delete refreshTokens[refreshToken];
            }
            res.send(204);
        }
    }
}