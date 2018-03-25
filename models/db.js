const mongoose = require('mongoose')
let { DB_PASSWORD, NODE_ENV } = process.env

// Default Environment Variables
// DB_HOST = DB_HOST || 'localhost'

// Create MongoDB connection
const uriAtlas = NODE_ENV === 'development' ? `mongodb://localhost:27017/snaphole` : `mongodb://snaphole:${DB_PASSWORD}@cluster0-shard-00-00-1mxli.mongodb.net:27017,cluster0-shard-00-01-1mxli.mongodb.net:27017,cluster0-shard-00-02-1mxli.mongodb.net:27017/snaphole?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin`

const options = { useMongoClient: true }
mongoose.connect(uriAtlas, options)
