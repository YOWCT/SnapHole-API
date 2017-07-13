let {MAILGUN_KEY} = process.env;
MAILGUN_KEY = MAILGUN_KEY || 'unknown-key'

const domain = 'mg.esdev.xyz';
const mailgun = require('mailgun-js')({ apiKey: MAILGUN_KEY, domain: domain });

exports.sendEmail = (data) => {
    mailgun.messages().send(data, (error, body) => {
        console.log(body);
    });
    console.log(data);
}
