var request = require('request'),
  _ = require('lodash');
//  async = require('async');

var bootstrap = require('./bootstrap');

var Partner = bootstrap.Partner;
var PartnerMeta = bootstrap.PartnerMeta;

var listsToSync = [
  {
    id: '54871c35e4b01d5ccb3a9e23',  // Knowledge Partners
    collection: 'partners',
    meta: 'partners_meta',
    saveItem: function (d) {
      var partner = new Partner({
          syncDate: Date.now(),
          objectId: d.id,
          listId: d.listId,
          version: d.version,
          createdDate: d.createdDate,
          modifiedDate: d.modifiedDate,
          name: d.name,
          accountId: d.accountId,
          contacts: d.contactIds,
          fieldValues: d.fieldValues
        });

      var upsertData = partner.toObject();
      delete upsertData._id;

      Partner.update({objectId: d.id}, upsertData, {upsert: true}, function (err, item) {
        if (err) return console.error(err);
      });
    },
    saveMeta: function (d) {
      var partner = new PartnerMeta({
          syncDate: Date.now(),
          objectId: d.id,
          title: d.title,
          listType: d.listType,
          modifiedDate: d.modifiedDate,
          fields: d.fields
        });

      var upsertData = partner.toObject();
      delete upsertData._id;

      PartnerMeta.update({objectId: d.id}, upsertData, {upsert: true}, function (err, item) {
        if (err) return console.error(err);
      });
    },
    synced: false
  }
];


var listsRemaining = listsToSync.length;

console.log('Today is ', new Date());



// 1. Remove all Partners
Partner.remove({}, function() {
  console.log('All Partners deleted.');

  // 2. Update meta data
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


  // 3. Upsert list data
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

});


// // Test populate
// Partner
//   .find()
//   .populate('contacts')
//   .exec(function (err, docs) {
//     docs.forEach(function (doc) {
//       console.log(doc);
//     });
//   });

