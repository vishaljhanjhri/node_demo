var nodemailer = require('nodemailer');
var handlebars = require('handlebars');
var fs = require('fs');
var promise = require('bluebird')
var emailResponse = require('../model/EmailResponses')


var mailConfig = {
    senderMail: 'vishaljain529@gmail.com',
    senderPass: '*******',
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
    transporter.sendMail(options, function(error, info) {
    
        if (error) {
            console.log(error);
        } else {
            // console.log('Email sent: ', info.accepted);
            
            // promise.coroutine(function* () {
                for (let i = 0; i < info.accepted.length; i++) {
                    console.log('Email rejected: ', info.rejected);
                    var obj = new emailResponse()
                    obj.email = info.accepted[i];
                    obj.subject = options.subject;
                    obj.status = true;
                    obj.userId = user.id;

                    obj.save()
                }
                for (let i = 0; i < info.rejected.length; i++) {
                    var obj = new emailResponse()
                    obj.email = info.rejected[i];
                    obj.subject = options.subject;
                    obj.status = false;
                    obj.userId = user.id;

                    obj.save()
                }
            // });


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



