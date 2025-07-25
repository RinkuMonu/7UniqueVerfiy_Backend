
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { createOrder, confirmPayment } = require('../controllers/paymentController');

// Wallet Top-Up Order
router.post('/order', protect, createOrder);

// Razorpay Webhook Endpoint
router.post('/webhook', express.raw({ type: 'application/json' }), confirmPayment);

module.exports = router;
