var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var srSchema = new Schema({
    client_information: { type: String, Default: "" },
    timestamp: { type: Date, Default: Date.now() },
    fk_phid: String,
    img_url: String,
    size: String,
    latitude: Number,
    longitude: Number,
    service_request_id: String,
    service_notice: String
});
mongoose.model('Sr', srSchema);