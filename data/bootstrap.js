var environment = require('./environment'),
  mongoose = require('mongoose');

var db = mongoose.connection;
var itemSchema, metaSchema, staticSchema,
  expertSchema, clientSchema,
  projectSchema;


itemSchema = new mongoose.Schema({
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

accountSchema = new mongoose.Schema({
  syncDate: Date,
  objectId: String,
  listId: String,
  version: Number,
  createdDate: Date,
  modifiedDate: Date,
  name: String,
  accountId: String,
  // contactIds: [String],
  // contacts: [{}],
  contacts: [{
    type: mongoose.Schema.Types.String,
    ref: 'Contact'
  }],
  fieldValues: {},
  parsed: {} // *** this is where the parsed column name and values go!
}, { strict: false });

metaSchema = new mongoose.Schema({
  syncDate: Date,
  objectId: String,
  title: String,
  listType: String,
  modifiedDate: Date,
  fields: {}
});


staticSchema = new mongoose.Schema({
  syncDate: Date,
  objectId: String,
  display: String
});

contactSchema = new mongoose.Schema({
  syncDate: Date,
  objectId: String,
  properties: {}
}, { strict: false, _id: false });

clientSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  syncDate: Date,
  objectId: String,
  listId: String,
  version: Number,
  createdDate: Date,
  modifiedDate: Date,
  name: String,
  accountId: String,
  contacts: [{
    type: mongoose.Schema.Types.String,
    ref: 'Contact'
  }],
  fieldValues: {},
  parsed: {} // *** this is where the parsed column name and values go!
});

expertSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  syncDate: Date,
  objectId: String,
  parentListId: String,

  linkedinId: String,

  name: String,
  bio: String,
  country: String,
  history: String,
  experience: String,

  notes: String, // Linkedin Add Backs - Need to Contact, Attempted to Contact - No Reponse, Received Response - Need to Outreach, Spoke Over Phone, Reached Secretary/Staff via Phone - Could Not Contact/OOO, Signed Up via External Web Form - Need to Follow Up, Not Interested for now, Declined

  senior: String, // Empty, Standard, Senior
  title: String,   // for Knowledge Partner imports
  startDate: String,
  company: String, // for Knowledge Partner imports
  summary: String, // for LinkedInKP add-backs

  hourlyRate: String,
  location: String,

  progressStatus: String,    // Attempted to Contact via LinkedIn - No Response, etc
  knowledgePartner: String,  // 'Lead', 'Lead (Contacted)', 'Knowledge Partner'

  contacts: [{
    type: mongoose.Schema.Types.String,
    ref: 'Contact'
  }],

  linkedProjectIds: [],

  relateIQ: {},
  isCompliant: Boolean,
  acceptedTandC: Boolean,
  compliance: {}
});

projectSchema = new mongoose.Schema({
  caseCode: String,
  clientCaseCode: String,
  startDate: Date,
  name: String,
  region: [{}],
  industries: [{}],
  topics: [{}],
  account: [{}],
  clients: [{}],
  manager: {},
  status: String,
  specialNotes: String,
  description: String,

  experts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Expert' }],
  projectSpecificExperts: [],

  members: [{}],
  consultations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Consultation' }],

  originatingOffice: {}
});

// exports
exports.AccountMeta = mongoose.model('AccountMeta', metaSchema);
exports.ClientMeta = mongoose.model('ClientMeta', metaSchema);
exports.PartnerMeta = mongoose.model('PartnerMeta', metaSchema);

exports.IndustryStatic = mongoose.model('Industry', staticSchema);
exports.RegionStatic = mongoose.model('Region', staticSchema);

exports.Partner = mongoose.model('Partner', itemSchema);
exports.Client = mongoose.model('Client', clientSchema);

exports.Expert = mongoose.model('Expert', expertSchema);

exports.Contact = mongoose.model('Contact', contactSchema);

exports.Account = mongoose.model('Account', accountSchema);

exports.Project = mongoose.model('Project', projectSchema);

console.log('using', environment.MONGODB_URI);
mongoose.connect(environment.MONGODB_URI);

exports.db = db;
exports.mongoose = mongoose;



