// db.js
const mysql = require('mysql2/promise'); // Import the promise version

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: 'Abcd@1234', // Replace with your MySQL password
    database: 'pharmacy'
});

module.exports = { db: pool };
