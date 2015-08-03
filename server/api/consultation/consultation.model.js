'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ConsultationSchema = new Schema({
  name: String,
  statusInProject: String,
  expert: { type: Schema.Types.ObjectId, ref: 'Expert' },
  account: [{}],
  clients: [{}],

  duration: {},
  hourlyRate: {},
  compliance: {},
  scope: String,

  project: { type: Schema.Types.ObjectId, ref: 'Project' }, // _id of which project this consultation belongs to
  //projectName: String,
  //projectStatus: String,
  //projectClientCaseCode: String,
  objectId: String, // reference for /api/consultation/:objectId

  // status dates
  selectedDate: Date,
  scheduledDate: Date,
  scheduledTimezone: String,
  completedDate: Date,
  accountDate: Date,
  paidDate: Date,

  whereExpert: String, // per request, where = passcode if conference call
  whereClient: String, // per request, where = passcode if conference call (diff country)
  conferenceDetails: String,

  expertInviteId: String, // google calendar invite ID (expert)
  clientInviteId: String, // google calendar invite ID (client)

  consultationRef: String, // “C”+date+000 where date is the scheduled consultation date.

  feedbackClient: String,
  feedbackExpert: String

});

module.exports = mongoose.model('Consultation', ConsultationSchema);