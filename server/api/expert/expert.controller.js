'use strict';

var config = require('../../config/environment');
var request = require('request');
var _ = require('lodash');
var AWS = require('aws-sdk');
var credentials = new AWS.SharedIniFileCredentials({profile: 'lynk'});
    AWS.config.credentials = credentials;
    AWS.config.update({region: 'ap-southeast-1'});

var Model = require('./expert.model');
var Expert = Model.Expert;
var Partner = Model.Partner;
var PartnerMeta = Model.PartnerMeta;

var Project = require('../project/project.model');

var Contact = require('../contact/contact.model');
// Get list of experts
exports.index = function(req, res) {
  Expert
    .find({})
    .populate('contacts')
    .exec(function (err, experts) {
      if(err) { return handleError(res, err); }
      return res.json(200, experts);
    });
};

// Get page of experts (using skip and limit)
exports.page = function(req, res) {
  // console.log('page', req.params);
  var sorting = {};
  sorting[req.params.field] = req.params.sort;
  console.log('show', sorting);
  Expert.find({}).populate('contacts').sort(sorting).skip(req.params.offset).limit(req.params.limit)
    .exec(function(err, experts) {

    if(err) { return handleError(res, err); }
    return res.json(200, experts);
  });
};

// Get experts count
exports.count = function(req, res) {
  Expert.count({}, function (err, expertCount) {
    if(err) { return handleError(res, err); }
    return res.json(200, {count: expertCount});
  })
};

// Get experts count by according to query
exports.countByQuery = function(req, res) {
  var query = JSON.parse(req.params.query);
  var queryArr = [];
  if(query.name){ queryArr.push({name: { $regex : new RegExp(query.name, "i")}});}
  if(query.company){ queryArr.push({company: { $regex : new RegExp(query.company, "i")}});}
  if(query.location){ queryArr.push({location: { $regex : new RegExp(query.location, "i")}});}
  if(query.status){ queryArr.push({progressStatus: { $regex : new RegExp(query.status, "i")}});}
  if(query.queryModeOr) {
    Expert.count({ $or: queryArr }, function (err, expertCount) {
      if(err) { return handleError(res, err); }
      return res.json(200, {count: expertCount});
    });
  } else {
    Expert.count({ $and: queryArr }, function (err, expertCount) {
      if(err) { return handleError(res, err); }
      return res.json(200, {count: expertCount});
    });
  }
}

// Get a single expert (by Id)
exports.show = function(req, res) {
  console.log('show', req.params);
  Expert
    .findById(req.params.id)
    .populate('contacts')
    .exec(function (err, expert) {
      if(err) { return handleError(res, err); }
      if(!expert) { return res.json(404, { success: false, error: 'Expert not found'}); }
      return res.json(expert);
    });
};
// (by Name)
exports.showByName = function(req, res) {
  console.log('showByName', req.params);
  Expert
    .find({name: req.params.name})
    .populate('contacts')
    .exec(function (err, expert) {
      if(err) { return handleError(res, err); }
      if(!expert) { return res.json(404, { success: false, error: 'Expert not found by this name'}); }
      return res.json(expert);
    });
};

// (by Name (Likewise))
exports.showByLikeName = function(req, res) {
  console.log('showByLikeName', req.params);
  Expert
    .find({name: { $regex : new RegExp(req.params.name, "i")}})
    .populate('contacts')
    .exec(function (err, expert) {
      if(err) { return handleError(res, err); }
      if(!expert) { return res.json(404, { success: false, error: 'Expert not found by this name'}); }
      return res.json(expert);
    });
};

// (by ObjectId)
exports.showByObjectId = function(req, res) {
  console.log('showByObjectId', req.params);
  Expert
    .findOne({objectId: req.params.objectId})
    .populate('contacts')
    .exec(function (err, expert) {
      if(err) { return handleError(res, err); }
      if(!expert) { return res.json(404, { success: false, error: 'Expert not found by this Object ID'}); }
      return res.json(expert);
    });
};

// (by Query (Likewise search on all fields))
exports.showByQuery = function(req, res) {
  var query = JSON.parse(req.params.query);
  var sorting = {};
  sorting[req.params.field] = req.params.sort;
  console.log('showByQuery', query.name, query.company, query.location, query.status);
  var queryArr = [];
  if(query.name){ queryArr.push({name: { $regex : new RegExp(query.name, "i")}});}
  if(query.company){ queryArr.push({company: { $regex : new RegExp(query.company, "i")}});}
  if(query.location){ queryArr.push({location: { $regex : new RegExp(query.location, "i")}});}
  if(query.status){ queryArr.push({progressStatus: { $regex : new RegExp(query.status, "i")}});}
  if(query.queryModeOr) {
    Expert.find({ $or: queryArr }).populate('contacts').sort(sorting).limit(50).skip(req.params.offset)
      .exec(function(err, expert) {
      if(err) { return handleError(res, err); }
      if(!expert) { return res.json(404, { success: false, error: 'Expert not found by this query'}); }
      return res.json(expert);
    });
  } else {
    Expert.find({ $and: queryArr }).populate('contacts').limit(50).sort(sorting).skip(req.params.offset)
      .exec(function(err, expert) {
      if(err) { return handleError(res, err); }
      if(!expert) { return res.json(404, { success: false, error: 'Expert not found by this query'}); }
      return res.json(expert);
    });
  }
}

// (by Linkedin ID)
exports.showByLinkedin = function(req, res) {
  console.log('showByLinkedin', req.params.id, req.params.name);
  Expert.count({linkedinId: req.params.id}, function (err, expertCount) {
    if(err) { return handleError(res, err); }
    if(expertCount === 0){
      Expert
        .find({name: req.params.name})
        .populate('contacts')
        .exec(function (err, expert) {
          if(err) { return handleError(res, err); }
          if(!expert) { return res.json(404, { success: false, error: 'Expert not found by this name'}); }
          return res.json(expert);
        });
    } else {
      Expert
        .find({linkedinId: req.params.id})
        .populate('contacts')
        .exec(function (err, expert) {
          if(err) { return handleError(res, err); }
          if(!expert) { return res.json(404, { success: false, error: 'Expert not found by this linkedinId'}); }
          return res.json(expert);
        });
    }
  })

}

// Creates a new expert in the DB.
exports.create = function(req, res) {
  Expert.create(req.body, function(err, expert) {
    if(err) { return handleError(res, err); }
    return res.json(201, expert);
  });
};

// Updates an existing expert in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Expert.findById(req.params.id, function (err, expert) {
    if (err) { return handleError(res, err); }
    if(!expert) { return res.json(404, { success: false, error: 'Expert cannot be found'}); }
    var updated = _.merge(expert, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, expert);
    });
  });
};

// Updates an existing expert by objectId.
exports.putByObjectId = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Expert.update({ objectId: req.params.objectId}, req.body, function (err, numAffected, expert) {
    if (err) { return handleError(res, err); }
    if(!expert) { return res.json(404, { success: false, error: 'No expert found with this object Id' }); }
    return res.json(200, expert);
  });
};


// Patches an existing expert by objectId.
exports.patchByObjectId = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Expert.update({ objectId: req.params.objectId}, req.body, function (err, numAffected, expert) {
    if (err) { return handleError(res, err); }
    if(!expert) { return res.json(404, { success: false, error: 'No expert found with this object Id' }); }
    return res.json(200, expert);
  });
};


// Finds RelateIQ object, fetch using listId and itemId,
// ... and upserts an existing expert in the DB.
exports.upsertExpert = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  var listId = req.params.listId, itemId = req.params.itemId;
  // console.log('list', listId, 'item', itemId);

  var PartnerListID = '54871c35e4b01d5ccb3a9e23';
  var validLists = [PartnerListID];
  if (!_.include(validLists, listId)) {
    return res.json(404, { success: false, error: 'No list found with this listId'});
  }

  // 1. Fetch Partner from relateiq,
  var apiCall = 'https://api.relateiq.com/v2/lists/'+listId+'/listitems/'+itemId;
  request({
    auth: {
      'user': config.relateIQ.apiKey,
      'pass': config.relateIQ.apiSecret
    },
    uri: apiCall

  }, function (error, response, body) {

    if (error) { return handleError(res, error); }

    var data = JSON.parse(response.body);
    // console.log('data', data); console.log('data.fieldValues', data.fieldValues);

    if (!data.fieldValues) {
      return res.json(404, { success: false, error: 'No RelateIQ data found with this itemId'});
    }

    if (listId === PartnerListID) {

      var partner = new Partner({
          syncDate: Date.now(),
          objectId: data.id,
          listId: data.listId,
          version: data.version,
          createdDate: data.createdDate,
          modifiedDate: data.modifiedDate,
          name: data.name,
          accountId: data.accountId,
          contacts: data.contactIds,
          fieldValues: data.fieldValues,
          linkedItemsIds: data.linkedItemsIds
        });

      var upsertData = partner.toObject();
      delete upsertData._id;

      // 2. Sync meta data for Partner
      PartnerMeta.findOne({listType: 'contact'}, 'listType title fields syncDate', function (err, meta) {
        if (err) { return handleError(res, err); }

        // get all the fieldValue's keys
        var keys = _.keys(data.fieldValues);

        // we now pair up the column name from meta data with the value in the partner data,
        // as a parsed key value pair.
        var parsedKeyValues = {};
        for (var p = 0, length = keys.length; p < length; p++) {

          // using key, find each column name
          var column = _.findWhere(meta.fields, { 'id': keys[p].toString() });
          if (column && column.name) {
            var columnName = column.name.replace('.', '_');
            var value = partner.fieldValues[keys[p]][0].raw;

            parsedKeyValues[columnName] = value;
          }
        }

        // now we save the parsedKeyValues back to partner
        var updated = _.extend(upsertData, {parsed: parsedKeyValues});

        // console.log('updating', data.id);console.log('updated', updated);

        // 3. Upserts into Partner
        Partner.update({objectId: data.id}, updated, {upsert: true}, function (err, rowsAffected) {
          if (err) return handleError(res, err);
          // console.log('now updating expert ...');

          // 4. Finally, update Expert
          var upsertData = updateExpert(updated);

          Expert.findOneAndUpdate({objectId: updated.objectId}, upsertData, {upsert: true}, function (err, expert) {
            if (err) { return handleError(res, err); }
            if(!expert) { return res.json(404, { success: false, error: 'Expert did not create'}); }

            // SQS solution obsolete, REPLACED by populate!!!
            return res.json(200, expert);

            // // 5. Send expert id, objectId, contacts to Queue
            // var msgBody = {
            //   expert: { _id: expert._id, objectId: expert.objectId, contacts: expert.contacts }
            // };
            // var queueData = {
            //   MessageBody: JSON.stringify(msgBody),
            //   QueueUrl: config.aws.queueUrl
            // };
            // var sqs = new AWS.SQS();
            // // to queue: sync contact of this contactId from relateIQ to Lynk
            // sqs.sendMessage(queueData, function (err, data) {
            //   if (err) { return res.json(402, err) }
            //   else {
            //     console.log('expert updated!', expert.objectId);
            //     return res.json(200, expert);
            //   }
            // });

            // // 5. Parse contact info in real time
            // return updateContacts(res, expert);

          });

        });

      });

    } else {
      return res.json(404, 'List not found');
    }
  });

};


function updateExpert(partner) {

  // console.log('partner is', partner);
  var expertId = partner.objectId;

  var expert = new Expert({
      syncDate: Date.now(),

      // their original id in relateIQ as KnowledgePartner
      objectId: partner.objectId,

      // the list id of either Partner
      parentListId: partner.listId,

      // LinkedIn ID
      linkedinId: makeLinkedInID(partner),

      // the Partner id in lynk
      lynkPartnerId: partner._id,

      // the date this partner synced from RelateIQ to Lynk
      lynkPartnerSyncDate: partner.syncDate,

      // any contact Ids
      contacts: partner.contacts,

      name: makeName(partner),

      // system level expert info
      bio: makeBio(partner),
      notes: '',
      senior: makeSenior(partner),            // '', Standard, Senior
      title: makeTitle(partner),              // for Knowledge Partner imports
      startDate: makeStartDate(partner),
      company: makeCompany(partner),   // for Knowledge Partner imports
      summary: makeSummary(partner),        // for summary field

      hourlyRate: makeHourlyRate(partner),
      location: makeLocation(partner),

      progressStatus: makeProgressStatus(partner), // Linkedin Add Backs - Need to Contact, Attempted to Contact - No Reponse, Received Response - Need to Outreach, Spoke Over Phone, Reached Secretary/Staff via Phone - Could Not Contact/OOO, Signed Up via External Web Form - Need to Follow Up, Not Interested for now, Declined
      knowledgePartner: makeKnowledgePartner(partner),

      linkedProjectIds: [], // index (project's _id) for tracking which projects this expert belongs to

      relateIQ: makeRelateIQ(partner),

      acceptedTandC: makeTnC(partner),        // accepted terms and conditions
      isCompliant: makeCompliant(partner),     // is compliant

      compliance: makeCompliance(partner)
    });

  var upsertData = expert.toObject();
  delete upsertData._id;
  upsertData._id = partner.objectId;

  return upsertData;
}




// Deletes a expert from the DB.
exports.destroy = function(req, res) {
  Expert.findById(req.params.id, function (err, expert) {
    if(!expert) { return res.json(404, { success: false, error: 'No expert was found'}); }
    if(err) { return handleError(res, err); }

    expert.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};
// by List Id and Item Id
exports.deleteByObjectId = function(req, res) {
  console.log('objectId', req.params.objectId);
  Expert.findOne({objectId: req.params.objectId}, function (err, expert) {
    if(!expert) { return res.json(404, { success: false, error: 'No expert was found with this list Id and item Id'}); }
    if(err) { return handleError(res, err); }

    expert.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};



function handleError(res, err) {
  return res.send(500, err);
}






// functions for building expert data

function makeLocation(partner) {
  var text = '';
  if (partner.parsed) {
    text = partner.parsed['Location'];
  }
  return text;
}

function makeCompliance(partner) {
  var compliance = {};
  if (partner.parsed) {
    compliance.tncSignedDate = partner.parsed['T&C Signing Date'];
    compliance.tncVersionSigned = partner.parsed['T&C Version Signed'];
  }
  return compliance;
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

function makeSummary(partner) {
  var text = '';
  if (partner.parsed) {
    text = partner.parsed.Summary;
  }
  return text;
}

function makeBio(partner) {
  var text = '';
  if (partner.parsed && partner.parsed['Profile/ Bio']) {
    text = partner.parsed['Profile/ Bio'];
  }
  return text;
}

function makeStartDate(partner) {
  var startDate = '';
  if (partner.parsed && partner.parsed['Start Date']) {
    startDate = partner.parsed['Start Date'];
  }
  return startDate;
}

function makeLinkedInID(partner) {
  var linkedinId = '';
  if (partner.parsed && partner.parsed['LinkedIn ID']) {
    linkedinId = partner.parsed['LinkedIn ID'];
  }
  return linkedinId;
}

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
      default: break;
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


function checkStr(str) {
    return !(!str || 0 === str.length || /^\s*$/.test(str));
}