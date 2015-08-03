'use strict';

var _ = require('lodash');
var Account = require('./account.model');
var request = require('request');
var config = require('../../config/environment');
// Get list of accounts
exports.index = function(req, res) {
  Account
    .find()
    .exec(function (err, accounts) {
    if(err) { return handleError(res, err); }
    return res.json(200, accounts);
  });
};

// Get a single account
exports.show = function(req, res) {
  Account
    .findById(req.params.id)
    .populate('contacts')
    .exec(function (err, account) {
      if(err) { return handleError(res, err); }
      if(!account) { return res.send(404); }
      console.log(account);
      return res.json(account);
    });
};

// Get a user in RelateIQ
exports.relateIQ = function (req, res) {
  console.log('RelateIQ call user '+ req.params.id);
  var apiCall = 'https://api.relateiq.com/v2/users/'+req.params.id;
  request({
      auth: {
        'user': config.relateIQ.apiKey,
        'pass': config.relateIQ.apiSecret
      },
      uri: apiCall

    }, function (error, response, body) {
      if (error) { return handleError(res, error); }
      var data = JSON.parse(response.body);
      if(!data) { return res.json(404, { success: false, error: 'Users cannot get'}); }
      else return res.json(200, data);
    });
};

// Creates a new account in the DB.
exports.create = function(req, res) {
  Account.create(req.body, function(err, account) {
    if(err) { return handleError(res, err); }
    return res.json(201, account);
  });
};

// Updates an existing account in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Account.findById(req.params.id, function (err, account) {
    if (err) { return handleError(res, err); }
    if(!account) { return res.send(404); }
    var updated = _.merge(account, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, account);
    });
  });
};

// Deletes a account from the DB.
exports.destroy = function(req, res) {
  Account.findById(req.params.id, function (err, account) {
    if(err) { return handleError(res, err); }
    if(!account) { return res.send(404); }
    account.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}