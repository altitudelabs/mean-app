'use strict';

var _ = require('lodash');
var Expertcategory = require('./expertcategory.model');

// Get list of expertcategories
exports.index = function(req, res) {
  Expertcategory.find(function (err, expertcategories) {
    if(err) { return handleError(res, err); }
    return res.json(200, expertcategories);
  });
};

// Get a single expertcategory
exports.show = function(req, res) {
  Expertcategory.findById(req.params.id, function (err, expertcategory) {
    if(err) { return handleError(res, err); }
    if(!expertcategory) { return res.send(404); }
    return res.json(expertcategory);
  });
};

// Creates a new expertcategory in the DB.
exports.create = function(req, res) {
  Expertcategory.create(req.body, function(err, expertcategory) {
    if(err) { return handleError(res, err); }
    return res.json(201, expertcategory);
  });
};

// Updates an existing expertcategory in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Expertcategory.findById(req.params.id, function (err, expertcategory) {
    if (err) { return handleError(res, err); }
    if(!expertcategory) { return res.send(404); }
    var updated = _.merge(expertcategory, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, expertcategory);
    });
  });
};

// Deletes a expertcategory from the DB.
exports.destroy = function(req, res) {
  Expertcategory.findById(req.params.id, function (err, expertcategory) {
    if(err) { return handleError(res, err); }
    if(!expertcategory) { return res.send(404); }
    expertcategory.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}