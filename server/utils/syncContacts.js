var request = require('request'),
  _ = require('lodash');

var bootstrap = require('./bootstrap');

var Contact = bootstrap.Contact;
var Expert = bootstrap.Expert;
var Client = bootstrap.Client;


console.log('Today is ', new Date());

var contactsInDB = {
  synced: 0,
  done: false,
  objectIdList: []
};

/*
PROPOSED SOLUTION

We fetch all expert's contacts and client's contacts as one big list
Loop through and update those only
*/
var eee = [], ccc = [];

Expert.find({}, function(err, experts) {
  for (var i = experts.length - 1; i >= 0; i--) {
    if (experts[i].contacts[0]) {
      contactsInDB.objectIdList.push(experts[i].contacts[0]);
      eee.push(experts[i].contacts[0]);
    }
  };

  Client.find({}, function(err, clients) {
    for (var j = clients.length - 1; j >= 0; j--) {
      if (clients[j].contacts[0]) {
        contactsInDB.objectIdList.push(clients[j].contacts[0]);
        ccc.push(clients[j].contacts[0]);
      }
      // if ('5558a044e4b0f15b376dc646' === clients[j].contacts[0]) {
      //   console.log('found 5558a044e4b0f15b376dc646');
      // }
    };

    contactsInDB.objectIdList = _.unique(contactsInDB.objectIdList);
    console.log(contactsInDB.objectIdList.length, 'total contacts found');

    // // DEBUG
    // Contact.find({}).select('objectId -_id').exec(function(err, docs) {
    //   docs = _.pluck(docs, 'objectId');
    //   console.log('docs', docs.length);

    //   var c = 0, e = 0;
    //   for (var i = ccc.length - 1; i >= 0; i--) {
    //     if (!_.contains(docs, ccc[i])) {
    //       console.log('client not found in contact', ccc[i]);
    //       c++;
    //     }
    //   };
    //   for (var i = eee.length - 1; i >= 0; i--) {
    //     if (!_.contains(docs, eee[i])) {
    //      console.log('expert not found in contact', eee[i]);
    //      e++;
    //     }
    //   };
    //   console.log('c', c);
    //   console.log('e', e);
    // });
    // // END DEBUG


    // SYNC CODE
    var start = 0, limit = 200, count = 0, synced = false;

    (function getPageOfItems (start, limit) {
      var end = start + limit;

      // console.log('making api request to Contacts ( start ' + start + ', end ' + end + ') ...');
      var apiCall = 'https://api.relateiq.com/v2/contacts/?_ids='+contactsInDB.objectIdList.slice(start, end).join(',')+'&_limit='+limit;//+'&_start='+'0';
      // console.log(apiCall);
      // console.log('start',start,'end',end);


      request({
        auth: {
          'user': bootstrap.relateIQ_APIKEY,
          'pass': bootstrap.relateIQ_APISECRET
        },
        uri: apiCall,

      }, function (error, response, body) {

        if (error) { console.log('error', error); }

        var data = JSON.parse(response.body);

        if (data.objects) {
          // console.log('adding', data.objects.length, 'contacts ...');

          for (var key in data.objects) {

            var d = data.objects[key];

            if ('5558a044e4b0f15b376dc646' === d.id) {
              console.log('found 5558a044e4b0f15b376dc646');
            }
            // !!! sometimes relateIQ returns contacts we did NOT ask for !!!
            if (_.contains(contactsInDB.objectIdList, d.id)) {
              var contact = new Contact({
                  syncDate: Date.now(),
                  objectId: d.id,
                  properties: d.properties
                });

              var upsertData = contact.toObject();
              upsertData._id = upsertData.objectId; // force _id = relatedIQ's contact's id

              Contact.update({objectId: d.id}, upsertData, {upsert: true, write: 1}, function (err, item) {
                if (err) {
                  console.log('error in contact update', err);
                  process.exit(1);
                }

                contactsInDB.synced++;
              });
            }

          }

          var numResults = data.objects.length;
          // we +800 because relateIQ api is screwed up!!! never returns things properly
          if (numResults === 0 || count > contactsInDB.objectIdList.length + 1000) {

            synced = true;

            console.log(count, " Contacts synced!", new Date());
            process.exit();

          } else {
            start += numResults;
            count += numResults;
            console.log('synced', count, 'contacts');
            getPageOfItems(start, limit);
          }
        } else {
          console.log('error: start',start,'limit',limit);
          console.log('error: data', data);
          process.exit();
        }

      });

    })(start, limit);


  });
});




/*

// CURRENT IN PRODUCTION
// 1. Get fresh from relateIQ
console.log('Fetching all Contacts ...');
//curl 'https://api.relateiq.com/v2/contacts?_start=0&_limit=200'

var start = 0, limit = 200, count = 0, synced = false;

(function getPageOfItems (start, limit) {

  console.log('making api request to Contacts ( start ' + start + ', limit ' + limit + ') ...');

  var apiCall = 'https://api.relateiq.com/v2/contacts?_start='+start+'&_limit='+limit;

  request({
    auth: {
      'user': bootstrap.relateIQ_APIKEY,
      'pass': bootstrap.relateIQ_APISECRET
    },
    uri: apiCall,

  }, function (error, response, body) {

    if (error) {
      console.error(error);
    }

    var data = JSON.parse(response.body);

    for (var key in data.objects) {

      var d = data.objects[key];

      var contact = new Contact({
          syncDate: Date.now(),
          objectId: d.id,
          properties: d.properties
        });

      contactsInDB.objectIdList.push(d.id);

      var upsertData = contact.toObject();
      upsertData._id = upsertData.objectId; // force _id = relatedIQ's contact's id

      Contact.update({objectId: d.id}, upsertData, {upsert: true}, function (err, item) {
        if (err) return console.error(err);

        contactsInDB.synced++;
        // console.dir(item);
      });
    }

    var numResults = data.objects.length;
    if (numResults === 0) {

      synced = true;

      console.log(count, " Contacts synced!", new Date());
      process.exit();
      // deleteOutdatedContacts();

    } else {
      start += numResults;
      count += numResults;

      getPageOfItems(start, limit);
    }

  });

})(start, limit);


*/


// function deleteOutdatedContacts() {
//   // Get list of objectIds from Contacts,
//   console.log('safeguarding', contactsInDB.objectIdList.length, 'contacts');

//   // Delete those NOT on that list
//   Contact.collection.remove({objectId: {$nin: contactsInDB.objectIdList}}, function (err, result) {
//     if (err) {
//       console.log('smart delete failed', err);
//     } else {
//       console.log('all other contacts deleted');
//     }
//     console.log('... done', new Date());
//     process.exit();
//   });
// }
