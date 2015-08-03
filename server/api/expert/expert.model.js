'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ExpertSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  syncDate: Date,
  objectId: String,
  parentListId: String,

  linkedinId: String,

  name: String,
  bio: String,
  country: [{}],

  history: String,
  experience: String,
  complianceNotes: String,
  complianceHistory: [{}],
  notes: String, // Linkedin Add Backs - Need to Contact, Attempted to Contact - No Reponse, Received Response - Need to Outreach, Spoke Over Phone, Reached Secretary/Staff via Phone - Could Not Contact/OOO, Signed Up via External Web Form - Need to Follow Up, Not Interested for now, Declined

  //projectBios: [{}], // project specific bios saved here
  //projectNotes: [{}], // project notes also saved here
  projectCompliance: [{}], // Project specific compliance here
  senior: String, // Empty, Standard, Senior
  title: String,      // for Knowledge Partner imports
  company: String,    // for Knowledge Partner imports
  startDate: String,  // start date at most recent job title
  summary: String, // for LinkedInKP add-backs

  hourlyRate: String,
  location: String,

  progressStatus: String,    // Attempted to Contact via LinkedIn - No Response, etc
  knowledgePartner: String,  // 'Lead', 'Lead (Contacted)', 'Knowledge Partner'

  // contactIds: [], // store any references to contacts
  // contacts: {}, // synced contact info from relateIQ
  contacts: [{
    type: mongoose.Schema.Types.String,
    ref: 'Contact'
  }],

  //linkedProjectIds: [],

  relateIQ: {}, // for keeping a copy so expert can prepopulate (Company, Country, History, Experience) in add bio

  // project specific
  // partnerRef: String, // KP1 .. KP101
  // status: String, // Pending, Approved but not sent, Sent to client, Rejected

  acceptedTandC: Boolean,
  isCompliant: Boolean

});

module.exports.Expert = mongoose.model('Expert', ExpertSchema);


// Including Partner
var itemSchema = new mongoose.Schema({
  syncDate: Date,
  objectId: String,
  listId: String,
  version: Number,
  createdDate: Number,
  modifiedDate: Number,
  name: String,
  accountId: String,
  contacts: [{
    type: mongoose.Schema.Types.String,
    ref: 'Contact'
  }],
  fieldValues: {},
  parsed: {} // *** this is where the parsed column name and values go!
}, { strict: false, _id: false });
module.exports.Partner = mongoose.model('Partner', itemSchema);

var metaSchema = new mongoose.Schema({
  syncDate: Date,
  objectId: String,
  title: String,
  listType: String,
  modifiedDate: Number,
  fields: {}
});
module.exports.PartnerMeta = mongoose.model('PartnerMeta', metaSchema);




