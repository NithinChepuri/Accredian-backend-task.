var mysql = require("mysql2");

var connection = mysql.createConnection({
    host: 'localhost',
    database: 'tutorialdb',
    user: 'root',
    password: 'Nithin03/1729',
    insecureAuth: true  // Add this line
});

module.exports = connection;
