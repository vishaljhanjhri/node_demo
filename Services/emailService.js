var nodemailer = require('nodemailer');
var handlebars = require('handlebars');
var fs = require('fs');


var mailConfig = {
    senderMail: '*********',
    senderPass: '******',
    service: 'gmail',
    subject: 'Thankyou for signup'
}

var transporter = nodemailer.createTransport({
    service: mailConfig.service,
    auth: {
        user: mailConfig.senderMail,
        pass: mailConfig.senderPass
    }
});

module.exports = function(user) {
    readHTMLFile(__dirname + '/templates/signupmail.html', function(err, html) {
        var template = handlebars.compile(html);
        var replacements = {
            username: user.username
        };
        var htmlToSend = template(replacements);
        var mailOptions = {
            from: mailConfig.senderMail,
            to: user.email,
            subject: mailConfig.subject,
            html: htmlToSend
        };
        sendMailWith(mailOptions, user)
    });

}

function sendMailWith(options, user) {
    transporter.sendMail(options, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response + " to " + mail.email);
        }
    });
}

var readHTMLFile = function(path, callback) {
    fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
        if (err) {
            throw err;
            callback(err);
        }
        else {
            callback(null, html);
        }
    });
};



