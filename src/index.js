require('dotenv').config();
const express = require('express');
const usersRoute = require('./routing/users')
const app = express();
const cors = require('cors');
require('./config/config.js')
const userMiddleware = require('./middleware/user_middleware')
const bodyPharser = require('body-parser')
app.use(cors())
app.use(bodyPharser.json())
app.use(bodyPharser.urlencoded({extended:true}))
app.use(userMiddleware)
app.use(express.json())

app.use('/api', usersRoute)

app.listen(4000, ()=>{
    console.log('Server is running on port 4000');
})