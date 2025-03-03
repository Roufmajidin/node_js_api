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
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../storage/uploads/');
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });
// TODO : movie routing
router.get('/movies', movieController.getMovies)
router.get('/movies/:name', movieController.getMovieName)
router.get('/seats/:roomId/:waktuId', movieController.getSeat)
router.put('/nonaktif-studios', movieController.nonAktifstudios)
router.put('/saveEdit', upload.single('gambar'), movieController.editMovie)
router.post('/movieadd', upload.single('gambar'), movieController.addMovie)
router.post('/room/:idroom', movieController.filteringroom)
router.post('/event', movieController.addEvent)


router.get('/getRoom', movieController.getRoom)
router.get('/generate/:id', movieController.generateseat)
router.post('/generate_room/', movieController.generateroom)
router.post('/payment/', movieController.generatePayment)

// user routing for bboking
router.get('/users', userController.getUsers)
router.get('/users/:id', userController.getUserId)
router.post('/postBooking', bookingController.booking)

// scanner
router.post('/postScan', scanController.scan)
router.get("/create", async (req, res) => {
    try {
        // const id = Math.floor(Math.random() * 1000000);
        // const room = await prisma.room.create({
        //     data: {
        //         id: id,
        //         name: "Studio 1",
        //         total_seat: 63, // 7 row x 9 seat
        //     },
        // });

        await controller.generateseat(id);

        // const movie = await prisma.movie.create({
        //     data: {
        //         genre: "Action",
        //         judul: "Hallo world",
        //         durasi: "160 Menit",
        //         actor_u: "bj, bi b dev",
        //         gambar: "/as/as/jpg",
        //         tahun: "2017",
        //         sinopsis: "test sinopsisi",
        //         showTime: new Date(),
        //     },
        // });

        // const waktu = await prisma.waktu.create({
        //     data: {
        //         time: new Date(),
        //         movie_id: movie.id,
        //         room_id: id,
        //     },
        // });

        // // 5️⃣ Tambah Dummy User
        // const user = await prisma.user.create({
        //     data: {
        //         name: "M",
        //         email: "m@mail.com",
        //         password: "12345678",
        //     },
        // });

        // // 6️⃣ Tambah Dummy Booking (Seat A1)
        // const seat = await prisma.seat.findFirst({
        //     where: {
        //         room_id: id,
        //         row: "A",
        //         number: 2
        //     },
        // });

        // if (seat) {
        //     await prisma.booking.create({
        //         data: {
        //             user_id: user.id,
        //             seat_id: seat.id,
        //             method_payment: "Credit Card",
        //             qr_code: "qrcode123",
        //             booking_date: new Date(),
        //             waktu_id: waktu.id,
        //         },
        //     });
        // }

        res.json({
            message: "Dummy data created successfully!"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to create dummy data"
        });
    }
});

module.exports = router;