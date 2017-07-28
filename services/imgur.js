var imgur = require('imgur');

imgur.setCredentials('devisscher.thomas@gmail.com', 'd+j33x', '5c9e6fbb15d2956');


exports.uploadImgur = function() {

    imgur.uploadFile('./uploads/*.jpeg')
        .then(function(json) {
            console.log(json.data.link);
        })
        .catch(function(err) {
            console.error(err.message);
        });

}