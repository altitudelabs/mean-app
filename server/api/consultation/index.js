'use strict';

var express = require('express');
var controller = require('./consultation.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.get('/object/:objectId', auth.isAuthenticated(), controller.showByObjectId);

router.post('/', auth.isAuthenticated(), controller.create);
router.post('/object/:objectId', auth.isAuthenticated(), controller.upsert);

router.put('/:id', auth.isAuthenticated(), controller.update);
router.put('/object/:objectId', auth.isAuthenticated(), controller.putByObjectId);

router.patch('/:id', auth.isAuthenticated(), controller.update);
router.patch('/object/:objectId', auth.isAuthenticated(), controller.patchByObjectId);

router.delete('/:id', auth.isAuthenticated(), controller.destroy);
router.delete('/object/:objectId', auth.isAuthenticated(), controller.deleteByObjectId);

module.exports = router;