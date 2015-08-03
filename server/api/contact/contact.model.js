'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// var ContactSchema = new Schema({
//   name: String,
//   info: String,
//   active: Boolean
// });

var ContactSchema = new Schema({
  syncDate: Date,
  objectId: String,
  properties: {}
}, { strict: false, _id: false });

module.exports = mongoose.model('Contact', ContactSchema);