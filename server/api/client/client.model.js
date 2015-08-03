'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ClientSchema = new Schema({
  syncDate: Date,
  objectId: String,
  listId: String,
  version: Number,
  createdDate: Date,
  modifiedDate: Date,
  name: String,
  accountId: String,
  contacts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  }],
  fieldValues: {},
  parsed: {} // *** this is where the parsed column name and values go!
}, { strict: false });

module.exports = mongoose.model('Client', ClientSchema);