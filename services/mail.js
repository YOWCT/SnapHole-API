var api_key = process.env.MAILGUN_KEY;
var domain = 'ott311.esdev.xyz';
var mailgun = require('mailgun-js')({ apiKey: api_key, domain: domain });

var data = {
    from: process.env.FROM_EMAIL,
    to: 'devisscher.thomas@gmail.com',
    subject: 'Hello',
    text: 'Testing some Mailgun awesomness!'
};

exports.sendEmail = function(data) {
    mailgun.messages().send(data, function(error, body) {
        console.log(body);
    });
}