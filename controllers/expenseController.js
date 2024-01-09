// C:\Users\DEEPSROCK\Desktop\node-js\Expense tracker\controllers\expenseController.js
const expenseModel = require('../models/expenseModel');
const userModel = require('../models/userModel'); // Import userModel
const db = require('../db');
const s3Service = require('../services/s3services')
const downloadedFileModel = require('../models/downloadFiles');

const addExpense = async (req, res) => {
  try {
    await db.promise().beginTransaction();

    const { amount, description, category } = req.body;
    const userId = req.user.id;

    const expenseId = await expenseModel.createExpense(amount, description, category, userId);
    const newExpense = { id: expenseId, amount, description, category };

    await userModel.updateTotalExpenses(userId);

    await db.promise().commit();

    res.json({ success: true, expense: newExpense });
  } catch (err) {
    console.error('Error:', err);

    try {
      if (db && db.promise()) {
        await db.promise().rollback();
      }
    } catch (rollbackError) {
      console.error('Rollback Error:', rollbackError);
    }

    res.status(500).json({ success: false, error: err.message });
  }
};

const getExpenses = async (req, res) => {
  try {
    console.log("entering getExpenses");
    const userId = req.user.id;
    const page = req.query.page || 1; // Get the requested page from the query parameters
    const pageSize = parseInt(req.query.pageSize) || 10; // Set the page size with a default of 10 if not provided
    console.log("page size", pageSize);
    // Fetch total expenses count
    const totalExpenses = await expenseModel.getTotalExpensesCount(userId);
    console.log("toalexpenses", totalExpenses);
    // Calculate the offset based on the requested page
    const offset = (page - 1) * pageSize;

    // Fetch expenses for the requested page
    const expenses = await expenseModel.getPaginatedExpenses(userId, offset, pageSize);

    res.json({ totalExpenses, pageSize, expenses });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};


const deleteExpense = async (req, res) => {
  try {
    console.log("delete expense is running");
    const userId = req.user.id;
    console.log("userid", userId);
    const expenseId = req.params.expenseId;
    console.log("expense id", expenseId);

    await db.promise().beginTransaction();

    expenseModel.deleteExpense(expenseId);

    await userModel.updateTotalExpenses(userId);

    await db.promise().commit();

    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (err) {
    console.error('Error:', err);

    try {
      if (db && db.promise()) {
        await db.promise().rollback();
      }
    } catch (rollbackError) {
      console.error('Rollback Error:', rollbackError);
    }

    res.status(500).json({ success: false, error: err.message });
  }
};

const downloadExpenses = async (req, res) => {
  console.log("entering downloadexpense");
  const userId = req.user.id;
  const expenses = await expenseModel.getAllExpensesToDownlaod(userId);
  console.log(expenses);
  const stringifiedExpenses = JSON.stringify(expenses);
  const userid = req.user.id;
  const filename = `Expense${userid}/${new Date()}.txt`;

  try {
    const downloadUrl = await s3Service.uploadToS3(stringifiedExpenses, filename);

    // Save the downloaded file URL in the database
    await downloadedFileModel.saveDownloadedFile(userId, downloadUrl);

    res.status(200).json({ downloadUrl, success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Error generating pre-signed URL' });
  }
};

async function getDownloadedFiles(req, res) {
  const userId = req.user.id; // Assuming you have the user ID stored in req.user

  try {
    // Fetch downloaded files for the user
    const downloadedFiles = await downloadedFileModel.DownloadedFile.findAll({
      where: { user_id: userId },
      attributes: ['id', 'file_url', 'download_date'],
      order: [['download_date', 'DESC']],
    });


    res.json({ success: true, downloadedFiles });
  } catch (error) {
    console.error('Error fetching downloaded files:', error);
    res.status(500).json({ success: false, error: 'Error fetching downloaded files' });
  }
}

module.exports = {
  addExpense, getExpenses, deleteExpense, downloadExpenses, getDownloadedFiles,
};
