/**
 * Module dependencies.
 */

var async = require('async');
var readline = require('linebyline');

var _ = require('lodash');
var bootstrap = require('./bootstrap');

var numSynced = 0;

var db = bootstrap.db;
db.on('error', console.error);
db.once('open', function () {
  console.log('Today is ', new Date());
  console.log('Connected to MongoDB');
  start();
});

var collections = [
  {
    collection: 'AccountMeta',
    fileName: 'accountmetas.json'
  },
  {
    collection: 'Account',
    fileName: 'accounts.json'
  },
  {
    collection: 'ClientMeta',
    fileName: 'clientmetas.json'
  },
  {
    collection: 'Client',
    fileName: 'clients.json'
  },
  {
    collection: 'Contact',
    fileName: 'contacts.json'
  },
  {
    collection: 'Expert',
    fileName: 'experts.json'
  },
  {
    collection: 'IndustryStatic',
    fileName: 'industries.json'
  },
  {
    collection: 'Project',
    fileName: 'projects.json'
  },
  {
    collection: 'RegionStatic',
    fileName: 'regions.json'
  }
];

function importCollection(modelData, callback) {
  console.log('  - Start import of: ' + modelData.fileName);

  var Model = bootstrap[modelData.collection];
  var fileName = modelData.fileName;

  async.waterfall([
    function (cb) {
      Model.remove({}, cb);
    },
    function (res, cb) {
      var rl = readline(__dirname + '/' + fileName);
      rl.on('line', function(line, lineCount, byteCount) {

        numLines = lineCount;

        // each line is a json document
        var jsonData = JSON.parse(line);

        // fix $oid
        jsonData._id = jsonData._id.$oid || jsonData.objectId;
        if (jsonData.experts) {
          jsonData.experts = jsonData.experts.map(function(obj) {
            obj = obj.$oid;
            return obj;
          });
        }

        if (jsonData.startDate && Model.modelName !== 'Expert') {
          jsonData.startDate = jsonData.startDate.$date;
        }

        // get rid of unused data
        delete jsonData.syncDate;
        delete jsonData.modifiedDate;
        delete jsonData.createdDate;

        // console.log(jsonData);

        Model.update({_id: jsonData._id}, jsonData, {upsert: true}, function (err, item) {
          if (err) {
            console.log(err);
          }
        });
      })
      .on('error', function(e) {
        cb(e);
      })
      .on('end', function(e, cb) {
        console.log('end:', Model.modelName);
        if (++numSynced === collections.length) {
          console.log('done');
          console.log('* Import completed');
          process.exit();
        }
      })
    }
  ], callback);
}

function start() {
  console.log('* Start import');

  async.each(collections, importCollection, function(err) {
    if (err) {
      return console.error('Error during import: '+ err);
    }
    process.exit();
  });
}

