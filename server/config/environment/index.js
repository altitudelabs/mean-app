'use strict';

var path = require('path');
var _ = require('lodash');

function requiredProcessEnv(name) {
  if(!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(__dirname + '/../../..'),

  // Server port
  port: process.env.PORT || 9000,

  // Should we populate the DB with sample data?
  seedDB: false,

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: process.env.LYNK_SECRET_SESSION
  },

  // List of user roles
  userRoles: ['guest', 'user', 'researcher', 'am', 'admin'], // admin is always last

  // MongoDB connection options
  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  },

  facebook: {
    clientID:     process.env.FACEBOOK_ID || 'id',
    clientSecret: process.env.FACEBOOK_SECRET || 'secret',
    callbackURL:  (process.env.DOMAIN || '') + '/auth/facebook/callback'
  },

  google: {
    clientID:     process.env.GOOGLE_CLIENT_ID || 'id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'secret',
    callbackURL:  (process.env.DOMAIN || '') + '/auth/google/callback'
  },

  relateIQ: {
    apiKey:       process.env.relateIQ_APIKEY,
    apiSecret:    process.env.relateIQ_APISECRET
  },

  aws: {
    queueUrl:     process.env.AWS_SYNC2LYNK_QUEUEURL
  },

  googleCalendar: {
    clientID:     process.env.GOOGLE_CLIENT_ID || 'id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'secret',
    scopes:       process.env.GOOGLE_SCOPES || 'https://www.googleapis.com/auth/calendar',
    baseUrl:      process.env.HOME_BASE_URL || 'http://localhost:9000/api/googleCalendar',
    calendarID:   process.env.GOOGLE_CALENDAR_ID || 'ucr2a6777vp7373683g7061spk@group.calendar.google.com',
    googleUserId: process.env.GOOGLE_USER_ID || 'altitudedrive@gmail.com',
    serviceKeyPath: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH || '/Users/altitudelabs/lynk-altitude.pem',
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || ''
  }
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./' + process.env.NODE_ENV + '.js') || {});