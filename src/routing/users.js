const express = require('express');
const router = express.Router();
const userController = require('../controller/user');
router.get('/users/:id/:name', userController.getAllUser)

module.exports =  router;