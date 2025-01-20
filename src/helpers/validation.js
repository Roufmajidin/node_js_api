const {check} = require('express-validator');

exports.signUpValidation = [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please enter email yg bener').isEmail().normalizeEmail({gmail_convert_googlemaildotcom:true}),
    check('password', 'Password is required').isLength({min:6})

]