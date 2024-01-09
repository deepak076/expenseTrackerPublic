// C:\Users\DEEPSROCK\Desktop\node-js\Expense tracker\models\expenseModel.js
const db = require('../db');

const createExpense = (amount, description, category, user_id) => {
  // Insert a new expense into the database
  const insertExpenseQuery = 'INSERT INTO expenses (amount, description, category, user_id) VALUES (?, ?, ?, ?)';
  return new Promise((resolve, reject) => {
    db.query(insertExpenseQuery, [amount, description, category, user_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.insertId);
      }
    });
  });
};

const getAllExpenses = async (userId, offset, pageSize) => {
  try {
    const query = `
      SELECT e.id, e.amount, e.description, e.category
      FROM expense.expenses e
      JOIN expense.users u ON e.user_id = u.id
      WHERE u.id = ?
      LIMIT ?, ?;
    `;

    const [expenses] = await db.promise().query(query, [userId, offset, pageSize]);
    return expenses;
  } catch (error) {
    throw new Error(`Error fetching expenses: ${error.message}`);
  }
};

const deleteExpense = (expenseId) => {
  console.log("delete model");
  // const expenseId = req.params.expenseId;
  console.log("expense id ", expenseId);

  // SQL query to delete the expense
  const deleteQuery = 'DELETE FROM expenses WHERE id = ?';

  db.query(deleteQuery, [expenseId], (err, results) => {
    if (err) {
      console.error('Error:', err);
      return (err);
    } else {

      return (results);
    }
  });
};

const getPaginatedExpenses = async (userId, offset, pageSize) => {
  try {
    const query = `
      SELECT e.id, e.amount, e.description, e.category
      FROM expense.expenses e
      JOIN expense.users u ON e.user_id = u.id
      WHERE u.id = ?
      LIMIT ?, ?;
    `;

    const [expenses] = await db.promise().query(query, [userId, offset, pageSize]);
    return expenses;
  } catch (error) {
    throw new Error(`Error fetching paginated expenses: ${error.message}`);
  }
};

const getTotalExpensesCount = async (userId) => {
  try {
    const query = `
      SELECT COUNT(*) as totalExpenses
      FROM expense.expenses e
      JOIN expense.users u ON e.user_id = u.id
      WHERE u.id = ?;
    `;

    const [result] = await db.promise().query(query, [userId]);
    return result[0].totalExpenses;
  } catch (error) {
    throw new Error(`Error fetching total expenses count: ${error.message}`);
  }
};

const getAllExpensesToDownlaod = async (userId) => {
  try {
    const query = `
      SELECT e.id, e.amount, e.description, e.category
      FROM expense.expenses e
      JOIN expense.users u ON e.user_id = u.id
      WHERE u.id = ?;
    `;

    const [expenses] = await db.promise().query(query, [userId]);
    return expenses;
  } catch (error) {
    throw new Error(`Error fetching all expenses: ${error.message}`);
  }
};

module.exports = { createExpense, getAllExpenses, deleteExpense, getPaginatedExpenses, getTotalExpensesCount, getAllExpensesToDownlaod };
