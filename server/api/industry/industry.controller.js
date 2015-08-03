'use strict';

var _ = require('lodash');
var Industry = require('./industry.model');

// Get list of industrys
exports.index = function(req, res) {
  Industry.find(function (err, industrys) {
    if(err) { return handleError(res, err); }
    return res.json(200, industrys);
  });
};

// Get a single industry
exports.show = function(req, res) {
  Industry.findById(req.params.id, function (err, industry) {
    if(err) { return handleError(res, err); }
    if(!industry) { return res.send(404); }
    return res.json(industry);
  });
};

// Creates a new industry in the DB.
exports.create = function(req, res) {
  Industry.create(req.body, function(err, industry) {
    if(err) { return handleError(res, err); }
    return res.json(201, industry);
  });
};

// Updates an existing industry in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Industry.findById(req.params.id, function (err, industry) {
    if (err) { return handleError(res, err); }
    if(!industry) { return res.send(404); }
    var updated = _.merge(industry, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, industry);
    });
  });
};

// Deletes a industry from the DB.
exports.destroy = function(req, res) {
  Industry.findById(req.params.id, function (err, industry) {
    if(err) { return handleError(res, err); }
    if(!industry) { return res.send(404); }
    industry.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}