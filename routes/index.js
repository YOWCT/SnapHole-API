'use strict'
// Lib requires

let { AWS_BUCKET, APP_NAME } = process.env
const { geolocation } = require('../validation')
const express = require('express')
const router = express.Router()
const request = require('request')
const mongoose = require('mongoose')
const helper = require('../services')
const storage = require('../services/storage')
const auth = require('../services/auth')
const multer = require('multer')
const aws = require('aws-sdk')
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

/* GET home page. */

router.get('/', auth.loggedIn, function (req, res, next) {
  res.render('index', { title: APP_NAME, menu: 'Home', user: req.user })
})

router.get('/requests_by_type', auth.loggedIn, function (req, res, next) {
  // get our data
  request(
    'https://city-of-ottawa-dev.apigee.net/open311/v2/requests.json',
    function (error, response, body) {
      console.log('error:', error) // Print the error if one occurred
      console.log('statusCode:', response && response.statusCode) // Print the response status code if a response was received
      // console.log('body:', body); // Print the HTML for the Google homepage.
      var cleanBody = JSON.parse(body)
      var original = cleanBody.map(function (a) {
        return a.service_name
      })
      var compressed = helper.compressArray(original)
      res.send(compressed)
    }
  )
})

router.get(
  '/requests_by_date/startDate/:startDate/endDate/:endDate',
  auth.loggedIn,
  function (req, res, next) {
    // get our data
    var startDate = '2017-01-01T00:00:00Z'
    var endDate = '2017-03-20T00:00:00Z'
    request(
      'https://city-of-ottawa-dev.apigee.net/open311/v2/requests.json?startDate=' +
        startDate +
        '&endDate=' +
        endDate,
      function (error, response, body) {
        console.log('error:', error) // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode) // Print the response status code if a response was received
        console.log('body:', body) // Print the HTML for the Google homepage.
        res.send(body)
      }
    )
  }
)

// GET All requests
router.get('/serviceRequests/:format?', auth.loggedIn, function (req, res) {
  mongoose.model('Sr').find({}, function (err, results) {
    var vm
    if (err) {
      console.log(err)
    } else {
      vm = {
        title: `${APP_NAME} + List"`,
        menu: 'Requests',
        results: results
      }
      if (req.params.format) {
        res.json(results)
      } else {
        vm = {
          title: 'Potholes List',
          menu: 'Requests',
          results: results,
          user: req.user
        }
        res.render('files', vm)
      }
    }
  })
})

router.get('/map/:format?', function (req, res) {
  mongoose.model('Sr').find({}, function (err, results) {
    if (err) {
      console.log(err)
    } else {
      var holes = []
      for (var index = 0; index < results.length; index++) {
        var element = results[index]
        holes.push({
          type: 'Feature',
          properties: {
            size: element.size,
            show_on_map: true
          },
          geometry: {
            type: 'Point',
            coordinates: element.location.coordinates
          }
        })
      }
      if (req.params.format) {
        res.json(holes)
      } else {
        console.log(holes)
        var vm = {
          title: 'Potholes map',
          menu: 'Map',
          results: holes,
          user: req.user
        }
        res.render('map', vm)
      }
    }
  })
})

// Create an authentication route
// POST Request
// Params: email
// Param: Password
// and then they are logged in.
// if they lose their session, they click send me a magic login link.
// Send a link to that email
// Store that email with the request
// return as JSON: success

// POST Receive service request information from client app, initiate storage.
router.post('/sr_information', function (req, res) {
  let clientInformation = 'N/A'
  let fkPhid = req.body.uuid
  let imgName = `${req.body.uuid}.jpeg`
  let imgUrl = `https://s3.amazonaws.com/${AWS_BUCKET}/${req.body.uuid}.jpeg`
  let imgurUrl = `https://s3.amazonaws.com/${AWS_BUCKET}/${req.body.uuid}.jpeg`
  let longitude = parseFloat(req.body.long)
  let latitude = parseFloat(req.body.lat)

  switch (geolocation(latitude, longitude)) {
    case 'ottawa':
      console.log('Pothole is located in Ottawa :)')
      break
    case 'gatineau':
      console.log('Pothole is located on the darkside!')
      break
    default:
      console.log('cannot find any approved cities :(')
      break
  }
  // Create record for pothole
  mongoose.model('Sr').create(
    {
      clientInformation: clientInformation,
      timestamp: Date.now(),
      fkPhid: fkPhid,
      imgName: imgName,
      imgUrl: imgUrl,
      imgurUrl: imgurUrl,
      location: { type: 'Point', coordinates: [longitude, latitude] }
    },
    function (err, sr) {
      if (err) {
        res.send('There was a problem adding the information to the database.')
        console.log(err)
      } else {
        // services.sendTicketToCity(fkPhid, latitude, longitude);
        res.send(sr)
      }
    }
  )
})

// router.post('/size', function (req, res) {
//   var uuid = req.body.uuid
//   var size = req.body.size
//   mongoose.model('Sr').findOneAndUpdate(
//     { fkPhid: uuid },
//     {
//       size: size
//     },
//     function (err, sr) {
//       if (err) {
//         res.send('There was a problem adding the information to the database.')
//         console.log(err)
//       } else {
//         // services.sendTicketToCity(fkPhid, latitude, longitude);
//         res.send(sr)
//       }
//     }
//   )
// })

// var upload = multer({ storage: fsStorage })
const fsStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname + '.jpeg')
  }
})

const upload = multer({ storage: fsStorage })

router.post('/sr', upload.single('userPhoto'), async (req, res) => {
  try {
    storage.uploadS3(req, res)
    res.send('success')
  } catch (e) {
    res.send('error: ', e.stack)
  }
})
// GET One request
router.get('/sr/:id', function (req, res) {
  var id = req.params.id
  mongoose.model('Sr').findOne({ fkPhid: id }, function (err, sr) {
    if (err) {
      console.log(err)
    }
    res.send(sr.serviceRequestId)
  })
})
// GET Delete request
router.get('/delete/:id', auth.loggedIn, function (req, res) {
  mongoose.model('Sr').remove({ _id: req.params.id }, function (err) {
    if (err) {
      res.send(
        'There was a problem updating the information to the database: ' + err
      )
    } else {
      res.redirect('/serviceRequests')
    }
  })
})
module.exports = router
