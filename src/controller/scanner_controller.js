const express = require('express');
const {v4: uuidv4} = require('uuid');

const { PrismaClient} = require('@prisma/client');
const { json} = require('body-parser')
require('dotenv').config();
const prisma = new PrismaClient();
// TODO : getAll Movies
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const { parse} = require('dotenv');
const multer = require('multer');
const path = require('path')
dayjs.extend(utc);
dayjs.extend(timezone);
const crypto = require('crypto')
const io = require("./sokcer_controller");
const {decrypt}= require('../utils/funcionality')



const scan = async (req, res) => {
    const {
        data
    } = req.body;
    console.log("hallo")
    if (!data || typeof data !== 'string' || !data.includes(':')) {
        return res.status(400).json({
            status: "error",
            message: "Format data salah!"
        });
    }

    try {
        const scanner = decrypt(data);
        console.log("✅ Hasil decrypt:", scanner);
        const booking = await prisma.booking.findUnique({
            where: {
                id: scanner
            }
        })
        if (!booking) {
            return res.status(404).json({
                message: "Booking tidak ditemukan"
            });
        }
        const [updatedBooking, updatedOrders] = await prisma.$transaction([
            prisma.booking.update({
                where: {
                    id: scanner
                },
                data: {
                    expired: 1
                } // Ubah status booking
            }),
            prisma.order.updateMany({
                where: {
                    booking_id: scanner
                },
                data: {
                    status: 1
                }
                // TODO: // Ubah status order terkait
            })
        ]);
        return res.json({
            data: scanner,
            status: "success",
        });
    } catch (error) {
        console.error("❌ Error saat dekripsi:", error.message);
        return res.status(500).json({
            status: "error",
            message: "Gagal mendekripsi data!",
        });
    }
}




module.exports = {
    scan,

}