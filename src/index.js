require('dotenv').config();

const express = require('express');
const multer = require('multer');
const usersRoute = require('./routing/users');
const moviesRoute = require('./routing/general_routing');
const cors = require('cors');
require('./config/config.js');
const userMiddleware = require('./middleware/user_middleware');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');  
const socketIo = require("socket.io");
const { PrismaClient } = require("@prisma/client");
const { initializeSocket, getIo } = require("./controller/sokcer_controller.js"); 

const app = express();
const server = http.createServer(app);

const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

const uploadPath = path.join(__dirname, 'storage/uploads');
console.log('Serving static files from:', uploadPath);
app.use('/storage/uploads', express.static(uploadPath));

app.use('/api', usersRoute);
app.use('/movies', moviesRoute);

app.get('/test-image', (req, res) => {
    res.sendFile(path.join(__dirname, 'storage/uploads/1739579302543-nata-absen.png'));
});
// initial socket controller
initializeSocket(server);

async function watchBooking() {
    console.log("...");
    let lastBookingId = null;

    setInterval(async () => {
        try {
            const newBooking = await prisma.booking.findFirst({
                orderBy: { booking_date: "desc" },
            });

            if (newBooking && newBooking.id !== lastBookingId) {
                lastBookingId = newBooking.id;
                // panggil fungsi pd controller
                const io = getIo();
                io.emit("newBooking", {
                    id: newBooking.id,
                    user: newBooking.user_id,
                    booking_date: newBooking.booking_date,
                    message: "Booking baru telah dibuat!",
                });

                console.log("New booking detected:", newBooking);
            }
        } catch (error) {
            console.error("Error watching bookings:", error);
        }
    }, 3000);
}

watchBooking();


server.listen(4000, () => {
    console.log('Server is running on port 4000');
});
