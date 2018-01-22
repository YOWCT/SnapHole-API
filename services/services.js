const request = require('request')
const mongoose = require('mongoose')
var https = require('https')
var querystring = require('querystring')
// const Sr = require('../models/sr')
/**
 * Pass id of service request
 * Return Values and Count for each
 * @param  {string} id - id of service request
 * @return {boolean} true: Request was sent to the city, false: request was not sent.
 */
function sendTicketToCity (id, lat, long) {
  var data = querystring.stringify({
    service_code: '2000164-2',
    'attribute[cmb_councillorcheckbox]': 'Yes_No.Yes',
    lat: lat,
    long: long
  })

  var options = {
    host: 'city-of-ottawa-dev.apigee.net',
    path: '/open311/v2/requests.json',
    method: 'POST',
    json: true,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(data)
    }
  }

  // Request object
  var req = https.request(options, function (res) {
    console.log(result)
    var result = ''
    res.on('data', function (chunk) {
      result += chunk
    })
    res.on('end', function () {
      var service_request = JSON.parse(result)
      var serviceRequestId = service_request[0].serviceRequestId
      console.log(serviceRequestId)
      var serviceNotice = result[0].serviceNotice
      mongoose.model('Sr').findOneAndUpdate(
        { fkPhid: id },
        {
          serviceRequestId: serviceRequestId,
          serviceNotice: serviceNotice
        },
        function (err, pothole) {
          if (err) {
            console.log(err)
          } else {
            console.log('SUCCESS')
          }
        }
      )
    })
    res.on('error', function (err) {
      console.log(err)
    })
  })

  // Send request with the postData form
  req.write(data)
  req.end()
}

exports.sendTicketToCity = sendTicketToCity
