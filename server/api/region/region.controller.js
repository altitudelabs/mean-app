'use strict';

var _ = require('lodash');
var Region = require('./region.model');

// Get list of regions
exports.index = function(req, res) {
  Region.find(function (err, regions) {
    if(err) { return handleError(res, err); }
    return res.json(200, regions);
  });
};

// Get a single region
exports.show = function(req, res) {
  Region.findById(req.params.id, function (err, region) {
    if(err) { return handleError(res, err); }
    if(!region) { return res.send(404); }
    return res.json(region);
  });
};

// Creates a new region in the DB.
exports.create = function(req, res) {
  Region.create(req.body, function(err, region) {
    if(err) { return handleError(res, err); }
    return res.json(201, region);
  });
};

// Updates an existing region in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Region.findById(req.params.id, function (err, region) {
    if (err) { return handleError(res, err); }
    if(!region) { return res.send(404); }
    var updated = _.merge(region, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, region);
    });
  });
};

// Deletes a region from the DB.
exports.destroy = function(req, res) {
  Region.findById(req.params.id, function (err, region) {
    if(err) { return handleError(res, err); }
    if(!region) { return res.send(404); }
    region.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}