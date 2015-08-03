var _ = require('lodash');
var request = require('request');

var bootstrap = require('./bootstrap');

// var Account = bootstrap.Account;
var Contact = bootstrap.Contact;
var Client = bootstrap.Client;
var ClientMeta = bootstrap.ClientMeta;


/*
For each contactIds under each Account, find Contact and copy its properties
Store in Account's contacts
*/
var clientsInDB = {
  synced: 0,
  done: false,
  objectIdList: []
};

var listIds =  [
  // Individual list ID
  {individualId: '55682f70e4b09e15082e86b1', name: '10EQS'},
  {individualId: '5568348ce4b09e15082e8a25', name: 'A.T. Kearney'},
  {individualId: '55589ac4e4b0466addf4ca9d', name: 'Bain'},
  {individualId: '555aa7fee4b0c32ce08a3ca7', name: 'Baring'},
  {individualId: '554b14c9e4b001afe0ef94d3', name: 'BCG'},
  {individualId: '556836cee4b09e15082e8c14', name: 'Blackpeak'},
  {individualId: '555ab2c9e4b03ef10c96bfd0', name: 'Dymon'},
  {individualId: '555ab383e4b03ef10c96c30c', name: 'Fidelity'},
  {individualId: '555ad21fe4b08787329b13a3', name: 'Frost & Sullivan'},
  {individualId: '555ad45ae4b08787329b17e5', name: 'Janchor'},
  {individualId: '555ad7d1e4b08787329b1ef3', name: 'Karst Peak'},
  {individualId: '555ad81de4b08787329b1f6e', name: 'KKR'},
  {individualId: '555ad4e7e4b08787329b18d6', name: 'L.E.K.'},
  {individualId: '5459e6eae4b0da3dd71d143a', name: 'McKinsey'},
  {individualId: '555ad96ee4b08787329b216c', name: 'Mizuho Asia Partners'},
  {individualId: '555ada61e4b08787329b22d2', name: 'Mizuho Bank'},
  {individualId: '555adb27e4b03ef10c9732a1', name: 'Navis'},
  {individualId: '555adbc5e4b03ef10c9733b5', name: 'Northstar'},
  {individualId: '555ae6c3e4b03ef10c974d9b', name: 'Oasis'},
  {individualId: '555ae743e4b03ef10c974e92', name: 'OCP'},
  {individualId: '555ad64ee4b08787329b1c29', name: 'Oliver Wyman'},
  {individualId: '5558ac13e4b0466addf50d42', name: 'Parthenon / EY'},
  {individualId: '555ae79ce4b03ef10c974f4a', name: 'Platinum Equity'},
  {individualId: '55682da1e4b09e15082e85b7', name: 'PWC / Strategy&'},
  {individualId: '555ae810e4b03ef10c975057', name: 'Southern Capital'},
  {individualId: '555aedf0e4b0c32ce08aca6b', name: 'Tybourne'},
  {individualId: '555ad74ce4b08787329b1dee', name: 'Value Partners'},
  {individualId: '555aef7be4b0c32ce08acc1f', name: 'Wendel'},
  {individualId: '55a4d6b5e4b09de207d030ae', name: 'TESTING ACCOUNT'}
];


var listsRemaining = listIds.length, contactsRemaining = 0;

console.log('Today is ', new Date());


listIds.map(function (list) {
  var individualId = list.individualId, individualName = list.name;
  var start = 0, limit = 200;

  (function getPageOfItems(list, start, limit) {

    // page of individual clients
    var apiCall = 'https://api.relateiq.com/v2/lists/'+individualId+'/listitems?_start='+start+'&_limit='+limit;

    request({
      auth: {
        'user': bootstrap.relateIQ_APIKEY,
        'pass': bootstrap.relateIQ_APISECRET
      },
      uri: apiCall

    }, function (error, response, body) {
      var data = JSON.parse(response.body);

      var numResults = data.objects.length;

      if (numResults === 0) {
        if (--listsRemaining === 0) {
          // console.log('really exiting', new Date());
          // process.exit();
          deleteOutdatedClients();
        }
      } else {

        var items = data.objects;

        for (var i = items.length - 1; i >= 0; i--) {
          var client = new Client({
            syncDate: new Date(),
            objectId: items[i].id,
            listId: items[i].listId,
            version: items[i].version,
            createdDate: items[i].createdDate,
            modifiedDate: items[i].modifiedDate,
            name: items[i].name,
            contacts: items[i].contactIds,
            fieldValues: items[i].fieldValues
          });

          clientsInDB.objectIdList.push(items[i].id);

          var upsertData = client.toObject();
          delete upsertData._id;
          upsertData._id = upsertData.objectId; // force _id = relatedIQ's contact's id

          Client.findOneAndUpdate({objectId: items[i].id}, upsertData, {upsert: true}, function (err, item) {
            if (err) return console.error(err);

            clientsInDB.synced++;
            // console.dir(item);
          });
        };


        start += numResults;
        console.log('synced', start, 'results for', individualName);
        getPageOfItems(list, start, limit);
      }
    });

  })(list, start, limit);

});


// function saveBulk(items) {
//   var toInsert = [];
//   for (var i = items.length - 1; i >= 0; i--) {
//     var client = {
//       syncDate: new Date(),
//       objectId: items[i].id,
//       listId: items[i].listId,
//       version: items[i].version,
//       createdDate: items[i].createdDate,
//       modifiedDate: items[i].modifiedDate,
//       name: items[i].name,
//       contacts: items[i].contactIds,
//       fieldValues: items[i].fieldValues
//     };

//     toInsert.push(client);

//     clientsInDB.objectIdList.push(items[i].id);
//   };

//   console.log('inserting', toInsert.length, 'items');
//   Client.collection.insert(toInsert, {w: 1}, function(err, result) {
//     if (err) console.log('bulk insert error', err);
//     // else console.log('bulk insert result', result);
//   });
// }


function deleteOutdatedClients() {
  // Get list of objectIds from Contacts,
  console.log('safeguarding', clientsInDB.objectIdList.length, 'clients');

  // Delete those NOT on that list
  Contact.collection.remove({objectId: {$nin: clientsInDB.objectIdList}}, function (err, result) {
    if (err) {
      console.log('smart delete failed', err);
    } else {
      console.log('all other clients deleted');
    }
    console.log('... done', new Date());
    process.exit();
  });
}


// // How to call populate
// Client
//   .find()
//   .populate('contacts')
//   .exec(function (err, clients) {
//     clients.forEach(function (client) {
//       console.log(client);
//     });
//   });
