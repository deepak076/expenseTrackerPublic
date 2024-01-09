// C:\Users\DEEPSROCK\Desktop\node-js\Expense tracker\middleware\auth.js
const jwt = require('jsonwebtoken');
const db = require('../db');

const authenticate = (req, res, next) => {
  try {
    const token = req.header('Authorization');
    const user = jwt.verify(token, 'secretkey');

    // Use your MySQL connection to fetch the user along with isPremiumUser, name, email
    db.query('SELECT id, name, email, isPremiumUser FROM users WHERE id = ?', [user.userId], (err, results) => {
      if (err) {
        throw new Error(err);
      }

      const userFromDb = results[0];

      if (userFromDb) {
        req.user = userFromDb;
        next();
      } else {
        throw new Error('User not found');
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(401).json({ success: false });
  }
};

module.exports = { authenticate };
