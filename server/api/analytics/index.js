'use strict';

var express = require('express');
var controller = require('./analytics.controller');

var router = express.Router();

///////////////////////////////// Global //////////////////////////////////////
router.get('/totalProjectsByGlobal',
  // auth.isAuthenticated(),
  controller.totalProjectsByGlobal);
router.get('/completedConsultationsByGlobal',
  // auth.isAuthenticated(),
  controller.completedConsultationsByGlobal);
router.get('/cancelledConsultationsByGlobal',
  // auth.isAuthenticated(),
  controller.cancelledConsultationsByGlobal);
router.get('/projectYieldByGlobal',
  // auth.isAuthenticated(),
  controller.projectYieldByGlobal);
router.get('/revenueByGlobal',
  // auth.isAuthenticated(),
  controller.revenueByGlobal);
router.get('/responseTimeByGlobal',
  // auth.isAuthenticated(),
  controller.responseTimeByGlobal);
router.get('/firstProfileSentByGlobal',
  // auth.isAuthenticated(),
  controller.firstProfileSentByGlobal);


//////////////////////////////////// Subpage ///////////////////////////////////////
router.get('/totalProjectsByAll',
  // auth.isAuthenticated(),
  controller.totalProjectsByAll);

router.get('/completedConsultationsByAll',
  // auth.isAuthenticated(),
  controller.completedConsultationsByAll);

router.get('/cancelledConsultationsByAll',
  // auth.isAuthenticated(),
  controller.cancelledConsultationsByAll);

router.get('/projectYieldByAll',
  // auth.isAuthenticated(),
  controller.projectYieldByAll);

router.get('/revenueByAll',
  // auth.isAuthenticated(),
  controller.revenueByAll);

router.get('/responseTimeByAll',
  // auth.isAuthenticated(),
  controller.responseTimeByAll);

router.get('/firstProfileSentByAll',
  // auth.isAuthenticated(),
  controller.firstProfileSentByAll);

router.get('/rankedAMs',
  // auth.isAuthenticated(),
  controller.rankedAMs);

router.get('/rankedResearchers',
  // auth.isAuthenticated(),
  controller.rankedResearchers);


//////////////////////////////// Client ///////////////////////////////////////
router.get('/totalProjectsByClientAccount/:listId',
  // auth.isAuthenticated(),
  controller.totalProjectsByClientAccount);
router.get('/totalConsultationsByClientAccount/:listId',
  // auth.isAuthenticated(),
  controller.totalConsultationsByClientAccount);
router.get('/totalRevenueByClientAccount/:listId',
  // auth.isAuthenticated(),
  controller.totalRevenueByClientAccount);
router.get('/lastActiveByClientAccount/:listId',
  // auth.isAuthenticated(),
  controller.lastActiveByClientAccount);
router.get('/top10ClientAccounts',
  // auth.isAuthenticated(),
  controller.top10ClientAccounts);

///////////////////////////////// Expert //////////////////////////////////////
router.get('/totalProjectsByExpert/:expertId',
  // auth.isAuthenticated(),
  controller.totalProjectsByExpert);
router.get('/totalConsultationsByExpert/:expertId',
  // auth.isAuthenticated(),
  controller.totalConsultationsByExpert);
router.get('/totalClientsByExpert/:expertId',
  // auth.isAuthenticated(),
  controller.totalClientsByExpert);
router.get('/totalFeesReceivedByExpert/:expertId',
  // auth.isAuthenticated(),
  controller.totalFeesReceivedByExpert);
router.get('/top10Experts',
  // auth.isAuthenticated(),
  controller.top10Experts);


module.exports = router;
