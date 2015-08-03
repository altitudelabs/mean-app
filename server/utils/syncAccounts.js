var request = require('request'),
  _ = require('lodash');

var bootstrap = require('./bootstrap');


var Account = bootstrap.Account;
var AccountMeta = bootstrap.AccountMeta;


var listsToSync = [
  {
    id: '5537571ae4b0293c8b764a70',  // Current Clients
    collection: 'accounts',
    meta: 'accounts_meta',
    saveItem: function (d) {
      var account = new Account({
          syncDate: Date.now(),
          objectId: d.id,
          listId: d.listId,
          version: d.version,
          createdDate: d.createdDate,
          modifiedDate: d.modifiedDate,
          name: d.name,
          accountId: d.accountId,
          contacts: d.contactIds,
          fieldValues: d.fieldValues,
          linkedItemsIds: d.linkedItemsIds
        });

      var upsertData = account.toObject();
      delete upsertData._id;

      Account.update({objectId: d.id}, upsertData, {upsert: true}, function (err, item) {
        if (err) return console.error(err);
        // console.dir(item);
      });
    },
    saveMeta: function (d) {
      var account = new AccountMeta({
          syncDate: Date.now(),
          objectId: d.id,
          title: d.title,
          listType: d.listType,
          modifiedDate: d.modifiedDate,
          fields: d.fields
        });

      var upsertData = account.toObject();
      delete upsertData._id;

      AccountMeta.update({objectId: d.id}, upsertData, {upsert: true}, function (err, item) {
        if (err) return console.error(err);
        // console.dir(item);
      });
    },
    synced: false
  }
];



var listsRemaining = listsToSync.length;

console.log('Today is ', new Date());

// Update meta data
listsToSync.map(function (list) {
  console.log('making api request (list ' + list.id + ') ...');

  var apiCall = 'https://api.relateiq.com/v2/lists/'+list.id;

  request({
    auth: {
      'user': bootstrap.relateIQ_APIKEY,
      'pass': bootstrap.relateIQ_APISECRET
    },
    uri: apiCall

  }, function (error, response, body) {

    var data = JSON.parse(response.body);
    list.saveMeta(data);

    console.log(list.collection, "meta synced!");
  });

});


// Upsert list data
listsToSync.map(function (list) {

  var start = 0, limit = 50;

  (function getPageOfItems (list, start, limit) {

    console.log('making api request (list ' + list.id + ', start ' + start + ', limit ' + limit + ') ...');

    var apiCall = 'https://api.relateiq.com/v2/lists/'+list.id+'/listitems?_start='+start+'&_limit='+limit;

    request({
      auth: {
        'user': bootstrap.relateIQ_APIKEY,
        'pass': bootstrap.relateIQ_APISECRET
      },
      uri: apiCall,
      // gzip: true
    }, function (error, response, body) {

      var data = JSON.parse(response.body);

      for (var key in data.objects) {

        var d = data.objects[key];

        list.saveItem(d);
      }

      var numResults = data.objects.length;
      if (numResults === 0) {

        list.synced = true;
        console.log(list.collection, "synced!");

        if (--listsRemaining === 0) {
          // NOW do field mapping, then done
          console.log("... and we're done", new Date());
          process.exit();
        }

      } else {
        start += numResults;
        getPageOfItems(list, start, limit);
      }

    });

  })(list, start, limit);

});









