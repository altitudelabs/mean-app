var _ = require('lodash');
var request = require('request');

var bootstrap = require('./bootstrap');

// var Account = bootstrap.Account;
var Contact = bootstrap.Contact;
var Client = bootstrap.Client;
var ClientMeta = bootstrap.ClientMeta;


console.log('Today is ', new Date());

var listsToSync = [
  {
    id: '55682f70e4b09e15082e86b1',  // 10EQS
    saveMeta: function (d) {
      var clientMeta = new ClientMeta({
          syncDate: Date.now(),
          objectId: d.id,
          title: d.title,
          listType: d.listType,
          modifiedDate: d.modifiedDate,
          fields: d.fields
        });

      var upsertData = clientMeta.toObject();
      delete upsertData._id;

      ClientMeta.update({objectId: d.id}, upsertData, {upsert: true}, function (err, item) {
        if (err) return console.error(err);
      });
    },
    synced: false
  }
];

ClientMeta.remove({}, function (){
  console.log('ClientMeta deleted.');

  listsToSync.map(function (list) {
    var apiCall = 'https://api.relateiq.com/v2/lists/'+list.id;
    request({
        auth: {
          'user': bootstrap.relateIQ_APIKEY,
          'pass': bootstrap.relateIQ_APISECRET
        },
        uri: apiCall
      }, function(error, response, body) {
        var d = JSON.parse(response.body);
        // console.log(d);
        var metaData = new ClientMeta({
          syncDate: Date.now(),
          objectId: d.id,
          title: d.title,
          listType: d.listType,
          modifiedDate: d.modifiedDate,
          fields: d.fields
        });
        console.log('Exiting', new Date());
        var upsertData = metaData.toObject();
        delete upsertData._id;
        ClientMeta.update({objectId: d.id}, upsertData, {upsert: true}, function (err, item) {
          if (err) return console.error(err);
        });
        process.exit();
      });
  });
});