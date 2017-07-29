'use strict'
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

/* User Schema - Basic info */
var userSchema = new Schema({
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        required: true,
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
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);