var api_key = process.env.MAILGUN_KEY;
var domain = 'mg.esdev.xyz';
var mailgun = require('mailgun-js')({ apiKey: api_key, domain: domain });

exports.sendEmail = function(data) {
    mailgun.messages().send(data, function(error, body) {
        console.log(body);
    });
    console.log(data);
}