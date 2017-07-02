var express = require('express');
var router = express.Router(),
    mongoose = require('mongoose'),
    jwt = require('jsonwebtoken'),
    User = mongoose.model('User');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
    res.render('register', { title: 'Register Form' });
});

router.post('/register', function(req, res, next) {
    res.send(req.body);
});
module.exports = router;