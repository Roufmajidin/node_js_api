const express = require('express');
const {v4: uuidv4} = require('uuid');

const {PrismaClient} = require('@prisma/client');
const { json} = require('body-parser')
require('dotenv').config();
const prisma = new PrismaClient();
// TODO : getAll Movies
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const {parse} = require('dotenv');
const multer = require('multer');
const path = require('path')
dayjs.extend(utc);
dayjs.extend(timezone);

// TODO get movies dara
const getMovies = async (req, res) => {
    console.log("Server Time:", new Date().toString());

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
// TODO :: strage config
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

        // console.log((waktu))
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
// TODO : add event 
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
    generateroom,
    generatePayment, 
    getRoom,
    filteringroom,

}