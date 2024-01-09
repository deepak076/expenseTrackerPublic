// models/users.js
const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const Forgotpassword = require('./forgotpassword');

const User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: Sequelize.STRING,
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    password: Sequelize.STRING,
    ispremiumuser: {
        type: Sequelize.BOOLEAN,
        defaultValue: false // Set the default value to 0 (false)
    }
}, {
    timestamps: false // Disable automatic timestamps
});

// Define the association
User.hasMany(Forgotpassword, { foreignKey: 'userId' });
module.exports = User;
