'use strict';

var _ = require('lodash');
var config = require('../../config/environment');
var oauth = require('oauth');
var gcal = require('google-calendar');
var q = require('q');

var googleAuth = require('google-oauth-jwt');

function getAccessTokenWithService(emailToUse) {
  // emailToUse = emailToUse || config.googleCalendar.serviceAccountEmail;
  var deferred = q.defer();
  var accessToken;
  var opts = {
    // use the email address of the service account, as seen in the API console
    email: config.googleCalendar.serviceAccountEmail,
    // use the PEM file we generated from the downloaded key
    keyFile: config.googleCalendar.serviceKeyPath,
    // specify the scopes you wish to access
    scopes: ['https://www.googleapis.com/auth/calendar']
  };
console.log('config.env', config.env);
  if (config.env === 'production' && emailToUse) {
    _.extend(opts, {
      // which email to impersonate
      delegationEmail: emailToUse
    });
  }

  console.log('getAccessTokenWithService OPTS', opts);
  googleAuth.authenticate(opts, function (err, token) {
    if (err) {
      deferred.reject(err);
    } else {
      console.log('accessToken from service account', token);

      accessToken = token;
      deferred.resolve(accessToken);
    }
  });

  return deferred.promise;
}



//=====
// http://www.jonathanbroquist.com/building-a-google-calendar-booking-app-with-mongodb-expressjs-angularjs-and-node-js-part-1/
var oa; // oauth
var refreshToken;

var User = require('../user/user.model');
var GoogleCalendar = require('./googleCalendar.model');

function authorize() {
  var deferred = q.defer();

  oa = new oauth.OAuth2(
    config.googleCalendar.clientID,
    config.googleCalendar.clientSecret,
    "https://accounts.google.com/o",
    "/oauth2/auth",
    "/oauth2/token");

  if (refreshToken) {

    oa.getOAuthAccessToken(refreshToken, {

      grant_type: 'refresh_token',
      client_id: config.googleCalendar.clientID,
      client_secret: config.googleCalendar.clientSecret

    }, function (err, access_token, refresh_token, res) {

      console.log('authorize() res', res);
      console.log('authorize() refresh_token', refresh_token);

      refreshToken = refresh_token;

      //lookup settings from database
      User.findOne({ email: config.googleCalendar.googleUserId }, function (err, user) {
        var expiresIn = parseInt(res.expires_in);
        var accessTokenExpiration = new Date().getTime() + (expiresIn * 1000);

        //add refresh token if it is returned
        if (refresh_token) user.google_refresh_token = refresh_token;

        //update access token in database
        user.google_access_token = access_token;
        user.google_access_token_expiration = accessTokenExpiration;

        user.save(function (err, user) {
          console.log('-- access token updated:', access_token);

          deferred.resolve(access_token);
        });
      });

    });
  }
  else
  {
    deferred.reject({error: 'Application needs authorization.'});
  }

  return deferred.promise;
}

function getAccessToken() {

  var deferred = q.defer();
  var accessToken;

  User.findOne({ email: config.googleCalendar.googleUserId }, function (err, user) {
    console.log('getAccessToken:', err, user);

    //check if access token is still valid
    var today = new Date();
    var currentTime = today.getTime();
    if (currentTime < user.google_access_token_expiration) {
      //use the current access token

      accessToken = user.google_access_token;
      deferred.resolve(accessToken);

    } else {
      //refresh the access token
      authorize().then(function (token) {

        accessToken = token;
        deferred.resolve(accessToken);

      }, function(error) {

        deferred.reject(error);
      });
    }
  });

  return deferred.promise;
}


// Get list of googleCalendars
exports.index = function(req, res) {
  return res.json(200, {message: 'api is up; you are not here'});
};


exports.authorize = function(req, res) {
  console.log('/authorize');

  oa = new oauth.OAuth2(
    config.googleCalendar.clientID,
    config.googleCalendar.clientSecret,
    "https://accounts.google.com/o",
    "/oauth2/auth",
    "/oauth2/token");

  var redirectUrl = oa.getAuthorizeUrl({
    scope: config.googleCalendar.scopes,
    response_type: 'code',
    redirect_uri: config.googleCalendar.baseUrl + '/callback',
    access_type: 'offline',
    user_id: config.googleCalendar.googleUserId
  });

  console.log('/authorize - redirecting to', redirectUrl);
  res.redirect(redirectUrl);
};

exports.deauthorize = function(req, res) {
  console.log('/deauthorize');
};

exports.callback = function(req, res) {
  console.log('/callback');

  if (req.query.code) {

    oa = new oauth.OAuth2(
      config.googleCalendar.clientID,
      config.googleCalendar.clientSecret,
      "https://accounts.google.com/o",
      "/oauth2/auth",
      "/oauth2/token");

    oa.getOAuthAccessToken(req.query.code, {

      grant_type: 'authorization_code',
      redirect_uri: config.googleCalendar.baseUrl + '/callback'

    }, function (err, access_token, refresh_token, res) {

      console.log('callback\'s res is', res);
      console.log('callback\'s refresh_token is', refresh_token);

      if (err) {
        res.json(500, JSON.stringify(err));

      } else {

        //lookup settings from database

        var googleUserId = config.googleCalendar.googleUserId;

        User.findOne({ email: googleUserId }, function (err, user) {
          if (err) {
            res.json(404, {'error': 'User not found'});
          } else {
            console.log('--writing access token to database--');
            var accessTokenExpiration = new Date().getTime() + (3500 * 1000);

            //update access token in database
            user.google_access_token = access_token;
            user.google_access_token_expiration = accessTokenExpiration;

            //set google refresh token if it is returned
            if (refresh_token) user.google_refresh_token = refresh_token;

            user.save(function (err, user) {
              // send back
              // console.log('sending back user');
              // if (refresh_token)
              //   res.send(200, refresh_token);
              // else
              // res.json(200, user);
              console.log('what is res', res);
            });
          }
        });

      }

    });
  }
};




exports.showEvents = function (req, res) {
  console.log('showEvents');

  var getGoogleEvents = function(accessToken) {
    //instantiate google calendar instance
    var google_calendar = new gcal.GoogleCalendar(accessToken);

    var googleUserId = config.googleCalendar.googleUserId;

    google_calendar.events.list(googleUserId, {'timeMin': new Date().toISOString()}, function(err, eventList) {
      if(err){
        res.send(500, err);
      } else {
        res.json(200, { "eventList" : eventList });
      }
    });
  };

  //retrieve current access token
  getAccessTokenWithService()
  .then(function (accessToken) {
    getGoogleEvents(accessToken);
  })
  .fail(function(error) {
    console.log('showEvents error', error);
    // res.redirect(config.googleCalendar.baseUrl + '/authorize');
  });
};


function prepareAttendees(attendees, selfEmail) {
  var node = [];

  for (var i = attendees.length - 1; i >= 0; i--) {
    var attendee = {
      'email': attendees[i],
      'organizer': false,
      'responseStatus': 'needsAction'
    };
    node.push(attendee);
  };

  // add self as organizer
  node.push({
    'email': selfEmail,
    'organizer': true,
    'self': true,
    'responseStatus': 'needsAction'
  });

  return node;
}

exports.createEvent = function (req, res) {

  var emailToUse = req.body.emailToUse;

  var googleUserId = config.googleCalendar.googleUserId;
  console.log('createEvent googleUserId', googleUserId);
  console.log('createEvent emailToUse', emailToUse);

  var addEventBody = {
    'status': 'confirmed',
    'summary': req.body.summary,
    'description': req.body.description,
    'location': req.body.location,
    'organizer': {
      'email': googleUserId,
      'self': true
    },
    'start': {
      'dateTime': req.body.startDate,
    },
    'end': {
      'dateTime': req.body.endDate
    },
    'attendees': prepareAttendees(req.body.attendees, googleUserId)
  };

  var addGoogleEvent = function(accessToken) {

    var google_calendar = new gcal.GoogleCalendar(accessToken);

    var calendarId = config.googleCalendar.calendarID;// ucr2a6777vp7373683g7061spk@group.calendar.google.com

    console.log('****** ADDING GOOGLE EVENT *******');
    console.log('notifyAttendees', req.body.notifyAttendees);
    console.log('calendarId', calendarId);
    google_calendar.events.insert(calendarId, addEventBody, {sendNotifications: req.body.notifyAttendees}, function(addEventError, addEventResponse) {
      console.log('addGoogleEvent', addEventError, addEventResponse);

      if (addEventError) {

        res.send(400, addEventError);

      } else {

        res.send(200, addEventResponse);
      }

    });
  };


  getAccessTokenWithService(emailToUse)
    .then(function (accessToken) {
      addGoogleEvent(accessToken);
    })
    .fail(function(error) {
      console.log('createEvent fail', error);
    });

};

exports.patchEvent = function (req, res) {

  var emailToUse = req.body.emailToUse;

  var googleUserId = config.googleCalendar.googleUserId;
  var eventId = req.params.eventId;
  console.log('patchEvent', eventId);
  console.log('patchEvent googleUserId', googleUserId);
  console.log('patchEvent emailToUse', emailToUse);

  var addEventBody = {
    'status': 'confirmed',
    'summary': req.body.summary,
    'description': req.body.description,
    'location': req.body.location,
    'organizer': {
      'email': googleUserId,
      'self': true
    },
    'start': {
      'dateTime': req.body.startDate,
    },
    'end': {
      'dateTime': req.body.endDate
    },
    'attendees': prepareAttendees(req.body.attendees, googleUserId)
  };

  var patchGoogleEvent = function(accessToken, eventId) {

    var google_calendar = new gcal.GoogleCalendar(accessToken);

    var calendarId = config.googleCalendar.calendarID;// ucr2a6777vp7373683g7061spk@group.calendar.google.com

    console.log('****** PATCHING GOOGLE EVENT *******');
    console.log('notifyAttendees', req.body.notifyAttendees);
    google_calendar.events.patch(calendarId, eventId, addEventBody, {sendNotifications: req.body.notifyAttendees}, function(patchEventError, patchEventResponse) {
      console.log('patchGoogleEvent', patchEventError, patchEventResponse);

      if (patchEventError) {

        res.send(400, patchEventError);

      } else {

        res.send(200, patchEventResponse);
      }

    });
  };


  getAccessTokenWithService(emailToUse)
    .then(function (accessToken) {
      patchGoogleEvent(accessToken, eventId);
    })
    .fail(function(error) {
      console.log('patchEvent fail', error);
    });
};

function handleError(res, err) {
  return res.send(500, err);
}
