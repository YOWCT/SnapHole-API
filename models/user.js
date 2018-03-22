'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')

/* User Schema - Basic info */
var userSchema = new Schema({
  first_name: {
    type: String
  },
  last_name: {
    type: String
  },
  username: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  token: {
    type: String
  },
  tokenExpire: {
    type: Date
  },
  message: { type: String, default: null }
})

userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', userSchema)
