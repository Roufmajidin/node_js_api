const express = require('express');
const router = express.Router();
const userController = require('../controller/user');
const {
    signUpValidation
} = require('../helpers/validation');
router.post('/login', userController.login)
// register
router.post('/register', signUpValidation, userController.register)
router.post('/mahasiswa', userController.addMahasiswa)
router.get('/mahasiswa/:id', userController.getMahasiwa)
module.exports = router;