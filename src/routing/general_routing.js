const express = require('express');
const router = express.Router();
// controller 
const controller = require('../controller/general_controller')

router.get('/time', controller.getMovies)
router.get('/movies/:name', controller.getMovieName)
module.exports = router;
