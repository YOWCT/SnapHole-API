var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    async = require('async'),
    User = mongoose.model('User'),
    crypto = require('crypto'),
    mail = require('../services/mail');

/* GET users listing. */
router.get('/', function(req, res, next) {
    query = {};
    User.find(query, function(err, users) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(users);
        }
    });
});


router.get('/register', function(req, res, next) {
    res.render('register', { title: 'Register Form' });
});

router.post('/register', function(req, res, next) {
    async.waterfall([
            //create randome token: crypto library?
            function(done) {
                crypto.randomBytes(20, function(err, buf) {
                    var token = buf.toString('hex');
                    done(err, token);
                });
            },
            function(token, done) {
                // Create account:
                var newUser = new Object(req.body);
                newUser.token = token;
                newUser.tokenExpire = Date.now() + 60 * 60 * 1000;
                mongoose.model('User').create({
                    first_name: newUser.first_name,
                    last_name: newUser.last_name,
                    email: newUser.email,
                    token: newUser.token,
                    tokenExpire: newUser.tokenExpire
                }, function(err, user) {
                    if (err) {
                        res.send("There was a problem adding user to the database.");
                        console.log(err)
                    } else {
                        done(null, token, user)
                    }
                });
            },
            // Send email
            function(token, user, done) {
                console.log(token);
                var url = process.env.DOMAIN + "users/activate/" + token;
                var data = {
                    from: process.env.FROM_EMAIL,
                    to: user.email,
                    subject: 'Account Activation',
                    text: url
                };

                mail.sendEmail(data);
                done(null, token, user);



                /*    /// CREATE EMAIL FOR CONFIRMATION AND LOGIN OF USER ON THE PHONE
                    const templateDir = path.join(__dirname, '../emails', 'activate');
                    const forgot = new EmailTemplate(templateDir);
                    const link = process.env.DOMAIN_NAME + '/account/activate/' + token //changed reset to activate
                    const info = { email: user.email, link: link }
                    forgot.render(info, function(err, result) {
                        if (err) {
                            console.log(err);
                        } else {
                            let options = {
                                to: user.email,
                                bcc: process.env.DEVELOPER,
                                from: process.env.FROM_EMAIL,
                                subject: 'Account activation: ' + user.email,
                                text: "Please use the following link to activate your account: " + info.link,
                                body: result.html
                            }
                            helpers.sendEmailThroughSendGrid(options);
                            console.log("User's email is: " + user.email)
                        }
                    });

                    */
            },
            // Respond to client app
            function(token, user, done) {
                //    req.flash('success', 'We sent you an email with further instructions')
                //    res.redirect('/')
                done(null, "done");
            }
        ],
        function(err, result) {
            res.send(result);
            //    if (err) return next(err);
            //    res.redirect('/users/activate');
        });
});
module.exports = router;