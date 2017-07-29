let { AWS_BUCKET, APP_NAME, FROM_EMAIL } = process.env;

var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    async = require('async'),
    passport = require('passport'),
    User = require('../models/user'),
    crypto = require('crypto'),
    path = require('path'),
    EmailTemplate = require('email-templates').EmailTemplate,
    mail = require('../services/mail'),
    helper = require('../services'),
    auth = require('../services/auth');

/* GET users listing. */
router.get('/', auth.loggedIn, function(req, res, next) {
    query = {};
    User.find(query, function(err, users) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(users);
        }
    });
});
router.get('/login', function(req, res, next) {
    var vm = {
        title: `${APP_NAME} - Login`,
        message: req.session.message || ""
    }
    res.render('users/login', vm);
});
router.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        successFlash: 'Logged in successfully',
        failureRedirect: '/users/login',
        failureFlash: true
    }),
    function(req, res) {
        res.redirect('/');
    });
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});
router.get('/register', function(req, res, next) {
    res.render('users/register', { title: `${APP_NAME} - Registration` });
});
router.post('/register', function(req, res, next) {
    var newUser = new Object(req.body);
    console.log(newUser)
    async.waterfall([
            function(done) {
                crypto.randomBytes(20, function(err, buf) {
                    var token = buf.toString('hex');
                    done(err, token);
                });
            },
            function(token, done) {
                newUser.token = token;
                newUser.tokenExpire = Date.now() + 60 * 60 * 1000;
                User.register(new User({
                        first_name: newUser.first_name,
                        last_name: newUser.last_name,
                        username: newUser.email,
                        token: newUser.token,
                        tokenExpire: newUser.tokenExpire
                    }), helper.guid(),
                    function(err, user) {
                        if (err) {
                            console.log(`################# ${err} #################`)

                            done(null, token, err)
                        } else {
                            done(null, token, user)
                        }
                    });
            },
            // Send email
            function(token, user, done) {
                console.log(token);
                const templateDir = path.join(__dirname, '../emails', 'activate');
                const activate = new EmailTemplate(templateDir);
                const url = process.env.DOMAIN + "/users/activate/" + token;
                const info = { email: newUser.email, url: url }
                activate.render(info, function(err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        var data = {
                            from: FROM_EMAIL,
                            to: newUser.email,
                            subject: 'Account Activation',
                            html: result.html
                        };
                        mail.sendEmail(data);


                    }
                    done(null, token, user);
                });
            },
            // Respond to client app
            function(token, user, done) {


                done(null, "done");
            }
        ],
        function(err, result) {
            if (result == 'done') {
                req.flash('success', 'We sent you an email with further instructions.')
                res.redirect('/users/login')
            } else {
                req.flash('error', 'There was an error.')
                res.send('error')
            }

        });
});
router.get('/activate/:token', function(req, res) {

    mongoose.model('User').findOne({ token: req.params.token, tokenExpire: { $gt: Date.now() } }, function(err, user) {
        if (user) {
            var vm = {
                title: `${APP_NAME} - Account activation`,
                toke: req.params.token,
                user: user,
                status: "Valid",
                message: req.session.message || ""
            }

        } else {
            var vm = {
                title: `${ APP_NAME } - Invalid token or expired token`,
                status: "Invalid"
            }

        }
        res.render('users/activate', vm);
    });

});
router.post('/activate/:token', function(req, res) {
    async.waterfall([
        function(done) {
            mongoose.model('User').findOne({ token: req.params.token, tokenExpire: { $gt: Date.now() } }, function(err, user) {

                if (!user) {
                    console.log(`################# NO USER #################`)
                    return res.redirect('back');
                }
                if (err) {
                    console.log(`################# ${err} #################`)
                }
                user.setPassword(req.body.password, function() {
                    user.save();
                });
                user.token = undefined;
                user.tokenExpire = undefined;
                req.session.message = null
                user.save(function(err) {
                    req.logIn(user, function(err) {
                        done(err, user);
                    });
                });
            });
        }
    ], function(err, user) {
        res.redirect('/');
    });
});
router.get('/forgot', function(req, res) {
    res.render('users/forgot', { title: "Forgot" });
});
router.post('/forgot', function(req, res, next) {
    async.waterfall([
            function(done) {
                crypto.randomBytes(20, function(err, buf) {
                    var token = buf.toString('hex');
                    done(err, token);
                });
            },
            function(token, done) {
                User.findOne({ username: req.body.username }, function(err, user) {
                    if (!user) {
                        return res.redirect('/users/forgot');
                    }

                    user.token = token;
                    user.tokenExpire = Date.now() + 3600000; // 1 hour
                    user.save(function(err) {
                        done(err, token, user);
                    });
                    const templateDir = path.join(__dirname, '../emails', 'forgot');
                    const forgot = new EmailTemplate(templateDir);
                    const url = process.env.DOMAIN + "/users/activate/" + token;
                    const info = { email: user.email, url: url }
                    forgot.render(info, function(err, result) {
                        if (err) {
                            console.log(err);
                        } else {
                            var data = {
                                from: FROM_EMAIL,
                                to: user.username,
                                subject: 'Password reset',
                                html: result.html
                            };
                            mail.sendEmail(data);
                            console.log("User's email is: " + user.username)
                        }
                    });
                });
            },
            function(token, user, done) {
                req.flash("info", "We sent you an email with further instructions.")
                res.redirect('/users/login')
            }
        ],
        function(err) {
            if (err) return next(err);
            res.redirect('/users/forgot');
        });
});
module.exports = router;