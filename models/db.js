var dbhost = process.env.DB_HOST;
var dbuser = process.env.DB_USER;
var dbpass = process.env.DB_PASS;
var mongoose = require('mongoose');

// Connection String
if (process.env.NODE_ENV === 'development') {
    mongoose.connect("mongodb://127.0.0.1/snaphole");
} else {
    mongoose.connect("mongodb://" + dbuser + ":" + dbpass + "@" + dbhost + "/ott311", { auth: { authdb: "admin" } });
}