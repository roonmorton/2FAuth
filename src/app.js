const express = require('express');
const app = require('./config/server');
const mysql = require('./config/db-mysql');
const path = require('path');
const session = require('express-session');
var nodemailer = require('nodemailer'); // email sender function 
const session_middleware = require('./app/middlewares/session');
app.set('views', path.join(__dirname, 'views'));
//app.use('/public', express.static('public'));

const security = require('./app/routes/security')(express, mysql);
const config = require('./app/routes/config')(express, mysql);


app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use('/public', express.static(__dirname + '/public'));

//const response = require('./config/my-response');
//const auth = require('./app/midlewares/auth')(mysql);





/* Routes modules */

app.use(session_middleware,security);
app.use(session_middleware, config);


app.route("/api/v1/sendEmail")
    .post((req, res) => {
        console.log("enviando mensaje");
        console.log(req.body);
        // Definimos el transporter
        var transporter = nodemailer.createTransport({
            //service: "gmail",
            host: 'mocha3031.mochahost.com',
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: 'support@esdavila.com.gt', // generated ethereal user
                pass: 'xQ@FDu]g;{xN' // generated ethereal password
            }
        });
        // Definimos el email
        var mailOptions = {
            from: '"Es Davila" <support@esdavila.com.gt>', // sender address
            to: 'es.davila2015@gmail.com', // list of receivers
            subject: 'Es Davila Contacto', // Subject line
            //text: 'Hello world?', // plain text body
            html:
                '<div style=" margin:0; padding: 0; width: 100%; height: 100%;">' +
                '<h1>Nuevo mensaje para Es Davila</h1><p>' +
                'De: <a href="mailto:' + (req.body.email || '') + '">' + (req.body.email || '') + '</a> <strong>' + (req.body.names || '') + '</strong>' +
                '</p><p>' +
                'Telefono: <strong>' + (req.body.phone || '') + '</strong>' +
                '</p><p>' +
                'Contacta por: <strong>' + (req.body.subject) + '</strong>' +
                '</p><p>' +
                '<strong>Mensaje:</strong>' +
                '<br>' + (req.body.message || 'No hay mensaje.') +
                '</p></div>'
            // html body
        };
        // Enviamos el email
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                //res.send(500, err.message);
                response.send(res, null, '', 'Error', error);
            } else {
                console.log("Email sent");
                //res.status(200).jsonp(req.body);
                response.send(res, {}, 'Successfully', 'Email sent');
            }
        });
    });
 

app.get('/',
    (req, res) => {
       //req.session.user_id = '00021';
        console.log(req.session);
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