'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/* User Schema - Basic info */
var UserSchema = new Schema({
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    email: {
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
    }
});

mongoose.model('User', UserSchema);