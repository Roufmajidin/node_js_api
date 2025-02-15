require('dotenv').config();

const {multer} = require('multer');
const express = require('express');
const usersRoute = require('./routing/users')
const moviesRoute = require('./routing/general_routing');
const app = express();
const cors = require('cors');
require('./config/config.js')
const userMiddleware = require('./middleware/user_middleware')
const bodyPharser = require('body-parser')
const path = require('path');


app.use(cors());
app.use(express.json()); // Untuk JSON
app.use(express.urlencoded({ extended: true })); 
// app.use(bodyParser.json()); 
app.use(bodyPharser.urlencoded({ extended: true }));


const uploadPath = path.join(__dirname, 'storage/uploads');
console.log('Serving static files from:', uploadPath);

app.use('/storage/uploads', express.static(path.join(__dirname, './storage/uploads')));
app.use('/api', usersRoute)
app.use('/movies', moviesRoute)
app.get('/test-image', (req, res) => {
    res.sendFile(path.join(__dirname, 'storage/uploads/1739579302543-nata-absen.png'));
});
console.log('Serving static files from:', uploadPath);

app.listen(4000, ()=>{
    console.log('Server is running on port 4000');
})