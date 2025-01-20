// const express = require('express');
const {
    geti
} = require('../models/user_model');
const {
    validationResult
} = require('express-validator');
const bcrypt = require('bcryptjs');
const db = require('../config/config');
// register user
const register = (req, res) => {
    const error = validationResult(req);
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
        `SELECT * FROM users WHERE LOWER(email) = LOWER(${db.escape(req.body.email)})`,
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
                    }
                     else {
                        // return res.status(500).send({
                        //     msg:err
                        // })
                        // console.log(hash)
                        db.query(

                            `INSERT INTO users (name, email, password) VALUES (${db.escape(req.body.name)}, ${db.escape(req.body.email)}, ${db.escape(hash)})`,
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
const getAllUser = (req, res, next) => {
    // const {
    //     id
    // } = req.params;
    const {
        name
    } = req.params;

    try {
        const users = geti();
        console.log(JSON.stringify(users))
        res.status(200).json({
            "success": true,
            "data": users,
            "req": name
        })

    } catch (error) {
        res.status(500).json({
            "success": false,
            "data": []
        })

    }
}

module.exports = {
    getAllUser,
    register

}