// C:\Users\DEEPSROCK\Desktop\node-js\Expense tracker\db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.sql_host,
    user: process.env.sqlUserName,
    password: process.env.sqlPassword,
    database: process.env.sqlTableName
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL');
    }
});

module.exports = db;
