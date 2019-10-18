
var nodemailer = require('nodemailer'); // email sender function 

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'roni.quevedo24@gmail.com',
        pass: 'miGuate2019*'
    }
});

const mailer = {
    sendToken: (mail) => {
        return new Promise(function (resolve, reject) {
            //console.log(mail);
            if (mail.to && mail.token) {
                var mailOptions = {
                    from: '"2Auth" <abdul74@ethereal.email>',
                    to: mail.to,
                    subject: '2Auth | Código de acceso',
                    html:
                        '<!DOCTYPE html>'
                        + '<html lang="es">'
                        + '<head>'
                        + '  <meta charset="UTF-8">'
                        + '  <meta name="viewport" content="width=device-width, initial-scale=1.0">'
                        + '  <meta http-equiv="X-UA-Compatible" content="ie=edge">'
                        + '  <title>Codigo Validacion</title>'
                        + '  <style>'
                        + '    * {'
                        + '      margin: 0;'
                        + '      padding: 0;'
                        + '      font-family: BlinkMacSystemFont, -apple-system, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;'
                        + '    }'
                        + '    header {'
                        + '      padding: 3px 0;'
                        + '      display: block;'
                        + '      width: 100%;'
                        + '      min-height: 1.5em;'
                        + '      background-color: #00d1b2;'
                        + '    }'
                        + '    header > h1 {'
                        + '      text-align: center;'
                        + '      color: #fff;'
                        + '      text-shadow: 0 0 5px #000;'
                        + '    }'
                        + '    .container{'
                        + '      margin: 0 auto;'
                        + '      text-align:center'
                        + '    }'
                        + '    .title {'
                        + '      display: inline-block;'
                        + '      text-align: center;'
                        + '      border-bottom: 5px solid #c3b0b0;'
                        + '      margin-bottom: 10px;'
                        + '    }'
                        + '    .subtitle {'
                        + '      display: block;'
                        + '      text-align: center;'
                        + '      font-size: 2em;'
                        + '      color: #4a4a4a;'
                        + '    }'
                        + '    .content{'
                        + '      text-align:center;'
                        + '    }'
                        + '  </style>'
                        + '</head>'
                        + '<body>'
                        + '  <header>'
                        + '    <h1>2FAuth</h1>'
                        + '  </header>'
                        + '  <div class="container">'
                        + '    <h1 class="title">Confirmación</h1>'
                        + '    <br>'
                        + '    <p class="content">'
                        + '      Este es tu código de confirmación'
                        + '    </p>'
                        + '      <h2 class="subtitle">'
                        + '        ' + mail.token
                        + '      </h2>'
                        + '    <p class="content">'
                        + '      Estara valido durante 15 minutos =D'
                        + '    </p>'
                        + '  </div>'
                        + '</body>'
                        + '</html>'
                };
                transporter.sendMail(mailOptions, (error, info)  => {
                    if (error) {
                         reject(error);
                    } else {
                        resolve({
                            info: 'Correo enviado...',
                            response: info
                        });
                    }
                });
            } else {
                reject({
                    error: 'Datos incompletos'
                });
            }

        });
    },
    sendMail: (mail) => {

    }
}



module.exports = mailer;