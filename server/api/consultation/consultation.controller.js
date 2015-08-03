'use strict';

var _ = require('lodash');
var Consultation = require('./consultation.model');
var Contact = require('../contact/contact.model');
var ExpertModel = require('../expert/expert.model');
var Expert = ExpertModel.Expert;

// Get list of consultations
exports.index = function(req, res) {
  Consultation.find()
    .populate('expert project')
    .exec(function (err, consultations) {
    if(err) { return handleError(res, err); }
    return res.json(200, consultations);
  });
};

// Get a single consultation
exports.show = function(req, res) {
  Consultation.findById(req.params.id)
    .populate('expert project')
    .exec(function (err, consultation) {
      if(err) { return handleError(res, err); }
      if(!consultation) { return res.send(404); }
      return res.json(consultation);
  });
};
// by objectId
exports.showByObjectId = function(req, res) {
  // console.log('showByObjectId', req.params);
  Consultation.findOne({objectId: req.params.objectId})
    .populate('expert project')
    .exec(function (err, consultation) {
      if(err) { return handleError(res, err); }
      if(!consultation) { return res.send(404, 'Consultation not found by this Object ID'); }
      Expert.populate(consultation.expert, {path: 'contacts'}, function(err, expert){
        if(err) { handleError(res,err);}
        if(!expert) {return res.send(404);}
        consultation.expert = expert;
        return res.json(consultation);
      });
  });
};

// Creates a new consultation in the DB.
exports.create = function(req, res) {
  Consultation.create(req.body, function(err, consultation) {
    if(err) { return handleError(res, err); }
    return res.json(201, consultation);
  });
};

// Upserts
exports.upsert = function(req, res) {
  // console.log('upsert !!', req.body, req.params);
  var consultation = new Consultation(req.body);
  var upsertData = consultation.toObject();
  delete upsertData._id;

  Consultation.update({objectId: req.params.objectId}, upsertData, {upsert: true}, function (err, item) {
    if (err) return console.error(err);
    return res.json(201, item);
  });
};

// Updates an existing consultation in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Consultation.findById(req.params.id, function (err, consultation) {
    if (err) { return handleError(res, err); }
    if(!consultation) { return res.send(404); }
    var updated = _.merge(consultation, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, consultation);
    });
  });
};

// Updates an existing consultation by objectId.
exports.putByObjectId = function(req, res) {
  console.log('Consultation: putByObjectId ' + req.params.objectId);
  if(req.body._id) { delete req.body._id; }
  Consultation.update({ objectId: req.params.objectId}, req.body, function (err, numAffected, consultation) {
    if (err) { return handleError(res, err); }
    if(!consultation) { return res.send(404); }
    return res.json(200, consultation);
  });
};

exports.patchByObjectId = function(req, res) {
  // console.log('patching !!', req.body, req.params);
  if(req.body._id) { delete req.body._id; }

  Consultation.update({objectId: req.params.objectId}, req.body, function (err, numAffected, consultation) {
    console.log('err', err); console.log('update - numAffected', numAffected);
    if (err) { return handleError(res, err); }
    if(!consultation) { return res.send(404); }

    return res.json(200, consultation);
  });
};

// Deletes a consultation from the DB.
exports.destroy = function(req, res) {
  Consultation.findById(req.params.id, function (err, consultation) {
    if(err) { return handleError(res, err); }
    if(!consultation) { return res.send(404); }
    consultation.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

exports.deleteByObjectId = function(req, res) {
  console.log('objectId', req.params.objectId);
  Consultation.findOne({objectId: req.params.objectId}, function (err, consultation) {
    if(!consultation) { return res.json(404, { success: false, error: 'No consultation was found with this list Id and item Id'}); }
    if(err) { return handleError(res, err); }

    consultation.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}