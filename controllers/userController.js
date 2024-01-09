const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');

const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the email is already registered
    const existingUser = await userModel.getUserByEmail(email);

    if (existingUser) {
      res.status(400).json({ success: false, error: 'Email already in use.' });
    } else {
      // Hash the password
      bcrypt.hash(password, 10, async (hashErr, hashedPassword) => {
        if (hashErr) {
          console.error('Password hashing error:', hashErr);
          res.status(500).json({ success: false, error: 'Password hashing error' });
        } else {
          // Create a new user in the database with the hashed password
          const userId = await userModel.createUser(name, email, hashedPassword);
          res.status(201).json({ success: true, message: 'User registered successfully', userId });
        }
      });
    }
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

function generateAccessToken(id, name){
  return jwt.sign({userId : id, name: name}, 'secretkey')
}

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.getUserByEmail(email);

    if (user) {
      const hashedPassword = user.password;

      bcrypt.compare(password, hashedPassword, (compareErr, match) => {
        if (compareErr) {
          console.error('Password comparison error:', compareErr);
          res.status(500).json({ success: false, error: 'Password comparison error' });
        } else if (match) {
          const token = generateAccessToken(user.id, user.name); // Corrected here
          res.status(200).json({ success: true, message: 'Login successful.', token });
        } else {
          res.status(401).json({ success: false, error: 'Login failed.' });
        }
      });
    } else {
      res.status(404).json({ success: false, error: 'User not found.' });
    }
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};


module.exports = { signup, login };
