'use strict';

var express = require('express');
var controller = require('./project.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/',
  auth.isAuthenticated(),
  controller.index);
router.get('/count', auth.isAuthenticated(), controller.count);
router.get('/countToday', auth.isAuthenticated(), controller.countToday);
router.get('/:id',
  auth.isAuthenticated(),
  controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.patch('/:id', auth.isAuthenticated(), controller.patch);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;