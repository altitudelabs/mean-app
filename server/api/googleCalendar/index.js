'use strict';

var express = require('express');
var controller = require('./googleCalendar.controller');

var allowCrossDomain = function(req, res, next) {

  //instantiate allowed domains list
  var allowedDomains = [
    'http://localhost:9000',
    'http://lynk-altitude.straitsnetwork.com'
  ];

  //check if request origin is in allowed domains list
  if (allowedDomains.indexOf(req.headers.origin) !== -1) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  }

  // intercept OPTIONS method
  if ('OPTIONS' === req.method) {
    res.send(200);
  } else {
    next();
  }
};


var router = express.Router();

router.use(allowCrossDomain);

router.get('/', controller.index);
// router.get('/authorize', controller.authorize);
// router.get('/deauthorize', controller.deauthorize);
// router.get('/callback', controller.callback);

// used
router.get('/events', controller.showEvents);
router.post('/event', controller.createEvent);
router.patch('/event/:eventId', controller.patchEvent);

module.exports = router;