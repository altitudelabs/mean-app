var request = require('request'),
  _ = require('lodash');

// request.debug = true;

var bootstrap = require('./bootstrap');


var IndustryStatic = bootstrap.IndustryStatic;
var RegionStatic = bootstrap.RegionStatic;

var staticFields = {
  "Countries": {
    synced: 0,
    done: false
  },
  "IndustryStatic": {
    synced: 0,
    done: false
  },
  "RegionStatic": {
    synced: 0,
    done: false
  }
};

console.log('Today is ', new Date());

console.log('Fetching Knowledge Partners field definitions ...');

var apiCall = 'https://api.relateiq.com/v2/lists?_start=0&_limit=200';

request({
  auth: {
    'user': bootstrap.relateIQ_APIKEY,
    'pass': bootstrap.relateIQ_APISECRET
  },
  uri: apiCall

}, function (error, response, body) {

  var data = JSON.parse(response.body);
  var dataFields = [];

  for (var i = 0, len = data.objects.length; i < len; i++) {

    if (data.objects[i].id === '54871c35e4b01d5ccb3a9e23') {
      // Found Knowledge Partners list
      console.log('Found Knowledge Partners ...');
      dataFields = data.objects[i].fields;

    }
  }


  // Loop over dataFields to get what we want:
  // - industry
  // - country coverage (aka regions)
  // - region coverage (also put in regions)

  console.log('Looking through ' + dataFields.length  + ' data fields ...');

  for (var j = 0, length = dataFields.length; j < length; j++) {

    if (dataFields[j].id === '108') {
      // Region = Region Coverage

      /*
      [ { id: '0', display: 'Global' },
      { id: '1', display: 'ASEAN' },
      { id: '2', display: 'Asia Pacific (APAC)' },
      { id: '3', display: 'Europe' },
      { id: '4', display: 'North America' },
      { id: '5', display: 'Latin America' },
      { id: '6', display: 'Middle East' },
      { id: '7', display: 'Africa' } ]
      */

      var numRegions = dataFields[j].listOptions.length;
      console.log('Found Regions with ', numRegions, ' options');

      for (var p = 0; p < numRegions; p++) {

        var regionStatic = new RegionStatic({
          syncDate: Date.now(),
          objectId: 'r' + dataFields[j].listOptions[p].id, // need to diff between region and country
          display: dataFields[j].listOptions[p].display
        });

        var upsertData = regionStatic.toObject();
        delete upsertData._id;

        RegionStatic.update({objectId: 'r' + dataFields[j].listOptions[p].id}, upsertData, {upsert: true}, function (err, item) {
          if (err) return console.error(err);

          staticFields.RegionStatic.synced++;
          if (staticFields.RegionStatic.synced === numRegions) {
            console.log("RegionStatic (Regions) synced", numRegions);
            staticFields.RegionStatic.done = true;

            // Are we done?
            if (staticFields.Countries.done && staticFields.IndustryStatic.done && staticFields.RegionStatic.done) {
              console.log("... done", new Date());
              process.exit();
            }

          }
        });

      }


    } else if (dataFields[j].id === '112') {
      // Region = Country Coverage
      var numCountries = dataFields[j].listOptions.length;
      console.log('Found Countries with ', numCountries, ' options');

      for (var p = 0; p < numCountries; p++) {

        if (dataFields[j].listOptions[p].display === "**REGIONWIDE**") continue;
        if (dataFields[j].listOptions[p].display === "Others (please specify)") continue;

        var country = new RegionStatic({
          syncDate: Date.now(),
          objectId: 'c' + dataFields[j].listOptions[p].id, // need to diff between region and country
          display: dataFields[j].listOptions[p].display
        });

        var upsertData = country.toObject();
        delete upsertData._id;

        RegionStatic.update({objectId: 'c' + dataFields[j].listOptions[p].id}, upsertData, {upsert: true}, function (err, item) {
          if (err) return console.error(err);

          staticFields.Countries.synced++;
          if (staticFields.Countries.synced === numCountries - 2) {
            console.log("RegionStatic (Countries) synced", numCountries);
            staticFields.Countries.done = true;

            // Are we done?
            if (staticFields.Countries.done && staticFields.IndustryStatic.done && staticFields.RegionStatic.done) {
              console.log("... done", new Date());
              process.exit();
            }

          }
        });

      }


    } else if (dataFields[j].id === '116') {
      // Industry
      var numIndustries = dataFields[j].listOptions.length;
      console.log('Found Industry with ', numIndustries, ' options');

      for (var p = 0; p < numIndustries; p++) {

        var industryStatic = new IndustryStatic({
          syncDate: Date.now(),
          objectId: dataFields[j].listOptions[p].id,
          display: dataFields[j].listOptions[p].display
        });

        var upsertData = industryStatic.toObject();
        delete upsertData._id;

        IndustryStatic.update({objectId: dataFields[j].listOptions[p].id}, upsertData, {upsert: true}, function (err, item) {
          if (err) return console.error(err);

          staticFields.IndustryStatic.synced++;
          if (staticFields.IndustryStatic.synced === numIndustries) {
            console.log("IndustryStatic synced", numIndustries);
            staticFields.IndustryStatic.done = true;

            // Are we done?
            if (staticFields.Countries.done && staticFields.IndustryStatic.done && staticFields.RegionStatic.done) {
              console.log("... done", new Date());
              process.exit();
            }

          }
        });
      }

    } else {
      // 100 is Topics?
      // console.log(dataFields[j].id, dataFields[j].listOptions);
      continue;

    }

  }

});

/*
Knowledge Partners 54871c35e4b01d5ccb3a9e23
Look for:
{
  "objects": [
        {
          "id": "54871c35e4b01d5ccb3a9e23",
          "title": "Knowledge Partners",
          "listType": "contact",
          "modifiedDate": 0,
          "fields": [
            {
              "id": "112",
              "name": "Country Coverage",
              "listOptions": [
                {
                    "id": "0",
                    "display": "**REGIONWIDE**"
                },
                {
                    "id": "1",
                    "display": "Algeria"
                },
              ],
            }
          ],
          ...
        },
        ...
  ]
}

*/
