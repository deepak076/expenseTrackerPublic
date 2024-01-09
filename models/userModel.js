// C:\Users\DEEPSROCK\Desktop\node-js\Expense tracker\models\userModel.js
const db = require('../db');
const odermodel = require('../models/order');

const createUser = async (name, email, password) => {
  const insertUserQuery = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
  try {
    const [result] = await db.promise().query(insertUserQuery, [name, email, password]);
    return { userId: result.insertId };
  } catch (err) {
    throw err;
  }
};

const getUserByEmail = async (email) => {
  const getUserQuery = 'SELECT * FROM users WHERE email = ?';
  try {
    const [results] = await db.promise().query(getUserQuery, [email]);
    return results.length > 0 ? results[0] : null;
  } catch (err) {
    throw err;
  }
};

const getUserById = async (userId) => {
  const getUserQuery = 'SELECT * FROM users WHERE id = ?';
  try {
    const [results] = await db.promise().query(getUserQuery, [userId]);
    return results.length > 0 ? results[0] : null;
  } catch (err) {
    throw err;
  }
};

const updatePremiumStatus = async (userId) => {
  try {
      const query = 'UPDATE `users` SET ispremiumuser = 1 WHERE id = ?';

      // Assuming db is your mysql2 connection
      const [rows, fields] = await db.promise().query(query, [userId]);

      // You might want to check if the update was successful by inspecting the `rows` variable
      console.log('Rows affected:', rows.affectedRows);
  } catch (error) {
      throw new Error(`Error updating order: ${error.message}`);
  }
};

const getPremiumLeaderboard = async () => {
  try {
    const leaderboardData = await db.promise().query(`
      SELECT id, name, email, totalExpenses
      FROM users
      ORDER BY totalExpenses DESC
    `);

    return leaderboardData[0];
  } catch (error) {
    throw error;
  }
};

// Function to update totalExpenses for a user
const updateTotalExpenses = async (userId) => {
  try {
    const updateQuery = `
      UPDATE users
      SET totalExpenses = (
        SELECT SUM(amount)
        FROM expenses
        WHERE user_id = ?
      )
      WHERE id = ?
    `;

    // Update the totalExpenses
    await db.promise().query(updateQuery, [userId, userId]);
  } catch (error) {
    throw error;
  }
};

module.exports = { createUser, getUserByEmail, getUserById, updatePremiumStatus, getPremiumLeaderboard, updateTotalExpenses };

