const express = require('express');
const router = express.Router();
const userController = require('../controller/user');
const {signUpValidation} = require('../helpers/validation');
// register
router.post('/register', signUpValidation, userController.register)

module.exports =  router;