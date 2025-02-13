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

dayjs.extend(utc);
dayjs.extend(timezone);

const getMovies = async (req, res) => {
    console.log('ok')
    try {

        const mov = await prisma.waktu.findMany({
            include: {
                movies: true,
                rooms: true
            }
        })
        // kelompokkin dulu lah
        const groupedMovies = mov.reduce((acc, item) => {
            const key = item.movies.judul;
            if (!acc[key]) {
                acc[key] = {
                    movies: item.movies,
                    waktu: []
                };
            }
            acc[key].waktu.push({
                id: item.id,
                waktu: dayjs.utc(item.time).tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
                room_id: item.room_id,
                movie_id: item.movie_id,
                studio: item.rooms.name,
                status: item.status,
            });

            return acc;
        }, {});
        const formattedMovies = Object.values(groupedMovies);
        res.json(formattedMovies);
    } catch (error) {
        console.log(error)
        res.status(400).json({
            error: error
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
        sinopsis,
        actor_u,
        status,
        selectedStudios,
    } = req.body
    const data = {
        id: parseInt(idm),
        movie_name,
        movie_name,
        tahun: tahun,
        sinopsis: sinopsis,
        durasi: durasi,
        gambar: gambar,
        genre: genre,
        studio: studio,
        actor_u: actor_u
    }
    const updatedMov = await prisma.movie.updateMany({
        where: {
            id: idm
        },
        data: {
            genre: genre,
            judul: movie_name,
            // movie_name,
            durasi: durasi,
            showTime: new Date(),
            tahun: tahun,
            actor_u: actor_u,
            gambar: gambar,
            sinopsis: sinopsis,
            tahun: tahun
            // studio: studio,

        }
    })
    if (updatedMov.count === 0) {
        return res.status.json({
            status: "updated failed"
        })
    }
    const studioIds = studio.map(s => s.id);
    const existingRecords = await prisma.waktu.findMany({
        where: {
            id: {
                in: studio.map(s => s.id)
            }
        }
    });
    console.log("Data sebelum update:", existingRecords);
    const a = await Promise.all(studio.map(async (s) => {
        const dataUpdated ={
            // status: 0
            movie_id: s.movie_id,
            room_id: s.room_id,
            time: new Date(s.waktu),
            status: selectedStudios.length > 0 ? (s.status === 0 ? 1 : 0) : s.status // Pastikan tetap Int


        }
        if (selectedStudios.length > 0) {
            dataUpdated.status = s.status === 0 ? 1 : 0;
        }
        return await prisma.waktu.updateMany({
            where: { id: s.id },
            data: dataUpdated
        });
    }))

    console.log(" data studio:", studio);
    console.log(" data Ids:", studioIds);
    console.log(" Data setelah update:", a);
    // console.log(a)
    return res.status(200).json({
        status:200,
        message: "berhasil updated data",
        data: {
            movie: updatedMov,
            jadwal_updated: a
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
    console.log("Data dari database:", studios); // Log hasil query

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
const generateseat = (req) => {
    const rows = ["A", "B", "C", "D", "E", "F", "G"]
    const seat = [];
    for (const row of rows) {
        for (let number = 1; number <= 9; number++) {
            seat.push({
                room_id: req,
                row,
                number,
            });
        }
    }
    return prisma.seat.createMany({
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
        can_generate_seat: !roomIdsWithSeats.includes(room.id) // true jika seat belum ada
    }));

    res.status(200).json(roomsWithSeatStatus);



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

module.exports = {

    getMovies,
    getMovieName,
    getSeat,
    generateseat,
    getRoom,
    nonAktifstudios,
    editMovie

}