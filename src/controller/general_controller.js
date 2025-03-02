const express = require('express');
const {
    v4: uuidv4
} = require('uuid');

const {
    PrismaClient
} = require('@prisma/client');
const {
    json
} = require('body-parser')
require('dotenv').config();
const prisma = new PrismaClient();
// TODO : getAll Movies
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const {
    parse
} = require('dotenv');
const multer = require('multer');
const path = require('path')
dayjs.extend(utc);
dayjs.extend(timezone);
const crypto = require('crypto')
const QRCode = require('qrcode')
const io = require("./sokcer_controller"); // Import Socket.io instance

const getMovies = async (req, res) => {
    console.log("Server Time:", new Date().toString());

    console.log('ok')
    try {
        const movies = await prisma.movie.findMany({
            include: {
                waktu: {
                    include: {
                        rooms: true
                    }
                }
            }
        });

        const formattedMovies = movies.map(movie => ({
            movies: movie,
            waktu: movie.waktu.map(waktuItem => ({
                id: waktuItem.id,
                // waktu: dayjs(waktuItem.time).format("YYYY-MM-DD HH:mm:ss"),
                // waktu:dayjs(waktuItem.time).tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
                waktu: waktuItem.time,
                raw_waktu: waktuItem.time,
                room_id: waktuItem.room_id,

                movie_id: waktuItem.movie_id,
                studio: waktuItem.rooms.name || "No Room",
                status: waktuItem.status,
            }))
        }));

        res.json(formattedMovies);
    } catch (error) {
        console.error(error);
        res.status(400).json({
            error: error.message
        });
    }

}
// strage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "storage/uploads/")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
})
const upload = multer({
    storage
})

// TODO AddMovie 
const addMovie = async (req, res) => {
    // console.log("gambar")
    const data = req.body;
    const uniqId = uuidv4();


    try {

        // console.log("Request Body:", data);
        // console.log("Uploaded File:", req.file);

        // const gambar = req.body.gambar ? `/storage/uploads/${req.body.gambar}` : null;
        const sm = await prisma.movie.create({
            data: {
                id: uniqId,
                judul: data.judul,
                genre: data.genre,
                durasi: parseInt(data.durasi),
                showTime: new Date(),
                actor_u: data.actor_u,
                gambar: req.file ? `/storage/uploads/${req.file.filename}` : null,
                sinopsis: data.sinopsis,
                harga: parseInt(data.harga),
                tahun: parseInt(data.tahun)

            }
        })
        console.log(sm)

        res.json({
            message: "Movie berhasil ditambahkan",
            // data: data
        })

    } catch (error) {
        res.json({
            error: error.message
        })

    }


}
// TODOD : Edit Movie
const editMovie = async (req, res) => {
    const {
        movie_name,
        idm,
        genre,
        studio,
        dimulai,
        durasi,
        tahun,
        gambar,
        harga,
        sinopsis,
        actor_u,
        status,
        selectedStudios,
    } = req.body;
    const aa = req.body;


    const updatedMov = await prisma.movie.updateMany({
        where: {
            id: aa.id
        },
        data: {
            genre: aa.genre,
            judul: aa.judul,
            // movie_name,
            durasi: parseInt(aa.durasi),
            showTime: new Date(),
            tahun: aa.tahun,
            actor_u: aa.actor_u,
            gambar: req.file ?
                `/storage/uploads/${req.file.filename}` : aa.gambarLama,

            sinopsis: aa.sinopsis,
            tahun: parseInt(aa.tahun),
            harga: parseInt(aa.harga),

        }
    })
    if (updatedMov.count === 0) {
        return res.status.json({
            status: "updated failed"
        })
    }
    // const studioIds = studio.map(s => s.id);
    // const existingRecords = await prisma.waktu.findMany({
    //     where: {
    //         id: {
    //             in: studio.map(s => s.id)
    //         }
    //     }
    // });
    // console.log("Data sebelum update:", existingRecords);
    // const a = await Promise.all(studio.map(async (s) => {
    //     const isSelected = selectedStudios.includes(s.id);

    //     const dataUpdated = {
    //         // status: 0
    //         movie_id: s.movie_id,
    //         room_id: s.room_id,
    //         time: new Date(s.waktu),
    //         status: isSelected === true ? 1 : 0


    //     }
    //     // if (isSelected && s.status === 0) {
    //     //     // Jika studio dipilih dan status sebelumnya 0, ubah ke 1
    //     //     dataUpdated.status = 1;
    //     // } else if (!isSelected && s.status === 1) {
    //     //     // Jika studio tidak dipilih dan status sebelumnya 1, ubah ke 0
    //     //     dataUpdated.status = 0;
    //     // }    

    //     console.log(`Updating Studio ID ${s.id} to Status:`, dataUpdated.status);

    //     return await prisma.waktu.updateMany({
    //         where: {
    //             id: s.id
    //         },
    //         data: dataUpdated
    //     });
    // }))

    // console.log(" data studio:", studio);
    // console.log(" data Ids:", studioIds);
    // console.log(" Data setelah update:", a);
    // console.log(a)
    return res.status(200).json({
        status: 200,
        message: "berhasil updated data",
        data: {
            movie: updatedMov,
            // jadwal_updated: a
        }
    })
}
// TODO : getMovie dan tampilkan list tanggal
const getMovieName = async (req, res) => {

    const {
        name
    } = req.params;
    try {

        const a = await prisma.movie.findFirst({
            where: {
                judul: name
            }
        });
        const waktu = await prisma.waktu.findMany({
            where: {
                movie_id: parseInt(a.id)
            }
        })

        console.log((waktu))
        res.json({
            data: {
                movie: a,
                waktu: waktu,

            }
        })

    } catch (error) {
        res.status(400).json({
            error: error
        })
    }

}
// ubah film nonaktif
const nonAktifstudios = async (req, res) => {
    const {
        ids
    } = req.body
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
            message: "ID tidak valid atau kosong"
        });
    }
    const studios = await prisma.waktu.findMany({
        where: {
            id: {
                in: ids
            }
        }
    });
    console.log("Data dari database:", studios);

    if (studios.length === 0) {
        return res.status(404).json({
            message: "Studio tidak ditemukan"
        });
    }

    const updatedStudios = await Promise.all(
        studios.map(async (studio) => {
            const newStatus = studio.status === 0 ? 1 : 0;
            console.log(`Mengupdate ID ${studio.id}: ${studio.status} → ${newStatus}`);

            return await prisma.waktu.update({
                where: {
                    id: studio.id
                },
                data: {
                    status: newStatus
                }
            });
        })
    );

    return res.json({
        message: "Studio berhasil dinonaktifkan",
        totalUpdated: updatedStudios.count
    });

}
const generateseat = async (req) => {
    const rows = ["A", "B", "C", "D", "E", "F", "G"]
    const seat = [];
    for (const row of rows) {
        for (let number = 1; number <= 9; number++) {
            seat.push({
                id: uuidv4(),
                room_id: req.params.id,
                row,
                number,
            });
        }
    }
    await prisma.seat.createMany({
        data: seat
    });

}
const generateroom = async (req) => {


    await prisma.room.create({
        data: {
            id: uuidv4(),
            name: req.body.name,
            total_seat: parseInt(req.body.total_seat)

        }
    });

}
const generatePayment = async (req, res) => {
    const data = {
        id: uuidv4(),
        name: req.body.name,
        description: req.body.description,
    }
    await prisma.method.create({
        data: data
    });
    return res.json({
        message: "Berhasil membuat data pembayaran",
        data: data
    })

}
// {
//     "data": {
//         "movie": {
//             "id": 2,
//             "genre": "Sci-Fi",
//             "judul": "Interstellar",
//             "durasi": "169",
//             "showTime": "2025-02-11T21:00:00.000Z",
//             "created_at": "2025-02-09T02:32:03.000Z",
//             "updated_at": "2025-02-09T02:32:03.000Z"
//         },
//         "waktu": [
//             {
//                 "id": 2,
//                 "time": "2025-02-01T15:30:00.226Z",
//                 "movie_id": 2,
//                 "room_id": 1,
//                 "created_at": "1900-01-27T00:00:00.000Z",
//                 "updated_at": "1900-01-22T00:00:00.000Z"
//             },
//             {
//                 "id": 4,
//                 "time": "2025-02-01T07:00:00.226Z",
//                 "movie_id": 2,
//                 "room_id": 1,
//                 "created_at": "1900-01-27T00:00:00.000Z",
//                 "updated_at": "1900-01-22T00:00:00.000Z"
//             }
//         ]
//     }
// }
// const filteringroom = async (req, res) => {
//     const {idroom} = req.params
//     const data = req.body.waktu;
//     const a = await prisma.waktu.findMany({
//         where: {
//             // room_id: parseInt(idroom),
//             time : data.waktu
//         }
//     });
//     console.log(data)
//     return res.json({
//         data : a

//     })
// }
// TODO : filtering waktu ketika akan dilakukan penambahan waktu pada jam penayangan film

const filteringroom = async (req, res) => {
    try {
        const {
            idroom
        } = req.params;
        const {
            waktu
        } = req.body;

        // if (isNaN(idroom) || !waktu) {
        //     return res.status(400).json({
        //         error: "ID room harus angka dan waktu tidak boleh kosong"
        //     });
        // }

        const roomId = idroom

        let formattedTime = waktu.trim().replace(" ", "T") + ":00.000Z";
        const newStartTime = new Date(formattedTime);

        if (isNaN(newStartTime.getTime())) {
            return res.status(400).json({
                error: "Format waktu tidak valid"
            });
        }

        const waktuList = await prisma.waktu.findMany({
            where: {
                room_id: roomId
            },
            include: {
                movies: {
                    select: {
                        durasi: true,
                        judul: true
                    }
                }
            }
        });

        const waktuListWithDurations = waktuList.map((waktuItem) => {
            const movieDuration = waktuItem.movies.durasi;
            const startTime = new Date(waktuItem.time);
            const endTime = new Date(startTime.getTime() + movieDuration * 60000);

            return {
                ...waktuItem,
                durasi: movieDuration,
                waktu_akhir: endTime.toISOString(),
                movieTitle: waktuItem.movies.judul
            };
        });

        for (const scheduled of waktuListWithDurations) {
            const scheduledStartTime = new Date(scheduled.time);
            const scheduledEndTime = new Date(scheduled.waktu_akhir);
            const movieDuration = scheduled.durasi;

            if (
                (newStartTime >= scheduledStartTime && newStartTime < scheduledEndTime) ||
                (newStartTime.getTime() + movieDuration * 60000 > scheduledStartTime && newStartTime.getTime() + movieDuration * 60000 <= scheduledEndTime)
            ) {
                return res.status(400).json({
                    status: `Waktu bertabrakan dengan jadwal yang sudah ada.`,
                    conflict: {
                        room_id: scheduled.room_id,
                        movie_title: scheduled.movieTitle,
                        existing_start_time: scheduled.time,
                        existing_end_time: scheduled.waktu_akhir
                    }
                });
            }
        }

        return res.json({
            data: waktuListWithDurations,
            input_body: formattedTime
        });

    } catch (error) {
        console.error("Error filtering room:", error);
        return res.status(500).json({
            error: "Terjadi kesalahan server"
        });
    }
};


//TODO :: get seat berdasarkan movie dan waktu terpilihh 
// misalnya film denan movie_id == xx dan waktu yang tertera pada movie tersebut 
// get seat where room_id dan waktu (time) oada tabel waktu
// 
const getRoom = async (req, res) => {
    const rooms = await prisma.room.findMany();
    const seats = await prisma.seat.findMany({
        select: {
            room_id: true
        },
        distinct: ['room_id']
    });

    const roomIdsWithSeats = seats.map(seat => seat.room_id);

    const roomsWithSeatStatus = rooms.map(room => ({
        ...room,
        can_generate_seat: !roomIdsWithSeats.includes(room.id)
    }));

    res.status(200).json(roomsWithSeatStatus);



}
// TODO:: add event 
const addEvent = async (req, res) => {
    console.log("req.body")
    console.log(req.body)

    try {
        const {
            roomId,
            movieId,
            time
        } = req.body;
        let formattedTime = time.trim().replace(" ", "T") + ":00.000Z";

        const d = await prisma.waktu.create({
            data: {
                id: uuidv4(),
                room_id: roomId,
                movie_id: movieId,
                time: formattedTime,
                status: 1
            }
        })


        return res.json({
            status: 'Berhasil menambahkan event',
            data: d
        })

    } catch (error) {
        return res.status(404).json({
            error: error
        })

    }
}
const getSeat = async (req, res) => {
    try {
        const {
            roomId,
            waktuId
        } = req.params;
        // 1. Ambil semua kursi yang tersedia berdasarkan roomId
        const seats = await prisma.seat.findMany({
            where: {
                room_id: roomId
            }
        });

        // 2. Ambil semua kursi yang sudah dibooking berdasarkan waktuId
        const bookedSeats = await prisma.booking.findMany({
            // where: {
            //     data: {
            //         path: '$[*].waktuId',
            //         equals: waktuId
            //     }
            // },
            select: {
                data: true
            }
        });

        // 3. Gunakan Prisma untuk langsung mengekstrak seatId yang dibooking
        const bookedSeatIds = bookedSeats
            .flatMap(booking => JSON.parse(booking.data))
            .filter(seat => seat.waktuId === waktuId)
            .map(seat => seat.seatId);

        // 4. Gabungkan hasilnya dengan menandai kursi yang sudah dibooking
        const seatsWithStatus = seats.map(seat => ({
            ...seat,
            isBooked: bookedSeatIds.includes(seat.id)
        }));

        return res.json({
            data: {
                roomId,
                waktuId,
                seat_status: seatsWithStatus
            }
        });

    } catch (error) {
        return res.status(404).json({
            error: error
        })

    }
}
//TODO :: get seat create/sstore seat
// misalnya movie xx {tanggal& waktu terpilih}
const storeSeat = (req, res) => {
    // terima body
    const {
        userId,
        seatId,
        bookingDate,
        waktuMovie
    } = req.body;

}
const getUsers = async (req, res) => {
    console.log("ok")


    try {
        const user = await prisma.user.findMany();
        console.log(user)
        return res.json({
            status: 200,
            data: user
        })
        user
    } catch (error) {
        console.error("Error fetching users:", error.message);

        return res.json({
            status: 404,
            // data : 
        })

    }
}

// TODO :: fetch booking by user Id, grup berdasarkan waktu booking,
// TODO : misalnya CO tanggal sekarang dan 2 kursi, 
// TODO : yaudah nanti formatnya "23-2-2025" : "booking [], 1 qr-code dsb, 
// TODO karna isi qrcode terdapat gruping (id masing-masing data) yaudah
// TODO ketika scan update by id masing-masing yang ada digruping data"
const getUserId = async (req, res) => {
    const {
        id
    } = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: id
            }
        })
        const bookings = await prisma.booking.findMany({
            where: {
                user_id: id
            },
            include: {
                order: true
            }
            // include: {
            //     waktu :true
            // }
        })


        const seatIds = bookings.flatMap(item => JSON.parse(item.data).map(data => data.seatId));
        const waktuIds = bookings.flatMap(item => JSON.parse(item.data).map(data => data.waktuId));

        const seats = await prisma.seat.findMany({
            where: {
                id: {
                    in: seatIds
                }
            }
        });
        const waktus = await prisma.waktu.findMany({
            where: {
                id: {
                    in: waktuIds
                }
            }
        });
        const movieIds = waktus.map(waktu => waktu.movie_id);
        const movies = await prisma.movie.findMany({
            where: {
                id: {
                    in: movieIds
                }
            }
        });
        const roomIds = waktus.map(waktu => waktu.room_id)

        const room = await prisma.room.findMany({
            where: {
                id: {
                    in: roomIds
                }
            }
        });
        const methods = await prisma.method.findMany();

        const resultBooking = bookings.map(item => {
            const parsedBookings = JSON.parse(item.data);

            return {
                ...item,
                method: methods.find(method => method.id === item.mp_id),
                bookings: parsedBookings.map(data => {
                    const seatData = seats.find(seat => seat.id === data.seatId);
                    const waktuData = waktus.find(waktu => waktu.id === data.waktuId);
                    const roomData = room.find(r => r.id === waktuData.room_id);
                    const movieData = waktuData ? movies.find(movie => movie.id === waktuData.movie_id) : null;
                    const roomDatas = roomData ? room.find(room => room.id === roomData.id) : null;

                    return seatData ? {
                            ...seatData,
                            waktu: waktuData ? {
                                ...waktuData,
                                movie: movieData,
                                room: roomDatas
                            } : null
                        } :
                        null;
                }).filter(Boolean)
            };
        });

        console.log('Final Result:', resultBooking);



        // console.log(seat)
        return res.json({
            status: 200,
            data: resultBooking
        })
    } catch (error) {
        console.error("Error fetching user data:", error);
        return res.status(404).json({
            status: 404,
        })

    }


}
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
        // console.log(requestedSeats)
        // // Jika semua kursi tersedia, lanjutkan booking
        // return res.json({
        //     success: true,
        //     message: "All seats are available!",
        //     availableSeats
        // });


        const dataToPost = {
            id: unId,
            user_id: data.userId,
            data: JSON.stringify(data.data),
            booking_date: dayjs().tz("Asia/Jakarta").toISOString(), // ✅ Format ISO-8601 WIB
            expired: 0,
            mp_id: data.mp_id
            // qr: code
        }
        console.log("data:", dataToPost);
        // TODO : enkrip data
        const a = await prisma.booking.findMany();

        // // const qrCode = await QRCode.toDataURL(enkripData)
        const enkripData = encrypt(JSON.stringify(dataToPost.id))

        const db = await prisma.booking.create({
            data: {

                ...dataToPost,
                qr_code: enkripData
                // "created_at" : new Date(),
                // "updated_at" : new Date(),
            }
        })
        const dbOrder = await prisma.order.create({
            data: {
                id: uuidv4(),
                booking_id: dataToPost.id,
                link_pay: "",
                user_id: data.userId,
                status: 0,
                total_price: 100000,

            }
        })

        // console.log(res)
        // console.log('ds', db)
        // trigger fungsion pada soket 
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
                where: { id: scanner },
                data: { expired: 1 } // Ubah status booking
            }),
            prisma.order.updateMany({
                where: { booking_id: scanner },
                data: { status: 1 } // Ubah status order terkait
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
// TODO ::etc function
const algorithm = process.env.ALGORITHM;
const secretKey = crypto.createHash('sha256').update(process.env.SECRET_KEY).digest();

function encrypt(text) {
    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
        const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);

        const encryptedText = iv.toString('hex') + ':' + encrypted.toString('hex');

        console.log("🔒 Encrypted Data:", encryptedText);
        return encryptedText;
    } catch (error) {
        console.error("❌ Error saat enkripsi:", error.message);
        return null;
    }
}

function decrypt(text) {
    try {
        const parts = text.split(':');
        if (parts.length !== 2) throw new Error("Format terenkripsi tidak valid!");

        const iv = Buffer.from(parts[0], 'hex');
        const encryptedText = Buffer.from(parts[1], 'hex');
        const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
        const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
        const jsonData = JSON.parse(decrypted.toString());

        console.log("Decrypted Data:", decrypted.toString());
        return jsonData;
    } catch (error) {
        console.error("Error saat dekripsi:", error.message);
        return null;
    }
}



module.exports = {

    getMovies,
    getMovieName,
    getSeat,
    generateseat,
    getRoom,
    nonAktifstudios,
    editMovie,
    addMovie,
    filteringroom,
    addEvent,
    getUsers,
    getUserId,
    booking,
    scan,
    generateroom,
    generatePayment

}