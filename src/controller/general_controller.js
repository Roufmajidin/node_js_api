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
      
      console.log((waktu))
        res.json({
            data :{
                movie : a,
                waktu : waktu,

            }
        })
        
    } catch (error) {
        res.status(400).json({
            error:error
        })
    }

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
const getSeat  = async (req, res) =>{
   try {
    const {roomId, waktuId} = req.params;
    const seat = await prisma.seat.findMany({
        where:{
            room_id : parseInt(roomId)
        },
        include:{
            Booking:{
                where :{waktu_id :parseInt(waktuId)}
            }
        }
    })
    console.log(seat)
    return res.json({
        data : {
            total_seat : seat.length,
            seat :seat,
        }
    })
    
   } catch (error) {
    return res.status(404).json({ error: error})
    
   }
}

module.exports = {

    getMovies,
    getMovieName,
    getSeat

}