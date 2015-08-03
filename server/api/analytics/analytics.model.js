'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AnalyticsSchema = new Schema({
  name: String,
  info: String,
  active: Boolean
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);