const mongoose = require('mongoose');
const {DB_HOST, DB_USER, DB_PASS, NODE_ENV} = process.env;

// Connection
if (NODE_ENV === 'development') {
    const uri = `mongodb://${DB_HOST}/snaphole`
    const options = { useMongoClient: true };
    mongoose.connect(uri, options);
} else {
    const uri = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}/ott311`
    const options = { auth: { authdb: "admin" }, useMongoClient: true };
    mongoose.connect(uri, options);
}
