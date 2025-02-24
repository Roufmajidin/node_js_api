const express = require('express');
const {
    PrismaClient
} = require('@prisma/client');
const {
    json
} = require('body-parser')
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
    const data = req.body
    try {

        // console.log("Request Body:", data);
        // console.log("Uploaded File:", req.file);

        // const gambar = req.body.gambar ? `/storage/uploads/${req.body.gambar}` : null;
        const sm = await prisma.movie.create({
            data: {
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
            id: parseInt(aa.id)
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
            harga:parseInt( aa.harga),

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
                room_id: parseInt(req.params.id),
                row,
                number,
            });
        }
    }
    await prisma.seat.createMany({
        data: seat
    });

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

        if (isNaN(idroom) || !waktu) {
            return res.status(400).json({
                error: "ID room harus angka dan waktu tidak boleh kosong"
            });
        }

        const roomId = parseInt(idroom, 10);

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

    try {
        const {
            roomId,
            movieId,
            time
        } = req.body;
        let formattedTime = time.trim().replace(" ", "T") + ":00.000Z";

        const d = await prisma.waktu.create({
            data: {
                room_id: parseInt(roomId),
                movie_id: movieId,
                time: formattedTime,
                status: 1
            }
        })
        // console.log(d)


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
        const seat = await prisma.seat.findMany({
            where: {
                room_id: parseInt(roomId)
            },
            include: {
                Booking: {
                    where: {
                        waktu_id: parseInt(waktuId)
                    }
                }
            }
        })
        console.log(seat)
        return res.json({
            data: {
                total_seat: seat.length,
                seat: seat,
            }
        })

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
                id: parseInt(id)
            }
        })
        const bookings = await prisma.booking.findMany({
            where: {
                user_id: parseInt(id)
            },
            // include: {
            //     waktu :true
            // }
        })
        // TODO : maping data [], biar bisa di assign ke in: [] di prisma, exp -> id : [1,4]
        // todo : buat nyari data sih, misalnya where id tapi ga tunggal, WHERE id in list data itu gitu
        const waktuIds = bookings.map(b => b.waktu_id);
        const seatsId = bookings.map(s => s.seat_id)
        const listWaktu = await prisma.booking.findMany({
            where: {
                waktu_id: {
                    in: waktuIds
                }
            }
        });
        const seat = await prisma.seat.findMany({
            where: {
                id: {
                    in: seatsId
                }
            }
        })
        const waktu = await prisma.waktu.findMany({
            where: {
                id: {
                    in: waktuIds
                }
            }
        })
        const roomId = waktu.map((r => r.room_id));

        const movieId = waktu.map(w => w.movie_id)
        const room = await prisma.room.findMany({
            where: {
                id: {
                    in: roomId
                }
            }
        })
        const movie = await prisma.movie.findMany({
            where: {
                id: {
                    in: movieId
                }
            }
        })
        // TODO : mapping data antar tabel brooo
        const bookingwithwaktu = bookings.map(n => {
            const tayang = waktu.find(t => t.id === n.waktu_id) || null
            const t = {
                tayang: tayang,
                studio: room.find(r => r.id === tayang.room_id) || null
            }
            const movieData = movie.find(m => m.id === tayang.movie_id) || null
            return {
                ...n,
                seat: seat.find(s => s.id === n.seat_id) || null,
                waktu: t,
                movie: movieData
            }
        })
        // TODO : grup where tanggal created seat, misalnya user bisa ambil dua kursi/seat dalam memilih movie
        const groupedBookings = bookingwithwaktu.reduce((acc, booking) => {
            const date = dayjs(booking.booking_date).format("YYYY-MM-DD");

            if (!acc[date]) {
                acc[date] = [];
            }

            acc[date].push(booking);

            return acc;
        }, {});
        //TODO sort grupbooking berdasarkan waktu
        const groupedData = Object.keys(groupedBookings)
            .sort((a, b) => new Date(a) - new Date(b))
            .map(date => ({
                booking_date: date,
                bookings: groupedBookings[date]
            }));

        const data = {
            user: user,
            data_booking: groupedData
        }
        // console.log(seat)
        console.log(data)
        return res.json({
            status: 200,
            data: data
        })
    } catch (error) {
        console.error("Error fetching user data:", error);
        return res.json({
            status: 404,
        })

    }


}
// TODO :  booking
const booking = async (req, res) => {
  
    const data = req.body;
    // console.log(data)

    try {
        const dataToPost = {
            user_id: parseInt(data.userId),
            seat_id:parseInt( data.seatId),
            booking_date: new Date(),
            waktu_id: parseInt(data.waktuId),
            expired: 0,
            method_payment: "Qris"
            // qr: code
        }
        console.log("Data sebelum enkripsi:", dataToPost);
        // TODO : enkrip data
        const enkripData = encrypt(JSON.stringify(dataToPost))
        // const qrCode = await QRCode.toDataURL(enkripData)
        const qrCode = await QRCode.toString(enkripData, { type: 'terminal' });

        // console.log("✅ QR Code berhasil dibuat:", qrCode);

        const db = await prisma.booking.create({
            data: {
                ...dataToPost,
                qr_code: enkripData
            }
        })
        console.log(data)

        return res.json({
            status: 200,
            data: {
                db
            }
        })
    } catch (error) {
        return res.json({
            status: error.status,
            data: []
        })

    }

}
// TODO ::etc function
const algorithm = 'aes-256-cbc'
const secretKey = crypto.randomBytes(32)
const iv = crypto.randomBytes(16)
function encrypt(text) {
    try {
        let cipher = crypto.createCipheriv(algorithm, secretKey, iv);
        let encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
        let encryptedText = iv.toString('hex') + ':' + encrypted.toString('hex');
        console.log("🔒 Encrypted Data:", encryptedText);
        return encryptedText;
    } catch (error) {
        console.error("❌ Error pada encrypt():", error);
        return null;
    }
}

function decrypt(text) {
    let parts = text.split(':');
    let iv = Buffer.from(parts[0], 'hex');
    let encryptedText = Buffer.from(parts[1], 'hex');
    let decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
    let decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decrypted.toString();
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

}