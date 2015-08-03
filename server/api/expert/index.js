'use strict';

var express = require('express');
var controller = require('./expert.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);

router.get('/skip/:offset/limit/:limit/field/:field/sort/:sort', auth.isAuthenticated(), controller.page);
router.get('/count', auth.isAuthenticated(), controller.count);

router.get('/:id',
  auth.isAuthenticated(),
  controller.show);
router.get('/findExperts/:id/:name', auth.isAuthenticated(), controller.showByLinkedin);
router.get('/object/:objectId',
  auth.isAuthenticated(),
  controller.showByObjectId);
router.get('/name/:name', auth.isAuthenticated(), controller.showByName);
//router.get('/nameSearch/:name', auth.isAuthenticated(), controller.showByLikeName);
router.get('/search/:query/skip/:offset/field/:field/sort/:sort', auth.isAuthenticated(), controller.showByQuery);
router.get('/searchCount/:query', auth.isAuthenticated(), controller.countByQuery);

router.post('/', auth.isAuthenticated(), controller.create);

router.put('/:id', auth.isAuthenticated(), controller.update);
router.put('/object/:objectId', auth.isAuthenticated(), controller.putByObjectId);
router.put('/list/:listId/item/:itemId',
  auth.isAuthenticated(),
  controller.upsertExpert);

router.patch('/:id', auth.isAuthenticated(), controller.update);
router.patch('/object/:objectId', auth.isAuthenticated(), controller.patchByObjectId);

router.delete('/:id', auth.isAuthenticated(), controller.destroy);
router.delete('/object/:objectId', auth.isAuthenticated(), controller.deleteByObjectId);

module.exports = router;