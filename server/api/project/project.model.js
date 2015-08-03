'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var ProjectSchema = new Schema({
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

  experts: [{ type: Schema.Types.ObjectId, ref: 'Expert' }], //[{}],
  projectSpecificExperts: [],

  members: [{}],
  consultations: [{ type: Schema.Types.ObjectId, ref: 'Consultation' }],

  originatingOffice: {}
});


/**
 * Validations
 */

// Validate empty name
ProjectSchema
  .path('name')
  .validate(function(name) {
    return name.length;
  }, 'Project name cannot be blank');


// // Validate empty region
// ProjectSchema
//   .path('region')
//   .validate(function(region) {
//     return region.length;
//   }, 'Region cannot be blank');

// // Validate empty industry
// ProjectSchema
//   .path('industries')
//   .validate(function(industry) {
//     return industry.length;
//   }, 'Industry cannot be blank');

// // Validate empty account
// ProjectSchema
//   .path('account')
//   .validate(function(account) {
//     return account.length;
//   }, 'Account cannot be blank');

// // Validate empty clients
// ProjectSchema
//   .path('clients')
//   .validate(function(clients) {
//     return clients.length;
//   }, 'Clients cannot be blank');


// // Validate email is not taken
// ProjectSchema
//   .path('email')
//   .validate(function(value, respond) {
//     var self = this;
//     this.constructor.findOne({email: value}, function(err, user) {
//       if(err) throw err;
//       if(user) {
//         if(self.id === user.id) return respond(true);
//         return respond(false);
//       }
//       respond(true);
//     });
// }, 'The specified email address is already in use.');




module.exports = mongoose.model('Project', ProjectSchema);