'use strict';

var _ = require('lodash');
var Client = require('./client.model');

// Get list of clients
exports.index = function(req, res) {
  Client
    .find({})
    .populate('contacts')
    .exec(function (err, clients) {
      if(err) { return handleError(res, err); }
      return res.json(200, clients);
    });
};

// Get a single client
exports.show = function(req, res) {
  Client
    .findById(req.params.id)
    .populate('contacts')
    .exec(function (err, client) {
      if(err) { return handleError(res, err); }
      if(!client) { return res.send(404); }
      return res.json(client);
    });
};

// Creates a new client in the DB.
exports.create = function(req, res) {
  Client.create(req.body, function(err, client) {
    if(err) { return handleError(res, err); }
    return res.json(201, client);
  });
};

// Updates an existing client in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Client.findById(req.params.id, function (err, client) {
    if (err) { return handleError(res, err); }
    if(!client) { return res.send(404); }
    var updated = _.merge(client, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, client);
    });
  });
};
// Count the number of client in the DB
// @param listId
exports.countByList = function(req, res) {
  Client.count({listId: req.params.id}, function (err, count) {
    if(err) { return handleError(res, err); }
    console.log('Finish', count);
    return res.json(count);
  });
};
// Get the list of clients of the list in DB
exports.showByList = function(req, res) {
  Client.find({listId: req.params.id})
    .populate('contacts')
    .exec(function(err, clients){
      if(err) { return handleError(res, err); }
      if(!clients) { return res.send(404); }
      return res.json(clients);
    });
};
// Deletes a client from the DB.
exports.destroy = function(req, res) {
  Client.findById(req.params.id, function (err, client) {
    if(err) { return handleError(res, err); }
    if(!client) { return res.send(404); }
    client.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}