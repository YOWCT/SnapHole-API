var mongoose = require('mongoose')
var Schema = mongoose.Schema
// TODO ADD DEFAULTS
var srSchema = new Schema({
  client_information: { type: String, Default: '' },
  timestamp: { type: Date, Default: Date.now() },
  fkPhid: String,
  imgName: String,
  imgUrl: String,
  imgurUrl: String,
  imgBase64: String,
  size: String,
  location: {
    type: { type: String },
    coordinates: []
  },
  latitude: Number,
  longitude: Number,
  serviceRequestId: String,
  serviceNotice: String
})
srSchema.index({ location: '2dsphere' })
mongoose.model('Sr', srSchema)
