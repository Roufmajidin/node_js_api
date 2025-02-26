// const express = require('express');
const {geti} = require('../models/user_model');
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
const { v4: uuidv4 } = require('uuid');


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

    const {id} = req.params;
    // console.log(id)
    const user = await prisma.user.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            mahasiswa: true
        }
    });
    if(!user){
        return res.status(404).json({
            message : "user tidak ditemukan"
        })
    }
    return res.json({
        data: user,
    })




}
module.exports = {
    register,
    addMahasiswa,
    getMahasiwa

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