var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// TODO ADD DEFAULTS
var srSchema = new Schema({
    client_information: { type: String, Default: "" },
    timestamp: { type: Date, Default: Date.now() },
    fk_phid: String,
    img_name: String,
    img_url: String,
    imgur_url: String,
    img_base64: String,
    size: String,
    location: {
        type: { type: String },
        coordinates: []
    },
    latitude: Number,
    longitude: Number,
    service_request_id: String,
    service_notice: String
});
srSchema.index({ location: '2dsphere' });
mongoose.model('Sr', srSchema);