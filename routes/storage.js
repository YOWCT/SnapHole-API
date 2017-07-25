var aws = require('aws-sdk'),
    http = require('http'),
    fs = require('fs'),
    path = require('path'),
    express = require('express'),
    mongoose = require('mongoose'),
    //multipart = require('connect-multiparty'),
    helper = require('../services'),
    request = require('request'),
    router = express.Router();
var Upload = require('../models/sr');
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
        Bucket: 'devisscher',
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
        Bucket: 'drumpf',
        Key: req.params.id
    };
    s3.getObject(options, function(err, data) {
        res.end(data.Body);
    });
});
// GET Create upload form
router.get('/upload', function(req, res) {
    res.render('storage/upload', { title: "New upload", menu: 'Uploads', user: req.user });
});
// POST Create Upload
router.post('/upload', function(req, res) {
    console.log(req.files);
    var Key = helper.guid()
    var s3request = {
        Body: fs.readFileSync(req.files.uploadedFile.path),
        Bucket: 'devisscher',
        Key: Key
    };
    s3.putObject(s3request, function(err, data) {
        res.redirect('/storage')
    });
});

// Get Edit Upload Form
router.get('/edit/:id', function(req, res) {
    mongoose.model('Upload').findById(req.params.id, function(err, upload) {
        if (err) {
            console.log('GET Error: There was a problem retrieving: ' + err);
        } else {

            console.log('GET Retrieving ID: ' + upload.Key);
            var fileName = upload.Key;
            var Title = upload.Title;
            var Description = upload.Description;
            var Published = upload.Published;
            var Category = upload.Category;
            var DbId = req.params.id;
            var vm = {
                title: 'Upload: ' + Title,
                menu: 'Uploads',
                "fileName": fileName,
                "Id": req.params.id,
                "Title": Title,
                "Description": Description,
                "Published": Published,
                "Category": Category,
                "DbId": DbId,
                user: req.user

            }
            res.render('storage/edit', vm);

        }
    })
});
// POST Edit Upload
router.post('/edit/:id', function(req, res) {
        var Id = req.params.id;
        var Title = req.body.Title;
        var Description = req.body.Description;
        var Published = req.body.Published;
        var Category = req.body.Category;
        mongoose.model('Upload').findById(Id, function(err, upload) {
            //update it
            upload.update({
                Title: Title,
                Description: Description,
                Published: Published,
                Category: Category
            }, function(err, uploadId) {
                if (err) {
                    res.send("There was a problem updating the information to the database: " + err);
                } else {
                    //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                    res.redirect('/storage');
                }
            })
        });
    })
    // GET Add module to course
router.get('/:id/add/:UploadId', function(req, res) {
    mongoose.model('Upload').findById(req.params.id, function(err, upload) {
        //update it
        upload.update({
            CourseId: req.params.UploadId
        }, function(err, uploadId) {
            if (err) {
                res.send("There was a problem updating the information to the database: " + err);
            } else {
                //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                res.redirect('/courses/edit/' + req.params.UploadId);
            }
        })
    });
});

// GET Remove module from course
router.get('/:id/remove/:UploadId', function(req, res) {
    mongoose.model('Upload').findById(req.params.id, function(err, upload) {
        //update it
        upload.update({
            CourseId: ''
        }, function(err, uploadId) {
            if (err) {
                res.send("There was a problem updating the information to the database: " + err);
            } else {
                //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                res.redirect('/courses/edit/' + req.params.UploadId + '#modules');
            }
        })
    });
});
// GET Delete Upload
router.get('/delete/:id', function(req, res) {
    var Id = req.params.id;
    mongoose.model('Upload').findById(Id, function(err, upload) {
        //update it
        upload.update({
            DateDeleted: Date.now()
        }, function(err, uploadId) {
            if (err) {
                res.send("There was a problem updating the information to the database: " + err);
            } else {
                //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                var vm = {
                    "uploads": mongoose.model('Upload').find({}),
                    "uploaded": uploadId,
                    user: req.user
                }
                res.redirect('/storage');
            }
        })
    });
});
module.exports = router;