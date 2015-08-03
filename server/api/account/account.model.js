'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AccountSchema = new Schema({
  status: String,
  created: Date,
  type: String,
  manager: String,

  syncDate: Date,
  objectId: String,
  listId: String,
  version: Number,
  createdDate: Number,
  modifiedDate: Number,
  name: String,
  accountId: String,

  complianceNotes: String,
  invoicingInstruction: String,
  // contactIds: [String],
  // contacts: [{}],
  contacts: [{
    type: mongoose.Schema.Types.String,
    ref: 'Contact'
  }],
  fieldValues: {},
  parsed: {} // *** this is where the parsed column name and values go!

});

module.exports = mongoose.model('Account', AccountSchema);