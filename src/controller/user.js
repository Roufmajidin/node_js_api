// const express = require('express');
const {geti} = require('../models/user_model');
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
            "req" : name
        })

    } catch (error) {
        res.status(500).json({
            "success": false,
            "data": []
        })

    }
}

module.exports = {
    getAllUser

}