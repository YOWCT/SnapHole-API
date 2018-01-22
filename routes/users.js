let { APP_NAME, FROM_EMAIL } = process.env

const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const async = require('async')
const passport = require('passport')
const User = require('../models/user')
const crypto = require('crypto')
const path = require('path')
const EmailTemplate = require('email-templates').EmailTemplate
const mail = require('../services/mail')
const helper = require('../services')
const auth = require('../services/auth')

/* GET users listing. */
router.get('/', auth.loggedIn, function (req, res, next) {
  User.find({}, function (err, users) {
    if (err) {
      res.status(500).send(err)
    } else {
      res.json(users)
    }
  })
})
router.get('/login', function (req, res, next) {
  var vm = {
    title: `${APP_NAME} - Login`,
    message: req.session.message || ''
  }
  res.render('users/login', vm)
})
router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    successFlash: 'Logged in successfully',
    failureRedirect: '/users/login',
    failureFlash: true
  }),
  function (req, res) {
    console.log(req)
    res.redirect('/')
  }
)
// router.post('/login', function (req, res) {
//   console.log('body parsing', req.body)
//   // should be something like: {username: YOURUSERNAME, password: YOURPASSWORD}
// })

// router.post('/login', passport.authenticate('local'), function (req, res) {
//   if (req.user) {
//     console.log('passport user', req.user)
//     res.redirect('/')
//   } else {
//     res.redirect('/users/login')
//   }
// })

router.get('/logout', function (req, res) {
  req.logout()
  res.redirect('/')
})
router.get('/register', function (req, res, next) {
  res.render('users/register', { title: `${APP_NAME} - Registration` })
})

router.post('/register', function (req, res, next) {
  var newUser = req.body
  // If user is client(from mobile app) then let token last for a longer amount of time.
  const expire = Date.now() + 60 * 60 * 1000 * 24 * 30
  console.log(newUser)
  async.waterfall(
    [
      function (done) {
        crypto.randomBytes(20, function (err, buf) {
          var token = buf.toString('hex')
          done(err, token)
        })
      },
      function (token, done) {
        newUser.token = token
        newUser.tokenExpire = expire
        User.register(
          new User({
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            username: newUser.email,
            token: newUser.token,
            tokenExpire: newUser.tokenExpire
          }),
          helper.guid(),
          function (err, user) {
            if (err) {
              console.log(`################# ${err} #################`)
              done(null, token, err)
            } else {
              done(null, token, user)
            }
          }
        )
      },
      // Send email
      function (token, user, done) {
        console.log(`################# ${token} #################`)
        const templateDir = path.join(__dirname, '../emails', 'activate')
        const activate = new EmailTemplate(templateDir)
        const url = process.env.DOMAIN + '/users/activate/' + token
        const info = { email: newUser.email, url: url }
        activate.render(info, function (err, result) {
          if (err) {
            console.log(err)
          } else {
            var data = {
              from: FROM_EMAIL,
              to: newUser.email,
              subject: 'Account Activation',
              html: result.html
            }
            mail.sendEmail(data)
          }
          done(null, token, user)
        })
      },
      function (token, user, done) {
        done(null, token, 'done')
      }
    ],
    function (err, result) {
      if (result) {
        req.flash('success', 'We sent you an email with further instructions.')
        res.redirect('/users/login')
      } else {
        req.flash('error', 'There was an error.')
        res.send(err)
      }
    }
  )
})

router.get('/authenticate/:token', function (req, res) {
  mongoose
    .model('User')
    .findOne(
      { token: req.params.token, tokenExpire: { $gt: Date.now() } },
      function (err, user) {
        if (user) {
          console.log(`################# ${user.username} #################`)
          res.send({
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name
          })
        } else {
          console.log(
            `################# no user found in authenticate route #################`
          )
          res.send('failure', err)
        }
      }
    )
})
router.get('/activate/:token', function (req, res) {
  mongoose
    .model('User')
    .findOne(
      { token: req.params.token, tokenExpire: { $gt: Date.now() } },
      function (err, user) {
        var vm
        if (user) {
          vm = {
            title: `${APP_NAME} - Account activation`,
            toke: req.params.token,
            user: user,
            status: 'Valid',
            message: req.session.message || ''
          }
        } else {
          vm = {
            title: `${APP_NAME} - Invalid token or expired token: ${err}`,
            status: 'Invalid'
          }
        }
        res.render('users/activate', vm)
      }
    )
})
router.post('/activate/:token', function (req, res) {
  async.waterfall(
    [
      function (done) {
        mongoose
          .model('User')
          .findOne(
            { token: req.params.token, tokenExpire: { $gt: Date.now() } },
            function (err, user) {
              if (!user) {
                console.log(`################# NO USER #################`)
                return res.redirect('back')
              }
              if (err) {
                console.log(`################# ${err} #################`)
              }
              user.setPassword(req.body.password, function () {
                user.save()
              })
              user.token = undefined
              user.tokenExpire = undefined
              req.session.message = null
              user.save(function (err) {
                if (err) {
                  console.log(err)
                }
                req.logIn(user, function (err) {
                  if (err) {
                    console.log(err)
                  }
                  done(err, user)
                })
              })
            }
          )
      }
    ],
    function (err, user) {
      if (err) {
        console.log(err)
      }
      res.redirect('/')
    }
  )
})
router.get('/forgot', function (req, res) {
  res.render('users/forgot', { title: 'Forgot' })
})
router.post('/forgot', function (req, res, next) {
  async.waterfall(
    [
      function (done) {
        crypto.randomBytes(20, function (err, buf) {
          if (err) {
            console.log(err)
          }
          var token = buf.toString('hex')
          done(err, token)
        })
      },
      function (token, done) {
        User.findOne({ username: req.body.username }, function (err, user) {
          if (err) {
            console.log(err)
          }
          if (!user) {
            return res.redirect('/users/forgot')
          }

          user.token = token
          user.tokenExpire = Date.now() + 3600000 // 1 hour
          user.save(function (err) {
            done(err, token, user)
          })
          const templateDir = path.join(__dirname, '../emails', 'forgot')
          const forgot = new EmailTemplate(templateDir)
          const url = process.env.DOMAIN + '/users/activate/' + token
          const info = { email: user.email, url: url }
          forgot.render(info, function (err, result) {
            if (err) {
              console.log(err)
            } else {
              var data = {
                from: FROM_EMAIL,
                to: user.username,
                subject: 'Password reset',
                html: result.html
              }
              mail.sendEmail(data)
              console.log("User's email is: " + user.username)
            }
          })
        })
      },
      function (token, user, done) {
        req.flash('info', 'We sent you an email with further instructions.')
        res.redirect('/users/login')
      }
    ],
    function (err) {
      if (err) return next(err)
      res.redirect('/users/forgot')
    }
  )
})
module.exports = router
