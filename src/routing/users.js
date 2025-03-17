const express = require('express');
const router = express.Router();
const userController = require('../controller/user');
const userMiddleware = require('../middleware/user_middleware')


const {
    signUpValidation
} = require('../helpers/validation');
// mula mula cek dulu ke enpoint protect untuk cek token
router.get('/protected', userMiddleware.authenticateToken, userController.protected)
router.post('/login', userController.login)
// register
router.post('/register', signUpValidation, userController.register)
router.post('/mahasiswa', userController.addMahasiswa)
router.get('/mahasiswa/:id', userController.getMahasiwa)

module.exports = router;