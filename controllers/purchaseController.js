// C:\Users\DEEPSROCK\Desktop\node-js\Expense tracker\controllers\purchaseController.js
const Razorpay = require('razorpay');
const User = require('../models/userModel'); 
const ordermodel = require('../models/order'); 
// const premiumModel = require('../models/premiumModel');


const purchasepremium = async (req, res) => {
    try {
        console.log("purchasepremium is running");
        var rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        console.log("key_id:", process.env.RAZORPAY_KEY_ID);
        console.log("key_secret:", process.env.RAZORPAY_KEY_SECRET);
        const amount = 2500;

        const order = await new Promise((resolve, reject) => {
            rzp.orders.create({ amount, currency: "INR" }, (err, order) => {
                console.log("order creating");
                if (err) {
                    console.log("error in order creating ");
                    reject(err);
                } else {
                    resolve(order);
                }
            });
        });

        try {
            console.log("Order ID:", order.id);
            console.log("User ID:", req.user.id);
            await ordermodel.createOrder(order.id, 'PENDING', req.user.id);
            return res.status(201).json({ order, key_id: rzp.key_id });
        } catch (err) {
            throw new Error(err);
        }
    } catch (err) {
        console.log(err);
        res.status(403).json({ message: 'Something went wrong', error: err.message });
    }
};

const updateTransactionStatus = async (req, res) => {
    try {
        console.log("updatetransaction is running: ");
        console.log("req.body:", req.body); // Log the entire req.body object
        const { payment_id, order_id } = req.body;
        let {paymentSuccessful} = req.body;
        console.log("payment_id:", payment_id);
        console.log("order_id type:", typeof order_id, "value:", order_id);
        console.log("payment tatus L: ", paymentSuccessful);
        // Update order status to SUCCESS and payment ID directly
        if(payment_id){
            await ordermodel.updateOrder(order_id, {
                paymentid: payment_id,
                status: 'SUCCESS',
            });
            await User.updatePremiumStatus(req.user.id);
    
            console.log("Order updated successfully");
    
            res.status(202).json({ success: true, message: "Transaction Successful" });
        }
        else{
            await ordermodel.updateOrder(order_id, {
                paymentid: payment_id,
                status: 'FAILED',
            });
    
            console.log("Order updation failed");
    
            res.status(202).json({ success: false, message: "Transaction Failed" });
        }
        
    } catch (err) {
        console.error("Error in updateTransactionStatus:", err);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
};

const getPremiumLeaderboard = async (req, res) => {
    try {
      const leaderboardData = await User.getPremiumLeaderboard();
      res.json({ success: true, leaderboardData });
    } catch (error) {
      console.error('Error fetching premium leaderboard:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  };
  
module.exports = { purchasepremium, updateTransactionStatus, getPremiumLeaderboard };
