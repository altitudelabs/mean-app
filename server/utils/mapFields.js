var _ = require('lodash');

var bootstrap = require('./bootstrap');

var Account = bootstrap.Account;
var Partner = bootstrap.Partner;
var Client = bootstrap.Client;

var AccountMeta = bootstrap.AccountMeta;
var PartnerMeta = bootstrap.PartnerMeta;
var ClientMeta = bootstrap.ClientMeta;

var fieldNames = {
  "AccountMeta": {
    "done": false,
    "parsed": 0,
    "fields": []
  },
  "PartnerMeta": {
    "done": false,
    "parsed": 0,
    "fields": []
  },
  "ClientMeta": {
    "done": false,
    "parsed": 0,
    "fields": []
  }
};

function getIdValueByKey(data, key) {
    var found = null;

    for (var i = 0; i < data.length; i++) {
        var element = data[i];

        if (element.id === key) {
           found = element;
       }
    }

    return found;
}

// Special case for Account Type (e.g. Bank, Private Equity, etc)
var accountTypes = [
  {
      "display" : "Bank",
      "id" : "7"
  },
  {
      "display" : "Consulting",
      "id" : "0"
  },
  {
      "display" : "Corporate",
      "id" : "4"
  },
  {
      "display" : "SME / Start-up / Entrepreneur",
      "id" : "6"
  },
  {
      "display" : "Hedge Fund",
      "id" : "2"
  },
  {
      "display" : "Mutual Fund",
      "id" : "3"
  },
  {
      "display" : "Private Equity",
      "id" : "1"
  }
];
var accountStatuses = [
  {
      "display" : "Lead",
      "id" : "0"
  },
  {
      "display" : "Qualified",
      "id" : "1"
  },
  {
      "display" : "Negotiation",
      "id" : "2"
  },
  {
      "display" : "Verbal Commitment",
      "id" : "3"
  },
  {
      "display" : "Signed Contract",
      "id" : "4"
  },
  {
      "display" : "Revisit Later",
      "id" : "5"
  },
  {
      "display" : "Rejected",
      "id" : "6"
  }
];
var accountPricingTypes = [
    {
        "display" : "Pay-As-You-Go",
        "id" : "0"
    },
    {
        "display" : "Prepaid Package",
        "id" : "1"
    },
    {
        "display" : "Subscription",
        "id" : "2"
    }
];


/*
Map columns
1. save field names/types from meta tables
2. update new fields data into Client, Partner
*/
function mapFields() {

  AccountMeta.findOne({}, 'listType title fields syncDate', function (err, data) {
    if (err) {
      console.log('Cannot find AccountMeta', err);
      process.exit(1);
    }

    fieldNames.AccountMeta.fields = data.fields;

    // Find all account
    Account.find({}, function (err, accounts) {

      if (err) {

        console.log('Cannot find Account', err);
        process.exit(1);

      } else {

        // for each client,
        for (var i = 0, len = accounts.length; i < len; i++) {

          // get all the fieldValue's keys
          var keys = _.keys(accounts[i].fieldValues);

          // we now pair up the column name from meta data with the value in the client data,
          // as a parsed key value pair.
          var parsedKeyValues = {};
          for (var p = 0, length = keys.length; p < length; p++) {

            // using key, find each column name
            var column = _.findWhere(fieldNames.AccountMeta.fields, { 'id': keys[p].toString() });
            var columnName = column.name.replace('.', '_');

            var value;
            if (columnName === 'Type') {
              value = _.result(_.find(accountTypes, function(item) {
                return item.id === accounts[i].fieldValues[keys[p]][0].raw;
              }), 'display');

            } else if (columnName === 'Status') {
              value = _.result(_.find(accountStatuses, function(item) {
                return item.id === accounts[i].fieldValues[keys[p]][0].raw;
              }), 'display');

            } else if (columnName === 'Pricing Type') {
              value = _.result(_.find(accountPricingTypes, function(item) {
                return item.id === accounts[i].fieldValues[keys[p]][0].raw;
              }), 'display');

            } else {
              value = accounts[i].fieldValues[keys[p]][0].raw;
            }

            parsedKeyValues[columnName] = value;
          }


          // now we save the parsedKeyvalues back to client
          var updated = _.extend(accounts[i], {parsed: parsedKeyValues});

          updated.save(function (err, result) {
            if (err) { console.error(err) }
            else {
              // console.log('AccountMeta parsed: ', result);
              fieldNames.AccountMeta.parsed++;

              if (fieldNames.AccountMeta.parsed === accounts.length) {
                fieldNames.AccountMeta.done = true;
                console.log(fieldNames.AccountMeta.parsed, 'AccountMeta done parsing');

                if (fieldNames.AccountMeta.done &&
                    fieldNames.PartnerMeta.done &&
                    fieldNames.ClientMeta.done) {
                  console.log(new Date());

                  process.exit();
                }
              }
            }

          });
        }

      }

    });
  });


  PartnerMeta.findOne({listType: 'contact'}, 'listType title fields syncDate', function (err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    fieldNames.PartnerMeta.fields = data.fields;

    // Find all partners
    Partner.find({}, function (err, partners) {

      if (err) {

        console.log('Cannot find Partner', err);
        process.exit(1);

      } else {

        // for each partner,
        for (var i = 0, len = partners.length; i < len; i++) {

          // get all the fieldValue's keys
          var keys = _.keys(partners[i].fieldValues);

          // we now pair up the column name from meta data with the value in the partner data,
          // as a parsed key value pair.
          var parsedKeyValues = {};
          for (var p = 0, length = keys.length; p < length; p++) {

            // using key, find each column name
            var column = _.findWhere(fieldNames.PartnerMeta.fields, { 'id': keys[p].toString() });
            var columnName = column.name.replace('.', '_');
            var value = partners[i].fieldValues[keys[p]][0].raw;

            parsedKeyValues[columnName] = value;
          }

          // now we save the parsedKeyvalues back to partner
          var updated = _.extend(partners[i], {parsed: parsedKeyValues});

          updated.save(function (err, result) {
            if (err) { console.error(err) }
            else {
              fieldNames.PartnerMeta.parsed++;

              if (fieldNames.PartnerMeta.parsed === partners.length) {
                fieldNames.PartnerMeta.done = true;
                console.log(fieldNames.PartnerMeta.parsed, 'PartnerMeta done parsing');

                if (fieldNames.AccountMeta.done &&
                  fieldNames.PartnerMeta.done &&
                  fieldNames.ClientMeta.done) {
                  console.log(new Date());

                  process.exit();
                }
              }
            }

          });

        }

      }

    });
  });


  ClientMeta.findOne({listType: 'contact'}, 'listType title fields syncDate', function (err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    fieldNames.ClientMeta.fields = data.fields;

    // Find all clients
    Client.find({}, function (err, clients) {

      if (err) {

        console.log('Cannot find Client', err);
        process.exit(1);

      } else {

        // for each client,
        for (var i = 0, len = clients.length; i < len; i++) {

          // get all the fieldValue's keys
          var keys = _.keys(clients[i].fieldValues);

          // we now pair up the column name from meta data with the value in the client data,
          // as a parsed key value pair.
          var parsedKeyValues = {};
          for (var p = 0, length = keys.length; p < length; p++) {

            // using key, find each column name
            var column = _.findWhere(fieldNames.ClientMeta.fields, { 'id': keys[p].toString() });
            if (column) {
              var columnName = column.name.replace('.', '_');
              var value = clients[i].fieldValues[keys[p]][0].raw;

              parsedKeyValues[columnName] = value;
            }
          }

          // now we save the parsedKeyvalues back to client
          var updated = _.extend(clients[i], {parsed: parsedKeyValues});

          updated.save(function (err, result) {
            if (err) { console.error(err) }
            else {
              fieldNames.ClientMeta.parsed++;

              if (fieldNames.ClientMeta.parsed === clients.length) {
                fieldNames.ClientMeta.done = true;
                console.log(fieldNames.ClientMeta.parsed, 'ClientMeta done parsing');

                if (fieldNames.AccountMeta.done &&
                  fieldNames.PartnerMeta.done &&
                  fieldNames.ClientMeta.done) {
                  console.log(new Date());

                  process.exit();
                }
              }
            }

          });

        }

      }

    });

  });

}

console.log('Today is ', new Date());

mapFields();