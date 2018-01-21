const mongoose = require('mongoose')
let { DB_HOST } = process.env

// Default Environment Variables
DB_HOST = DB_HOST || 'localhost'

// Create MongoDB connection
const uri = `mongodb://${DB_HOST}/snaphole`
const options = { useMongoClient: true }
mongoose.connect(uri, options)
