let {
  IMGUR_EMAIL,
  IMGUR_CLIENT_ID,
  IMGUR_CLIENT_SECRET,
  IMGUR_PASSWORD,
  AWS_BUCKET
} = process.env
const fs = require('fs')
const request = require('request')
const path = require('path')
const aws = require('aws-sdk')
const mongoose = require('mongoose')
// const Sr = require('../models/sr')

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

var s3 = new aws.S3()

// ENCODE base64
function base64Encode (file) {
  // read binary data
  var image = fs.readFileSync(file)
  // convert binary data to base64 encoded string
  return new Buffer(image).toString('base64')
}

// Upload to MongoDB must be less than 16MB
exports.saveToDatabase = function (req, res) {
  console.log(req.file)
  var image = base64Encode(path.join(req.file.path))
  mongoose
    .model('Sr')
    .findOneAndUpdate(
      { img_name: req.file.filename },
      { img_base64: image },
      function (err, sr) {
        if (err) {
          console.log(err)
        } else {
          console.log(sr)
        }
      }
    )
}

// Upload to s3
exports.uploadS3 = function (req, res) {
  console.log(req.file.path)
  var image = fs.readFileSync(path.join(req.file.path))
  console.log(image)
  var params = {
    Body: image,
    Bucket: AWS_BUCKET,
    Key: req.file.originalname + '.jpeg',
    ServerSideEncryption: 'AES256'
  }
  s3.putObject(params, function (err, data) {
    if (err) {
      console.log(err, err.stack)
    } else {
      console.log(data)
    }
  })
}

// Upload to imgur
exports.uploadImgur = function (req, res) {
  var image = base64Encode(req.file.path)
  var headers = {
    authorization: `Client-ID ${IMGUR_CLIENT_ID}`
    // 'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`
  }
  console.log(req.file)
  console.log(image)
  request.post(
    {
      url: 'https://api.imgur.com/3/',
      form: { image: image },
      headers: headers
    },
    function (err, httpResponse, body) {
      if (err) {
        console.log(err)
      } else {
        // console.log(httpResponse);
        console.log(httpResponse)
      }
      console.log('done')
    }
  )
}
