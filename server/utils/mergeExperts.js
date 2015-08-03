var _ = require('lodash');
var mongoose = require('mongoose')
var bootstrap = require('./bootstrap');

var PartnerMeta = bootstrap.PartnerMeta;
var Partner = bootstrap.Partner;
var Expert = bootstrap.Expert;

var partnersInDB = {
  synced: 0,
  done: false,
  _idList: []
};


function makeName (partner) {
  if (partner.name)
    return partner.name.trim().replace(/\s+/g, ' ');
  else
    return '';
}

function makeKnowledgePartner (partner) {
  var text = '';
  if (partner.parsed) {
    var status = partner.parsed['Type'];
    switch (status) {
      case '0': text = 'Lead'; break;
      case '1': text = 'Knowledge Partner'; break;
      case '2': text = 'Client Contact'; break;
      default: text = 'Lead'; break;
    }
  }

  return text;
}

function makeProgressStatus (partner) {
  if (partner.parsed) {
    var status = partner.parsed['Contact Status'];

    switch (status) {
      case '0': status = 'Not Contacted'; break;
      case '1': status = 'Attempted to Contact via Linkedin - No Response'; break;
      case '2': status = 'Attempted to Contact via Phone - No Response'; break;
      case '3': status = 'Attempted to Contact via Email - No Response'; break;
      case '4': status = 'Attempted All Contact - No Response'; break;

      case '5': status = 'Received Response - Need to Outreach'; break;
      case '6': status = 'Contacted - Need T&C and Compliance Training'; break;
      case '7': status = 'Contacted - Need T&C, Completed Compliance Training'; break;
      case '8': status = 'Contacted - Received T&C, Completed Compliance Training'; break;
      case '9': status = 'Contacted - Received T&C, Need Compliance Training'; break;

      case '10': status = 'Reached Secretary/Staff via Phone - Could Not Contact/OOO'; break;
      case '11': status = 'Signed Up via External Web Form - Need to Follow Up'; break;
      case '12': status = 'Not Interested for now'; break;
      case '13': status = 'Declined'; break;

      // status = 'Linkedin Add Backs - Need to Contact'; break;
      // status = 'Attempted to Contact - No Response'; break;
      // status = 'Spoke Over Phone'; break;
      // case 'Received Response - Need to Outreach': break;
      default:
        break;
    };
  }

  return status;
}

function makeSenior (partner) {
  var senior = '';
  if (partner.parsed) {
    if (partner.parsed['Senior KP?'] === '0') {
      senior = 'Senior';
    } else if (partner.parsed['Senior KP?'] === '1') {
      senior = 'Standard';
    }
  }

  return senior;
}

function makeTitle (partner) {
  if (partner.parsed) {
    return partner.parsed['Position'];
  } else {
    return '';
  }
}

function makeCompany (partner) {
  if (partner.parsed) {
    return partner.parsed['Company Name'];
  } else {
    return '';
  }
}

function makeTnC(partner) {
  var state = false;
  if (partner.parsed) {
    var status = partner.parsed['Contact Status'];
    switch (status) {
      case 'Contacted - Received T&C, Completed Compliance Training':
      case 'Contacted - Received T&C, Need Compliance Training':
        state = true;
        break;
      default:
        break;
    };
  }

  return state;
}

function makeCompliant(partner) {
  var state = false;
  if (partner.parsed) {
    var status = partner.parsed['Contact Status'];
    switch (status) {
      case 'Contacted - Need T&C, Completed Compliance Training':
      case 'Contacted - Received T&C, Completed Compliance Training':
        state = true;
        break;
      default:
        break;
    };
  }

  return state;
}

function makeCompliance(partner) {
  var compliance = {};
  if (partner.parsed) {
    compliance.tncSignedDate = partner.parsed['T&C Signing Date'];
    compliance.tncVersionSigned = partner.parsed['T&C Version Signed'];
  }
  return compliance;
}

function makeLinkedInID(partner) {
  var linkedinId = '';
  if (partner.parsed && partner.parsed['LinkedIn ID']) {
    linkedinId = partner.parsed['LinkedIn ID'];
  }
  return linkedinId;
}

function makeStartDate(partner) {
  var startDate;
  if (partner.parsed && partner.parsed['Start Date']) {
    startDate = partner.parsed['Start Date'];
  }
  return startDate;
}

function makeBio(partner) {
  var text = '';
  if (partner.parsed && partner.parsed['Profile/ Bio']) {
    text = partner.parsed['Profile/ Bio'];
  }
  return text;
}

function makeRelateIQ(partner) {
  // for keeping a copy so expert can prepopulate (Company, Country, History, Experience) in add bio
  var relateIQ = {};
  if (partner.parsed) {
    if (partner.parsed['Company Name']) {
      relateIQ.company = partner.parsed['Company Name'];
    }
    if (partner.parsed['Country Coverage']) {
      relateIQ.country = 'c' + partner.parsed['Country Coverage'];
    }
    if (partner.parsed['Employment History']) {
      relateIQ.history = partner.parsed['Employment History'];
    }
    if (partner.parsed['Relevant Experience']) {
      relateIQ.experience = partner.parsed['Relevant Experience'];
    }
  }
  return relateIQ;
}


function makeHourlyRate(partner) {
  var text = '';
  if (partner.parsed) {
    text = partner.parsed['KP Hourly Rate'];
  }
  return text;
}

function makeLocation(partner) {
  var text = '';
  if (partner.parsed) {
    text = partner.parsed['Location'];
  }
  return text;
}

function makeSummary(partner) {
  var text = '';
  if (partner.parsed) {
    text = partner.parsed.Summary;
  }
  return text;
}


function mergePartners () {

  // Loop through current Partners collection
  Partner.find({}, function (err, partners) {

    if (err) {

      console.log('Cannot find Partners', err);
      process.exit(1);

    } else {

      console.log('Found ', partners.length, ' Partners ...');

      for (var i = partners.length - 1; i >= 0; i--) {

        partnersInDB._idList.push(mongoose.Types.ObjectId(partners[i].objectId));
        // console.log(partners[i]);

        var expert = new Expert({
            syncDate: Date.now(),

            // their original id in relateIQ as KnowledgePartner or LinkedinKP (aka itemId)
            objectId: partners[i].objectId,

            // the list id of either Partner
            parentListId: partners[i].listId,

            // linkedin ID
            linkedinId: makeLinkedInID(partners[i]),

            // the Partner id in lynk
            lynkPartnerId: partners[i]._id,

            // the date this partner synced from RelateIQ to Lynk
            lynkPartnerSyncDate: partners[i].syncDate,

            // any contact Ids
            contacts: partners[i].contacts,

            name: makeName(partners[i]),

            // system level expert info
            bio: makeBio(partners[i]),
            notes: '',
            senior: makeSenior(partners[i]),            // '', Standard, Senior
            title: makeTitle(partners[i]),              // for Knowledge Partner imports
            startDate: makeStartDate(partners[i]),
            company: makeCompany(partners[i]),   // for Knowledge Partner imports
            summary: makeSummary(partners[i]),        // for LinkedInKP add-backs OR if summary field is

            hourlyRate: makeHourlyRate(partners[i]),
            location: makeLocation(partners[i]),

            progressStatus: makeProgressStatus(partners[i]),
            knowledgePartner: makeKnowledgePartner(partners[i]),

            linkedProjectIds: [], // index (project's _id) for tracking which projects this expert belongs to

            relateIQ: makeRelateIQ(partners[i]), // for keeping a copy so expert can prepopulate (Company, Country, History, Experience) in add bio

            acceptedTandC: makeTnC(partners[i]),        // accepted terms and conditions
            isCompliant: makeCompliant(partners[i]),     // is compliant

            compliance: makeCompliance(partners[i])
          });

        var upsertData = expert.toObject();
        delete upsertData._id;
        upsertData._id = upsertData.objectId; // force _id = relatedIQ's contact's id

        // console.log(upsertData);

        Expert.update({_id: partners[i].objectId}, upsertData, {upsert: true}, function (err, item) {

          if (err) {

            console.log('Failed to update', err);
            process.exit(1);

          } else {

            partnersInDB.synced++;
            if (partnersInDB.synced === partners.length) {
              partnersInDB.done = true;

              console.log('Merged ', partners.length, ' Partners as Experts');

              // now delete any expert not in Partner (RelateIQ)
              deleteOutdatedExperts();
            }
          }

        });

      };
    }

  });

}


function deleteOutdatedExperts() {
  // Get list of objectIds from Partner,
  console.log('safeguarding', partnersInDB._idList.length, 'experts');
  // Delete those NOT on that list
  Expert.collection.remove({_id: {$nin: partnersInDB._idList}}, function (err, numAffected) {
    if (err) {
      console.log('smart delete failed', err);
    } else {
      console.log(numAffected, 'experts deleted');
    }
    console.log('... done', new Date());
    process.exit();
  });
}



// Merge
console.log('---------------');
console.log('Today is ', new Date());

mergePartners();

