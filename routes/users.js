var express = require('express');
var router = express.Router();
var mongoose = require('mongoose'),
    async = require('async'),
    User = mongoose.model('User');
const crypto = require('crypto');

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
    console.log(req.body);
    async.waterfall([
            //create randome token: crypto library?
            function(done) {
                crypto.randomBytes(20, function(err, buf) {
                    var token = buf.toString('hex');
                    done(err, token);
                });
            },
            // add user to database
            function(token, done) {
                // Create account:
                var newUser = new User(req.body);
                // Add token info
                newUser.token = token;
                newUser.tokenExpire = Date.now() + 3600000; // 1 hour
                newUser.save(function(err) {
                    done(err, token, user);
                });
                console.log(newUser);
            },
            // Send email
            function(token, user, done) {
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
                req.flash('success', 'We sent you an email with further instructions')
                res.redirect('/')
            }
        ],
        function(err) {
            if (err) return next(err);
            res.redirect('/users/activate');
        });
});
module.exports = router;