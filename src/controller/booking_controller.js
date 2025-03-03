const express = require('express');
const {v4: uuidv4} = require('uuid');

const { PrismaClient} = require('@prisma/client');
const { json} = require('body-parser')
require('dotenv').config();
const prisma = new PrismaClient();
const timezone = require('dayjs/plugin/timezone');
const crypto = require('crypto')
const QRCode = require('qrcode')
const io = require("./sokcer_controller");
const {encrypt, decrypt}= require('../utils/funcionality')
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');

dayjs.extend(utc);
dayjs.extend(timezone);

// TODO :  booking
const booking = async (req, res) => {

    const data = req.body;
    // console.log(data)
    const unId = uuidv4()
    try {
        const requestedSeats = data.data.map(seat => ({
            seatId: String(seat.seatId),
            waktuId: String(seat.waktuId),
        }));
        const allBookings = await prisma.booking.findMany();
        const bookedSeats = allBookings.flatMap(booking => {
            try {
                return booking.data ? JSON.parse(booking.data).map(seat => ({
                    seatId: seat.seatId,
                    waktuId: seat.waktuId
                })) : [];
            } catch (error) {
                console.error("Error parsing booking data:", booking.data, error);
                return [];
            }
        });

        // Debugging log
        console.log("Requested Seats:", requestedSeats);
        console.log("Booked Seats:", bookedSeats);

        const alreadyBookedSeats = [];
        const availableSeats = [];

        const seatDetail = await prisma.seat.findMany();
        requestedSeats.forEach(reqSeat => {
            const isBooked = bookedSeats.some(bookedSeat =>
                reqSeat.seatId === bookedSeat.seatId && reqSeat.waktuId === bookedSeat.waktuId
            );

            // const waktuDetail = await prisma.waktu.findMany();
            if (isBooked) {
                alreadyBookedSeats.push({
                    reqSeat,
                    "data": seatDetail.find(s => s.id === reqSeat.seatId),
                });
            } else {
                availableSeats.push({
                    reqSeat,
                    "data": seatDetail.find(s => s.id === reqSeat.seatId),
                    // "waktu": waktuDetail
                });
            }
        });

        if (alreadyBookedSeats.length > 0) {
            return res.status(400).json({
                error: "Some seats are already booked!",
                bookedSeats: alreadyBookedSeats,
                availableSeats: availableSeats,
            });
        }
        console.log(requestedSeats)
        // Jika semua kursi tersedia, lanjutkan booking
        // return res.json({
        //     success: true,
        //     message: "All seats are available!",
        //     availableSeats
        // });


        const dataToPost = {
            id: unId,
            user_id: data.userId,
            data: JSON.stringify(data.data),
            booking_date: dayjs().tz("Asia/Jakarta").toISOString(),
            expired: 0,
            mp_id: data.mp_id
            // qr: code
        }
        console.log("data:", dataToPost);
        // TODO : enkrip data
        const a = await prisma.booking.findMany();

        // // const qrCode = await QRCode.toDataURL(enkripData)
        const enkripData = encrypt(JSON.stringify(dataToPost.id))
        // 
        const dataIds = data.data.map(data => data.waktuId)
        const b = await prisma.waktu.findMany({
            where: {
                id: {
                    in: dataIds
                }

            },
            include: {
                movies: true
            }
        })

        const db = await prisma.booking.create({
            data: {

                ...dataToPost,
                qr_code: enkripData
                // "created_at" : new Date(),
                // "updated_at" : new Date(),
            }
        })
        const hargaM = b.reduce((total, item) => {
            return total + (item.movies?.harga || 0);
        }, 0);
        const dbOrder = await prisma.order.create({
            data: {
                id: uuidv4(),
                booking_id: dataToPost.id,
                link_pay: "",
                user_id: data.userId,
                status: 0,
                total_price: hargaM * data.data.length,

            }
        })

        // console.log(res)
        // console.log('ds', db)
        //TODO trigger fungsion pada soket 
        io.emit("newBooking", {
            movieName: data.movieName,
            seats: data.data.map(seat => seat.seatId),
            user: data.userId,
            bookingId: db.id,
            createdAt: dataToPost.booking_date
        });

        return res.json({
            status: 200,
            data: {
                db
                // movie: harga
                // harga : harga
            }
        })
    } catch (error) {
        return res.json({
            status: error.status,
            data: [],
            error: error.message
        })

    }

}




module.exports = {
    booking,

}