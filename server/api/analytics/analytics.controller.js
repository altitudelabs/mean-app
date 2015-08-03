'use strict';

var _ = require('lodash');

var Analytics = require('./analytics.model');

var Project = require('../project/project.model');
var Consultation = require('../consultation/consultation.model');

function handleError(res, err) {
  return res.send(500, err);
}


/////////////////////////////////  Dashboard Stats  /////////////////////////////////

exports.totalProjectsByGlobal = function(req, res) {
  // count all active projects
  Project
    .find({status: { $in: ['New', 'Active'] }, account: {$exists: true, $size: 1}})
    .select('name startDate')
    .exec(function (err, projects) {
      if(err) { return handleError(res, err); }
      return res.json(projects.length);
    });
};
exports.completedConsultationsByGlobal = function(req, res) {
  // count completed consultations in all active projects
  Consultation
    .find({})
    .select('name statusInProject completedDate project')
    .where('statusInProject').in(['completed', 'closed', 'paid'])
    .populate('project', 'status startDate')
    .exec(function (err, consultations) {
    if(err) { return handleError(res, err); }
    var consultations = _.filter(consultations, function(consultation) {
      return consultation.project.status === 'New' || consultation.project.status === 'Active'
    });
    return res.json(consultations.length);
  });
};
exports.cancelledConsultationsByGlobal = function(req, res) {
  // count cancelled consultations in all active projects
  Consultation
    .find({})
    .select('name statusInProject project')
    .where('statusInProject').in(['cancelled'])
    .populate('project', 'status')
    .exec(function (err, consultations) {

    if(err) { return handleError(res, err); }
    var consultations = _.filter(consultations, function(consultation) {
      return consultation.project.status === 'New' || consultation.project.status === 'Active'
    });
    return res.json(consultations.length);
  });
};
exports.projectYieldByGlobal = function(req, res) {
  // count average number of consultations per project, the company-wide average
  Project
    .find({status: { $in: ['New', 'Active'] }})
    .select('name consultations')
    .exec(function (err, projects) {

    if(err) { return handleError(res, err); }

    var runningTotal = 0;
    for (var i = projects.length - 1; i >= 0; i--) {
      runningTotal += projects[i].consultations.length;
    };
    var average = runningTotal / projects.length;
    return res.json(average);

  });
};
exports.revenueByGlobal = function(req, res) {

  return res.json('N/A');
};
exports.responseTimeByGlobal = function(req, res) {

  return res.json('N/A');
};
exports.firstProfileSentByGlobal = function(req, res) {
  // TEAM Average for (first expert sent to client - project start datetime) in hours
  Project
    .find({status: { $in: ['New', 'Active'] }})
    .select('name startDate projectSpecificExperts')
    .exec(function (err, projects) {
    if(err) { return handleError(res, err); }

    var today = new Date(); // for those projectSpecificExperts that do not have a sentDate yet
    var totalFirstProfileSentHours = 0;

    // loop through projects
    for (var i = projects.length - 1; i >= 0; i--) {

      var earliestDate = today;

      // if at least one expert was added
      if (projects[i].projectSpecificExperts) {
        // find earliest expert sent (min value of sentDate)
        for (var j = projects[i].projectSpecificExperts.length - 1; j >= 0; j--) {
          var tempDate = new Date(projects[i].projectSpecificExperts[j].sentDate);
          if (tempDate < earliestDate) {
            earliestDate = tempDate;
          }
        };
      }

      var hours = Math.floor((earliestDate - projects[i].startDate) / (1000*60*60));
      totalFirstProfileSentHours += hours;
    };

    var average = totalFirstProfileSentHours / projects.length;
    return res.json(totalFirstProfileSentHours);
  });
};


////////////////////////////// Subpage Stats ///////////////////////////////

exports.totalProjectsByAll = function(req, res) {
  Project
    .find({status: { $in: ['New', 'Active'] }, account: {$exists: true, $size: 1}})
    .populate('experts', 'name')
    .select('name startDate manager._id manager.name manager.role members._id members.name members.role experts clients._id clients.objectId clients.name clients.listId clients.parsed account._id account.objectId account.name')
    .exec(function (err, projects) {
      if(err) { return handleError(res, err); }
      return res.json(projects);
    });
};
exports.completedConsultationsByAll = function(req, res) {
  Consultation
    .find({})
    .select('name statusInProject completedDate project expert account._id account.name account.objectId')
    .where('statusInProject').in(['completed', 'closed', 'paid'])
    .populate('project project.clients', 'status startDate manager._id manager.name manager.role members._id members.name members.role clients.name clients.objectId clients.listId')
    .populate('expert', 'name objectId')
    .exec(function (err, consultations) {

    if(err) { return handleError(res, err); }
    var consultations = _.filter(consultations, function(consultation) {
      return consultation.project.status === 'New' || consultation.project.status === 'Active'
    });
    return res.json(consultations);
  });
};
exports.cancelledConsultationsByAll = function(req, res) {
  Consultation
    .find({})
    .select('name statusInProject completedDate project expert account_id account.name account.objectId')
    .where('statusInProject').in(['cancelled'])
    .populate('project project.clients', 'status startDate manager._id manager.name manager.role members._id members.name clients.name clients.objectId clients.listId')
    .populate('expert', 'name objectId')
    .exec(function (err, consultations) {

    if(err) { return handleError(res, err); }
    var consultations = _.filter(consultations, function(consultation) {
      return consultation.project.status === 'New' || consultation.project.status === 'Active'
    });
    return res.json(consultations);
  });
};
exports.projectYieldByAll = function(req, res) {
  // count team members average number of consultations per project
  Project
    .find({status: { $in: ['New', 'Active'] }})
    .populate('experts', 'name')
    .populate('consultations', 'name statusInProject completedDate')
    .select('name startDate consultations manager._id manager.name manager.role members._id members.name members.role experts clients._id clients.objectId clients.name clients.listId clients.parsed')
    .exec(function (err, projects) {

    if(err) { return handleError(res, err); }
    return res.json(projects);
  });
};
exports.revenueByAll = function(req, res) {
  return res.json('N/A');
};
exports.responseTimeByAll = function(req, res) {
  return res.json('N/A');
};
exports.firstProfileSentByAll = function(req, res) {
  // find all projects
  // include data to check projectSpecificExperts with statusInProject === 'sent'
  // include data on manager and member
  Project
    .find({status: { $in: ['New', 'Active'] }})
    .select('name manager._id manager.role manager.name members._id members.name startDate projectSpecificExperts.objectId projectSpecificExperts.statusInProject projectSpecificExperts.sentDate')
    .exec(function (err, projects) {

    if(err) { return handleError(res, err); }
    return res.json(projects);
  });
};
exports.rankedAMs = function(req, res) {
  // find all completed consultations of active projects
  // get project
  // count most frequent occurring AM
  Consultation
    .find({})
    .select('name statusInProject completedDate project')
    .where('statusInProject').in(['completed', 'closed', 'paid'])
    .populate('project', 'status startDate manager._id manager.name manager.role')
    .exec(function (err, consultations) {

    if(err) { return handleError(res, err); }
    var consultations = _.filter(consultations, function(consultation) {
      return consultation.project.status === 'New' || consultation.project.status === 'Active'
    });
    return res.json(consultations);
  });
};
exports.rankedResearchers = function(req, res) {
  // find all completed consultations of active projects
  // get project
  // count most frequent occurring researcher
  Consultation
    .find({})
    .select('name statusInProject completedDate project')
    .where('statusInProject').in(['completed', 'closed', 'paid'])
    .populate('project', 'status startDate members._id members.name')
    .exec(function (err, consultations) {

    if(err) { return handleError(res, err); }
    var consultations = _.filter(consultations, function(consultation) {
      return consultation.project.status === 'New' || consultation.project.status === 'Active'
    });
    return res.json(consultations);
  });
};

//////////////////////////////  Client Account ////////////////////////////////

exports.totalProjectsByClientAccount = function(req, res) {
  // find all projects
  // count most frequent occurring client account
  // select client account name and project count, sort by project count desc
  return res.json('N/A');
};
exports.totalConsultationsByClientAccount = function(req, res) {
  // find all consultation
  // count most frequent occurring client account
  // select client account name and consultation count, sort by consultation count desc
  return res.json('N/A');
};
exports.totalRevenueByClientAccount = function(req, res) {
  return res.json('N/A');
};
exports.lastActiveByClientAccount = function(req, res) {
  return res.json('N/A');
};
exports.top10ClientAccounts = function(req, res) {
  // find all completed consultations of active projects
  // get project
  // count most frequent occurring client
  Consultation
    .find({})
    .select('name statusInProject completedDate project clients._id clients.name account._id account.name account.objectId')
    .where('statusInProject').in(['completed', 'closed', 'paid'])
    .populate('project', 'status startDate')
    .exec(function (err, consultations) {

    if(err) { return handleError(res, err); }
    var consultations = _.filter(consultations, function(consultation) {
      return consultation.project.status === 'New' || consultation.project.status === 'Active'
    });
    return res.json(consultations);
  });
};

//////////////////////////////  Expert ////////////////////////////////////////

exports.totalProjectsByExpert = function(req, res) {
  // find all projects
  // count most frequently occurring expert
  // select expert name and project count, sort by project count desc
  return res.json('N/A');
};
exports.totalConsultationsByExpert = function(req, res) {
  // find all consultations
  // count most freq occurring expert
  // select expert name and consultation count, sort by consultation count desc
  return res.json('N/A');
};
exports.totalClientsByExpert = function(req, res) {
  // find all consultations
  // count most freq occuring expert
  // select expert name and client count, sort by client count desc
  return res.json('N/A');
};
exports.totalFeesReceivedByExpert = function(req, res) {
  return res.json('N/A');
};
exports.top10Experts = function(req, res) {
  // find all completed consultations of active projects
  // get project
  // count most frequent occurring expert
  Consultation
    .find({})
    .select('name statusInProject completedDate project expert')
    .where('statusInProject').in(['completed', 'closed', 'paid'])
    .populate('project', 'status startDate')
    .populate('expert', 'name objectId')
    .exec(function (err, consultations) {

    if(err) { return handleError(res, err); }
    var consultations = _.filter(consultations, function(consultation) {
      return consultation.project.status === 'New' || consultation.project.status === 'Active'
    });
    return res.json(consultations);
  });
};
