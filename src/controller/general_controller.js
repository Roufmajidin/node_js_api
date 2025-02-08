const express = require('express');
const { PrismaClient} = require('@prisma/client');
const { json} = require('body-parser')
const prisma = new PrismaClient();
// TODO : getAll Movies

const getMovies = async (req, res) => {
    console.log('ok')
    try {
        const mov = await prisma.waktu.findMany({
            include: {
                movies: true,
                rooms: true
            }
        })
        res.json(mov)
    } catch (error) {
        console.log(error)
        res.status(400).json({
            error:error
        })
        
    }
}
// TODO : getMovie dan tampilkan list tanggal
const getMovieName = async (req, res)=>{
    
    const {name} = req.params;
    try {
        const a = await prisma.movie.findFirst({
            where:{
                judul: name
            }
        });
        const waktu = await prisma.waktu.findMany({
            where:{
                movie_id : parseInt(a.id)
            }
        })
    //   console.log((a.id))
        res.json(waktu)
        
    } catch (error) {
        res.status(400).json({
            error:error
        })
    }

}

module.exports = {

    getMovies,
    getMovieName

}