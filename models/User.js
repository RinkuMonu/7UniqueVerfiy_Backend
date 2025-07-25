
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  wallet: {
    mode: {
      credentials: { type: Number, default: 0 },
      production: { type: Number, default: 0 },
    }
  },
  services: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service'
    }
  ],

  documents: {
    panCard: { type: String },
    aadhaarCard: { type: String },
    gstCert: { type: String },
    isVerified: { type: Boolean, default: false },
    kycRequest: { type: Boolean, default: false }
  },
  documents1: [
    String
  ],
  credentials: {
    jwtSecret: { type: String },
    authKey: { type: String },
    ipWhitelist: [{ type: String }],
    isActive: { type: Boolean, default: true },

  },
  production: {
    jwtSecret: String,
    authKey: String,
    ipWhitelist: [String],
    isActive: { type: Boolean, default: false },
  },
  environment_mode: {
    type: Boolean,
    default: false
  },
  serviceUsage: [
    {
      service: String,
      hitCount: { type: Number, default: 0 },
      mode: {
        type: String,
        enum: ['credentials', 'production'],
        required: true
      },
      totalCharge: { type: Number, default: 0 }
    }
  ],
    customServiceCharges: [
    {
      service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
      },
      customCharge: {
        type: Number,
        required: true
      }
    }
  ],
  isVerified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
