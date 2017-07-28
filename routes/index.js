"use strict"
// Lib requires

let { AWS_BUCKET, APP_NAME } = process.env;
const express = require('express'),
    router = express.Router(),
    request = require('request'),
    path = require('path'),
    multer = require('multer'),
    fs = require('fs-extra'),
    mongoose = require('mongoose'),
    helper = require('../services'),
    imgur = require('../services/imgur'),
    auth = require('../services/auth'),
    services = require('../services/services'),
    multerS3 = require('multer-s3'),
    aws = require('aws-sdk'),
    Sr = require('../models/sr');
aws.config.update({ accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY });
var s3 = new aws.S3();

/* GET home page. */
router.get('/', auth.loggedIn, function(req, res, next) {
    res.render('index', { title: APP_NAME, menu: "Home" });
});

router.get('/requests_by_type', auth.loggedIn, function(req, res, next) {
    // get our data    
    request('https://city-of-ottawa-dev.apigee.net/open311/v2/requests.json', function(error, response, body) {
        console.log('error:', error); // Print the error if one occurred 
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
        //console.log('body:', body); // Print the HTML for the Google homepage.
        var clean_body = JSON.parse(body);
        var original = clean_body.map(function(a) { return a.service_name; });
        var compressed = helper.compressArray(original);
        res.send(compressed);
    });
});


router.get('/requests_by_date/start_date/:start_date/end_date/:end_date', auth.loggedIn, function(req, res, next) {
    // get our data    
    var start_date = "2017-01-01T00:00:00Z";
    var end_date = "2017-03-20T00:00:00Z";
    request('https://city-of-ottawa-dev.apigee.net/open311/v2/requests.json?start_date=' + start_date + '&end_date=' + end_date, function(error, response, body) {
        console.log('error:', error); // Print the error if one occurred 
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
        console.log('body:', body); // Print the HTML for the Google homepage.
        res.send(body);
    });
});

// SR ROUTES
// var storage = multer.diskStorage({
//     destination: function(req, file, callback) {
//         var s3request = {
//             Body: file.buffer,
//             Bucket: AWS_BUCKET,
//             Key: file.originalname + ".jpeg"
//         };
//         s3.putObject(s3request, function(err, data) {
//             if (err) {
//                 console.log(err)
//             } else {

//                 callback(null, './uploads');
//             }
//         });

//     },
//     filename: function(req, file, callback) {
//         //console.log(req.files);
//         //var Key = helper.guid()

//         callback(null, file.originalname + ".jpeg");
//     }
// });

//var upload_fs = multer({ storage: storage }).single('userPhoto');

var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: AWS_BUCKET,
        ACL: 'public-read',
        key: function(req, file, cb) {
            //console.log(file);

            cb(null, file.originalname + ".jpeg"); //use Date.now() for unique file keys
        }

    })

});

// GET All requests
router.get('/service_requests/:format?', auth.loggedIn, function(req, res) {
    mongoose.model('Sr').find({}, function(err, results) {
        if (err) {
            console.log(err);
        } else {
            console.log(results)
            var vm = {
                title: `${APP_NAME} + List"`,
                menu: "Requests",
                results: results
            };
            if (req.params.format) { res.json(results); } else {
                var vm = {
                    title: "Potholes List",
                    menu: "Requests",
                    results: results

                };
                res.render('files', vm);
            }
        }
    });
});


router.get('/map/:format?', function(req, res) {
    mongoose.model('Sr').find({}, function(err, results) {
        if (err) {
            console.log(err);
        } else {

            var holes = [];
            for (var index = 0; index < results.length; index++) {
                var element = results[index];
                holes.push({
                    "type": "Feature",
                    "properties": {
                        "size": element.size,
                        "show_on_map": true
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": element.location.coordinates
                    }
                });
            }
            if (req.params.format) { res.json(holes); } else {
                console.log(holes);
                var vm = {
                    title: "Potholes map",
                    menu: "Map",
                    results: holes
                };
                res.render('map', vm);
            }
        }
    });
});

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
router.post('/sr_information', function(req, res) {
    let client_information = "N/A",
        timestamp = Date.now(),
        fk_phid = req.body.uuid,
        img_url = `https: //s3.amazonaws.com/${AWS_BUCKET}/${req.body.uuid}.jpeg`,
        imgur_url = `https: //s3.amazonaws.com/${AWS_BUCKET}/${req.body.uuid}.jpeg`,
        longitude = parseFloat(req.body.long),
        latitude = parseFloat(req.body.lat);
    // Create record for pothole
    mongoose.model('Sr').create({
        client_information: client_information,
        timestamp: Date.now(),
        fk_phid: fk_phid,
        img_url: img_url,
        location: { type: "Point", coordinates: [longitude, latitude] },
        longitude: longitude,
        latitude: latitude
    }, function(err, sr) {
        if (err) {
            res.send("There was a problem adding the information to the database.");
            console.log(err)
        } else {
            //services.sendTicketToCity(fk_phid, latitude, longitude);
            res.send(sr);
        }
    });
});

router.post('/size', function(req, res) {
    var uuid = req.body.uuid;
    var size = req.body.size;
    mongoose.model('Sr').findOneAndUpdate({ fk_phid: uuid }, {
        size: size
    }, function(err, sr) {
        if (err) {
            res.send("There was a problem adding the information to the database.");
            console.log(err)
        } else {
            //services.sendTicketToCity(fk_phid, latitude, longitude);
            res.send(sr);
        }
    });
});

// POST Receive service request image and store
var upload = multer({ dest: 'uploads/' })

router.post('/sr', upload.single('userPhoto'), function(req, res) {
    res.send("SUCCESS")
});
// GET One request
router.get('/sr/:id', function(req, res) {
    var id = req.params.id;
    mongoose.model('Sr').findOne({ fk_phid: id }, function(err, sr) {
        res.send(sr.service_request_id);
    });
});
// GET Delete request
router.get('/delete/:id', auth.loggedIn, helper.isAdmin, function(req, res) {
    mongoose.model('Sr').remove({ _id: req.params.id }, function(err) {
        if (err) {
            res.send("There was a problem updating the information to the database: " + err);
        } else {
            res.redirect('/service_requests');
        }
    });
});
module.exports = router;