const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  
  mode: {
    type: String,
    enum: ['credentials', 'production'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  referenceId: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Wallet', walletSchema);

