// server/api/item/index.js
'use strict';

var express = require('express');
var controller = require('./comment.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.post('/', auth.isAuthenticated(), auth.isAuthenticated(), controller.create);
router.delete('/:id', auth.isAuthenticated(), auth.isAuthenticated(), controller.destroy);

module.exports = router;