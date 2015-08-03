'use strict';

// Production specific configuration
// =================================
module.exports = {
  // Server IP
  ip:       process.env.IP ||
            undefined,

  // Server port
  port:     process.env.PORT ||
            8088,

  // MongoDB connection options
  mongo: {
    uri:    process.env.MONGODB_URI
            // 'mongodb://' + process.env.LYNK_MONGOUSER + ':' + process.env.LYNK_MONGOPASSWD + ':' + process.env.LYNK_MONGOPORT + '/' + process.env.LYNK_MONGODBNAME
  },

  seedDB: false
};