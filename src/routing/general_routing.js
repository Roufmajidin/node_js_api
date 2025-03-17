const express = require('express');
const router = express.Router();
const {
    PrismaClient
} = require('@prisma/client');

const prisma = new PrismaClient();
const multer = require('multer');
const path = require('path');


// controller 
const bookingController = require('../controller/booking_controller')
const movieController = require('../controller/movie_controller')
const userController = require('../controller/user')
const scanController = require('../controller/scanner_controller')
const userMiddleware = require('../middleware/user_middleware')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../storage/uploads/');
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({
    storage: storage
});
// TODO::protek di general url
// TODO : movie routing
router.get('/movies', movieController.getMovies)
router.get('/movies/:name', movieController.getMovieName)
router.get('/seats/:roomId/:waktuId', movieController.getSeat)
router.put('/nonaktif-studios', movieController.nonAktifstudios)
router.put('/saveEdit', upload.single('gambar'), movieController.editMovie)
router.post('/movieadd', upload.single('gambar'), movieController.addMovie)
router.post('/room/:idroom', movieController.filteringroom)
router.post('/event', movieController.addEvent)
router.get('/statistics/:id', movieController.getStatistic)

router.get('/getRoom', movieController.getRoom)
router.get('/generate/:id', movieController.generateseat)
router.post('/generate_room/', movieController.generateroom)
router.post('/payment/', movieController.generatePayment)

// user routing for bboking
router.get('/users', userController.getUsers)
router.get('/users/:id', userController.getUserId)
// add autentikasi jwt for booking
router.post('/postBooking', userMiddleware.authenticateToken, bookingController.booking)

// scanner
router.post('/postScan', scanController.scan)

module.exports = router;