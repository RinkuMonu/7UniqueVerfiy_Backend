
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Wallet = require('../models/Wallet');
const User = require('../models/User');

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET
// });

// Create Razorpay order
const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100, // Razorpay expects paise
      currency: 'INR',
      receipt: 'receipt_' + Date.now()
    };

    const order = await razorpay.orders.create(options);
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create Razorpay order', error: err.message });
  }
};

// Razorpay webhook to confirm payment and credit wallet
const confirmPayment = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const receivedSignature = req.headers['x-razorpay-signature'];
  const generatedSignature = crypto.createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (generatedSignature !== receivedSignature) {
    return res.status(400).json({ message: 'Invalid webhook signature' });
  }

  const payload = req.body;

  if (payload.event === 'payment.captured') {
    const { email } = payload.payload.payment.entity.notes;
    const amount = payload.payload.payment.entity.amount / 100;

    const user = await User.findOne({ email });
    if (user) {
      user.wallet += amount;
      await user.save();

      await Wallet.create({
        userId: user._id,
        type: 'credit',
        amount,
        description: 'Razorpay Wallet Top-Up',
        referenceId: payload.payload.payment.entity.id
      });
    }
  }

  res.json({ status: 'ok' });
};

module.exports = { createOrder, confirmPayment };
