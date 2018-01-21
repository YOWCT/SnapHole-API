let { AWS_BUCKET, APP_NAME } = process.env

const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const fs = require('fs')
const dotenv = require('dotenv').config()

const mongoose = require('mongoose')
mongoose.Promise = require('bluebird')

// Routes
const index = require('./routes/index')
const users = require('./routes/users')
const cookieSession = require('cookie-session')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

var app = express()
app.use(cookieParser())
app.use(bodyParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(
  cookieSession({
    name: 'session',
    keys: ['thisismyfirstsecret', 'thisismysecondsecret'],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  })
)
// app.use(
//   bodyParser.urlencoded({
//     limit: '5mb',
//     extended: true,
//     keepExtensions: true,
//     uploadDir: path.join(__dirname, 'uploads')
//   })
// )

// app.use(bodyParser.json())

app.use(require('flash')())
// Passport configuration
const User = require('./models/user')
app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// Set views engine.
// TODO Switch to pug
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(function (req, res, next) {
  if (APP_NAME) {
    app.locals.APP_NAME = APP_NAME
  }
  next()
})
// app.use(function (req, res, next) {
//   if (req.user) {
//     console.log(`################# user found #################`)
//     app.locals.user = req.user
//   } else {
//     console.log(`################# no user #################`)
//     app.locals.user = undefined
//   }
//   next()
// })
app.use(logger('dev'))

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'uploads')))
app.use('/', index)
app.use('/users', users)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

//  Including all model files.
fs.readdirSync(__dirname + '/models').forEach(function (filename) {
  if (~filename.indexOf('.js')) require(__dirname + '/models/' + filename)
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})
// Include all model files
fs.readdirSync(__dirname + '/models').forEach(function (filename) {
  if (~filename.indexOf('.js')) require(__dirname + '/models/' + filename)
})

module.exports = app
