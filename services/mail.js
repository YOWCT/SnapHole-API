let { MAILGUN_KEY, MAILGUN_DOMAIN } = process.env;
MAILGUN_KEY = MAILGUN_KEY || 'unknown-key'

const domain = MAILGUN_DOMAIN;
const mailgun = require('mailgun-js')({ apiKey: MAILGUN_KEY, domain: domain });

exports.sendEmail = (data) => {
    mailgun.messages().send(data, (error, body) => {
        if (error) {
            console.log(error);
        } else {
            console.log(body);
        }

    });
    //console.log(data);
}