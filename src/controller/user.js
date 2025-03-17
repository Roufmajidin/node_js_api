// const express = require('express');
const {
    geti
} = require('../models/user_model');
const {
    validationResult
} = require('express-validator');
const bcrypt = require('bcryptjs');
const db = require('../config/config');
const {
    PrismaClient
} = require('@prisma/client');
const {
    json
} = require('body-parser');
const prisma = new PrismaClient();
const {
    v4: uuidv4
} = require('uuid');
const jwt = require('jsonwebtoken')

// register user
const register = (req, res) => {
    const error = validationResult(req);
    const userId = uuidv4();

    // const {
    //     data
    // } = req.body;
    // if (error) {
    //     console.log(error)
    // }

    if (!error.isEmpty()) {
        return res.status(400).json({
            "error": error.array(),
            // "data": 
        })
    }
    // console.log(req.body.name);
    db.query(
        `SELECT * FROM user WHERE LOWER(email) = LOWER(${db.escape(req.body.email)})`,
        (err, result) => {

            if (result && result.length) {
                return res.status(409).send({
                    msg: "user already registered",

                })
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).send({
                            msg: err
                        })
                    } else {
                        // return res.status(500).send({
                        //     msg:err
                        // })
                        // console.log(hash)
                        db.query(

                            `INSERT INTO user (id, name, email, password) VALUES (${db.escape(userId)},${db.escape(req.body.name)}, ${db.escape(req.body.email)}, ${db.escape(hash)})`,
                            (err, result) => {
                                console.log(result)
                                if (err) {
                                    return res.status(400).send({
                                        msg: err
                                    })
                                } else {
                                    return res.status(500).send({
                                        msg: "user has ben ready!"
                                    })

                                }
                            }
                        )

                    }

                })
            }
        }
    )
}
const addMahasiswa = async (req, res, next) => {
    const {
        user_id,
        semester,
        nim,
        tanggal_lahir,
        tempat_lahir,
        no_hp
    } = req.body;
    console.log(req.body)
    try {


        if (!user_id || !semester || !nim || !tanggal_lahir || !tempat_lahir || !no_hp) {
            return res.status(400).json({
                error: 'Semua data harus diisi'
            });
        }

        // mode 2 bre
        const [user, exitingdataMahasiswa] = await Promise.all([
            prisma.user.findUnique({
                where: {
                    id: user_id
                }
            }),
            prisma.mahasiswa.findUnique({
                where: {
                    user_id
                }
            })
        ]);
        if (!user) {
            return res.status(404).json({
                error: "Data mahasiswa id tersebut tidak ditemukan"
            })
        }
        if (exitingdataMahasiswa) {
            return res.status(400).json({
                error: "data mahasiswa sudah ada"
            })
        }

        const mahasiswa = await prisma.mahasiswa.create({
            data: {
                user_id,
                semester,
                tanggal_lahir,
                no_hp,
                tempat_lahir,
                nim
            }
        });
        res.status(200).json(mahasiswa)



    } catch (error) {
        console.error('Error adding mahasiswa:', error);
        res.status(500).json({
            error: 'Terjadi kesalahan pada server'
        });

    }




}
const getMahasiwa = async (req, res) => {

    const {
        id
    } = req.params;
    // console.log(id)
    const user = await prisma.user.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            mahasiswa: true
        }
    });
    if (!user) {
        return res.status(404).json({
            message: "user tidak ditemukan"
        })
    }
    return res.json({
        data: user,
    })
}

const getUsers = async (req, res) => {

    let {
        page,
        limit
    } = req.query
    try {
        const totalUser = await prisma.user.count();
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 5;
        const skip = (page - 1) * limit
        const user = await prisma.user.findMany({
            skip: skip,
            take: limit
        });
        console.log(user)
        return res.json({
            current_page: page,
            total_pages: Math.ceil(totalUser / limit),
            status: 200,
            data: user
        })
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

        // console.log('Final Result:', resultBooking);
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
// login 
const login = async (req, res) => {
    const {
        email,
        password
    } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        })
        if (!user) {
            return res.status(400).json({
                error: "invalid email or password"
            })
        }
        // cek
        const match = await bcrypt.compare(password, user.password)
        if (!match) {
            return res.satus(400).json({
                errror: "invalid email or password"
            })
        }
        // generate token
        const token = jwt.sign({
            userId: user.id
        }, process.env.SECRET_KEY, {
            expiresIn: "1h"
        })
        // update lstlogin  
        const updateLastLogin = await prisma.user.update({
            where: {
                email
            },
            data: {
                last_login: new Date()
            }
        })

        res.json({
            token,
            user: updateLastLogin
        })

    } catch (error) {
        res.status(500).json({
            message: "ada keasalahan"
        })

    }


}
const protected = (req, res)=>{
    return res.json({
        message:"protected data",
        user : req.user
    })

}
module.exports = {
    register,
    addMahasiswa,
    getMahasiwa,
    getUsers,
    getUserId,
    login, 
    protected

}


// mode 1 bree
// const a = await prisma.user.findUnique({
//     where: {
//         id: user_id
//     }
// });
// const b = await prisma.mahasiswa.findUnique({
//     where: {
//         user_id
//     }
// })
// if (!a) {
//     return res.status(404).json({
//         error: 'data mahasiswa id tersebut tidak ditemukan'
//     })
// }
// if (b) {
//     return res.status(400).json({
//         error: 'data mahasiswa sudah ada'
//     })
// }

// save data bre
// console.log(a); 