var aws = require('aws-sdk'),
    http = require('http'),
    fs = require('fs'),
    path = require('path'),
    express = require('express'),
    mongoose = require('mongoose'),
    helper = require('../services'),
    request = require('request'),
    router = express.Router();
var Upload = require('../models/sr');

let { AWS_BUCKET } = process.env;
//var dotenv = require('dotenv').config();
// TODO Add config variables to environment variables
//var config_path = path.join(__dirname, '../s3auth.json');
// Instantiate S3 Client
aws.config.update({ accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY });
var s3 = new aws.S3();
// Process Multipart Forms
//var multipartMiddleware = multipart();

// GET Index list objects in bucket
router.get('/', function(req, res) {
    var params = {
        Bucket: AWS_BUCKET,
        Delimiter: '/',
        Prefix: ''
    }
    s3.listObjects(params, function(err, data) {
        if (err) throw err;
        res.send(data);
    });
});
// GET List Buckets
router.get('/buckets', function(req, res) {
    s3.listBuckets(function(err, data) {
        if (err) {
            res.json(err);
        } else {
            res.json(data);
        }

    });
});
// GET Display Object view
router.get('/show/:id', function(req, res) {

});
// GET Download file
router.get('/download/:id', function(req, res) {
    var options = {
        Bucket: AWS_BUCKET,
        Key: req.params.id
    };
    s3.getObject(options, function(err, data) {
        if (err) {
            res.send(err)
        } else {
            res.send(data.Body);
        }
    });
});



module.exports = router;