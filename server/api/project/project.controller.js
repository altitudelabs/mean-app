'use strict';
var url = require('url');
var _ = require('lodash');


var Project = require('./project.model');
var Consultation = require('../consultation/consultation.model');


var validationError = function(res, err) {
  return res.json(422, err);
};


// Get list of projects, sort by start Date (desc)
exports.index = function(req, res) {
  var searchQuery = {};
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;

  if (query.hasOwnProperty('mine')) {
    searchQuery = _.extend(searchQuery, { members: {'$elemMatch': {name: query.mine} } });
  }

  if (query.hasOwnProperty('archive')) {
    searchQuery = _.extend(searchQuery, { status: {'$in': ['Archived']} });
  } else {
    searchQuery = _.extend(searchQuery, { status: {'$nin': ['Archived', 'Deleted']} });
  }
  // console.log('searchQuery', searchQuery);
  Project.find(searchQuery).populate('experts').sort('-startDate').exec(function (err, projects) {
    if(err) { return handleError(res, err); }
    return res.json(200, projects);
  });
};

exports.count = function(req, res) {
  Project.count({}, function (err, count) {
    if(err) { return handleError(res, err); }
    return res.json(count);
  });
};

exports.countToday = function(req, res) {
  var pad = "00",
    today = new Date(),
    yyyy = today.getFullYear(),
    mm = today.getMonth() + 1,
    dd = today.getDate();
  var paddedMonth = pad.substring(0, pad.length - mm.toString().length) + mm;
  var paddedDate = pad.substring(0, pad.length - dd.toString().length) + dd;
  var isoDateString = yyyy + '-' + paddedMonth + '-' + paddedDate + 'T00:00:00.000Z';
  var nd = new Date(isoDateString);

  Project.count({ startDate: {"$gte": nd }}, function (err, count) {
    if(err) { return handleError(res, err); }
    return res.json(count);
  });
};

// Get a single project
exports.show = function(req, res) {
  Project.findById(req.params.id)
    .populate('experts consultations')
    .exec(function (err, project) {
    if(err) { return handleError(res, err); }
    if(!project) { return res.send(404); }
    Consultation.populate(project.consultations, { "path": "expert", "select": "name objectId compliance" }, function (err, consultations) {
      if(err) { return handleError(res, err); }
      if(!consultations) { return res.send(404); }
      project.consultations = consultations;
      return res.json(project);
    })
  });
};

// Creates a new project in the DB.
exports.create = function(req, res) {
  Project.create(req.body.content, function (err, project) {
    // if(err) { return handleError(res, err); }
    if (err) { return validationError(res, err); }
    return res.json(201, project);
  });
};

// Updates an existing project in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  // console.log('putting !!', req.body, req.params);
  Project.findById(req.params.id, function (err, project) {
    if (err) { return handleError(res, err); }
    if(!project) { return res.send(404); }
    var updated = _.merge(project, req.body);
    // console.log('updated is', updated);
    updated.save(function (err, project) {
      if (err) { return handleError(res, err); }
      // console.log('saved is', project);
      return res.json(200, project);
    });
  });
};

// Updates partially an existing project in the DB.
exports.patch = function(req, res) {
  // console.log('patching !!', req.body, req.params);
  if(req.body._id) { delete req.body._id; }

  Project.update({_id: req.params.id}, req.body, function (err, numAffected, project) {
    if (err) console.log('patch error', err);
    console.log('project patch - numAffected', numAffected);

    if (err) { return handleError(res, err); }
    if(!project) { return res.send(404); }

    return res.json(200, project);
  });
};

// Deletes a project from the DB.
exports.destroy = function(req, res) {
  Project.findById(req.params.id, function (err, project) {
    if(err) { return handleError(res, err); }
    if(!project) { return res.send(404); }
    project.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.json(500, err);
}



