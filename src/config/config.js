// const {DB_HOST,DB_USERNAME, DB_PASSWORD, DB_NAME} = process.env;
// var mysql = require('mysql');
// var connection = mysql.createConnection({
//     host: DB_HOST,
//     user: DB_USERNAME,
//     password: DB_PASSWORD,
//     database: DB_NAME
// })
// connection.connect(function(err, connection){
//     if(err)throw err;
//     console.log(DB_NAME + "Connected to the database");
// })

// module.exports = connection;
const { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;
var mysql = require('mysql2');

var connection = mysql.createConnection({
    host: DB_HOST,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME
});

connection.connect(function (err) {
    if (err) throw err;
    console.log(DB_NAME + " Connected to the database");
});

module.exports = connection;
