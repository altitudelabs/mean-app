var _ = require('lodash');
var request = require('request');
var promisify = require("promisify-node");

var config = require('../environment');

var AWS = require('aws-sdk');
var credentials = new AWS.SharedIniFileCredentials({profile: 'lynk'});
    AWS.config.credentials = credentials;
    AWS.config.update({region: 'ap-southeast-1'});

var bootstrap = require('../bootstrap');

var Expert = bootstrap.Expert;
var Contact = bootstrap.Contact;
var Project = require('../../api/project/project.model');

var numMessages = 0;

function readQueue() {
  var params = {
    QueueUrl: config.aws.queueUrl
  };
  var sqs = new AWS.SQS();
  sqs.receiveMessage(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else {

      if (data.Messages) {
        numMessages = data.Messages.length;
        console.log(numMessages, 'Messages');
        for (var i = data.Messages.length - 1; i >= 0; i--) {
          var body = JSON.parse(data.Messages[i].Body);

          var expertObjectId = body.expert.objectId;
          var expertContactId = body.expert.contacts[0];
          var receiptHandle = data.Messages[i].ReceiptHandle;

          updateContact(expertContactId)
            .then(function() {
              updateExpert(expertObjectId);
            });

        };

      } else {
        console.log('no messages found');
        process.exit();
      }

    }
  });
}

function updateContactAsync(contactId, callback) {
  var apiCall = 'https://api.relateiq.com/v2/contacts/'+contactId;
  console.log(apiCall);
  request({
    auth: {
      'user': config.relateIQ.apiKey,
      'pass': config.relateIQ.apiSecret
    },
    uri: apiCall

  }, function (error, response, body) {

    if (error) {
      console.log('RelateIQ error', error);
      process.exit();

    } else {
      var data = JSON.parse(response.body);
      console.log('relateiq data', data);

      Contact.findOneAndUpdate({_id: contactId}, data, {upsert: true}, function(err, contact) {
        numMessages--;
        console.log(numMessages,'left, now callback');
        callback(err, contact);
      });
    }

  });
}

// function deleteMessageAsync(handle, callback) {
//   console.log('handle', handle);
//   var params = {
//     QueueUrl: config.aws.queueUrl,
//     ReceiptHandle: handle
//   };
//   sqs.deleteMessage(params, function(err, data) {
//     if (err) callback(err);
//     else {
//       console.log('message deleted');
//       callback(null, data);
//     }
//   });
// }

function updateExpertAsync(oid) {
  console.log('objectId', oid);

  Expert.findOne({objectId: oid}, function (err, expert) {
    var replace = {
      objectId: expert.objectId,

      isCompliant: expert.isCompliant,
      acceptedTandC: expert.acceptedTandC,
      relateIQ: expert.relateIQ,
      knowledgePartner: expert.knowledgePartner,
      summary: expert.summary,
      company: expert.company,
      title: expert.title,
      senior: expert.senior,
      contacts: expert.contacts,
      location: expert.location
    };

    // Now need to update all projects with expert
    Project.find({'experts.objectId': expert.objectId}).exec(function (err, projects) {
      if (err) {
        console.log('error in project querying for expert with objectId', err);
        process.exit(1);
      }

      var projectCount = projects.length;
      if (projectCount === 0) {
        // early exit
        console.log('no projects found with this expert');
        process.exit();
      }

      // map for all projects with expert found
      projects.map(function (project) {

        // which expert within project are we updating
        var oldExpertIndex = _.findKey(project.experts, { objectId: expert.objectId });
        project.experts[oldExpertIndex] = _.extend(project.experts[oldExpertIndex], replace);
        project = project.toObject();

        // do the deed
        Project.update({_id: project._id}, project, function (err, numAffected, project) {
          if (err) {
            console.log('project failed to update', err);
            process.exit(1);
          }

          projectCount--;
          // console.log('count', projectCount);
          // all async updates complete?
          if (projectCount === 0 && numMessages === 0) {
            console.log('all done with projects');
            process.exit();
          } else {
            console.log(numMessages, 'msgs left, continuing');
          }
        });

      });

    });
  });
}



var updateContact = promisify(updateContactAsync);
var updateExpert = promisify(updateExpertAsync);
// var deleteMessage = promisify(deleteMessageAsync);

console.log('Today is ', new Date());
readQueue();

