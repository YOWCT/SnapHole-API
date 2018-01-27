let { IMGUR_CLIENT_ID, AWS_BUCKET } = process.env
const fs = require('fs')
const request = require('request')
const path = require('path')
const aws = require('aws-sdk')
const mongoose = require('mongoose')

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
  return Buffer.from(image).toString('base64')
}

// Upload to MongoDB must be less than 16MB
exports.saveToDatabase = function (req, res) {
  console.log(req.file)
  var image = base64Encode(path.join(req.file.path))
  mongoose
    .model('Sr')
    .findOneAndUpdate(
      { imgName: req.file.originalname },
      { imgBase64: image },
      function (err, sr) {
        if (err) {
          console.log(err)
        } else {
          console.log('Saved to database', sr)
        }
      }
    )
}

// Upload to s3
exports.uploadS3 = function (req, res) {
  const image = fs.readFileSync(path.join(req.file.path))
  const filename = req.file.originalname.includes('.jpeg')
    ? req.file.originalname.replace('.jpeg', '')
    : req.file.originalname
  const params = {
    Body: image,
    Bucket: AWS_BUCKET,
    Key: `${filename}.jpeg`,
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
