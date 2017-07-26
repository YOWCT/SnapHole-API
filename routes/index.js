"use strict"
// Lib requires
const express = require('express'),
    router = express.Router(),
    request = require('request'),
    path = require('path'),
    multer = require('multer'),
    fs = require('fs-extra'),
    mongoose = require('mongoose'),
    helper = require('../services'),
    services = require('../services/services'),
    aws = require('aws-sdk'),
    Sr = require('../models/sr');
aws.config.update({ accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY });
var s3 = new aws.S3();
// URL to send requests to the city: https://city-of-ottawa-dev.apigee.net/open311/v2/requests.json
router.get('/login', function(req, res, next) {
    res.render('login', { title: 'Ottawa 311 App Checkpoint' });
});

router.post('/login', function(req, res) {
    var password = req.body.password;
    if (password == "admin") {
        req.session.password = password;
        res.redirect('/service_requests');
    } else {
        res.redirect('/login')
    }

});

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Ottawa 311 App', menu: "Home" });
});

router.get('/requests_by_type', function(req, res, next) {
    // get our data    
    request('https://city-of-ottawa-dev.apigee.net/open311/v2/requests.json', function(error, response, body) {
        console.log('error:', error); // Print the error if one occurred 
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
        console.log('body:', body); // Print the HTML for the Google homepage.
        var clean_body = JSON.parse(body);
        var original = clean_body.map(function(a) { return a.service_name; });
        var compressed = helper.compressArray(original);
        res.send(compressed);
    });
});


router.get('/requests_by_date/start_date/:start_date/end_date/:end_date', function(req, res, next) {
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
var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, './uploads');
    },
    filename: function(req, file, callback) {
        //console.log(req.files);
        //var Key = helper.guid()

        var s3request = {
            Body: file.buffer,
            Bucket: 'devisscher',
            Key: file.originalname
        };
        s3.putObject(s3request, function(err, data) {
            if (err) {
                console.log(err)
            } else {
                callback(null, file.originalname + ".jpeg");
            }
        });
    }
});

var upload = multer({ storage: storage }).single('userPhoto');

// GET All requests
router.get('/service_requests/:format?', function(req, res) {
    mongoose.model('Sr').find({}, function(err, results) {
        if (err) {
            console.log(err);
        } else {
            console.log(results)
            var vm = {
                title: "Potholes List",
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
        img_url = process.env.DOMAIN + "/" + fk_phid + ".jpeg",
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
router.post('/sr', function(req, res) {
    upload(req, res, function(err, file) {
        if (err) {
            console.log(err);
            return res.end("Error uploading file: %s", err);
        } else {
            console.log()
            res.send("success")
        }
    });
});
// GET One request
router.get('/sr/:id', function(req, res) {
    var id = req.params.id;
    mongoose.model('Sr').findOne({ fk_phid: id }, function(err, sr) {
        res.send(sr.service_request_id);
    });
});
// GET Delete request
router.get('/delete/:id', helper.isAdmin, function(req, res) {
    mongoose.model('Sr').remove({ _id: req.params.id }, function(err) {
        if (err) {
            res.send("There was a problem updating the information to the database: " + err);
        } else {
            res.redirect('/service_requests');
        }
    });
});
module.exports = router;