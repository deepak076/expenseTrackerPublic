// C:\Users\DEEPSROCK\Desktop\node-js\Expense tracker\util\database.js
const Sequelize = require('sequelize')

const sequelize = new Sequelize(process.env.sqlTableName, process.env.sqlUserName, process.env.sqlPassword,{
    dialect: 'mysql',
    host: process.env.sql_host
})

module.exports = sequelize;