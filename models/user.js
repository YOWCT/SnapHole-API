'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/* User Schema - Basic info */
var UserSchema = new Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
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
    }
});

mongoose.model('User', UserSchema);