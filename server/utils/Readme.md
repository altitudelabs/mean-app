The 'utils' folder contain a tool to sync data from RelateIQ into a MongoDB instance.


Setup:

In bootstrap.js, ensure RelateIQ API Key and Secret is correct

exports.relateIQ_APIKEY
exports.relateIQ_APISECRET


** NOTE: be sure to run all 3 steps to ensure data correctness

Download & sync List data from RelateIQ and the field definitions (Partners, PartnerMetas)

`node syncLists.js`



Synchronize account list (client account/company list with the contact Ids)

`node syncAccounts.js`



Synchronize static info (e.g. list of Industries, Countries)

`node syncStatics.js`



Synchronize contact info (e.g. email, phone number)

`node syncContacts.js`



Synchronize client metadata for map fields

`node syncClientMeta.js`



Map & parse meta field definitions into List data

`node mapFields.js`



Merge Partners into Experts list

`node mergeExperts.js`



Sync Clients from relateIQ to mongo

`node syncClients.js`




At this point, all data in your MongoDB should be up-to-date.

