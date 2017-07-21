const mongoose = require('mongoose');
let { MONGODB_URI, DB_HOST, DB_USER, DB_PASS, NODE_ENV } = process.env;

// Default Environment Variables
DB_HOST = DB_HOST || 'localhost';

// Create MongoDB connection
if (MONGODB_URI) {
    const options = { useMongoClient: true };
    mongoose.connect(MONGODB_URI, options);
} else if (NODE_ENV === 'development' || DB_USER === undefined) {
    const uri = `mongodb://${DB_HOST}/snaphole`
    const options = { useMongoClient: true };
    mongoose.connect(uri, options);
} else {
    // ignore auth for now.
    const uri = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}/ott311`
    const options = { auth: { authdb: "admin" }, useMongoClient: true };
    mongoose.connect(uri, options);
}