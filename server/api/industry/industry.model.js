'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var IndustrySchema = new Schema({
  name: String,
  info: String,
  active: Boolean
});

module.exports = mongoose.model('Industry', IndustrySchema);