const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  charge: {
    type: Number,
    required: true,
  },
  descreption: {
    type: String,
    required: true,
  },
  active_charge: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive'],
    default: "inactive"
  },
  endpoint: { type: String, required: true },
  method: { type: String, default: "POST" },
  // each field with label, name, type, required
  fields: [
    {
      label: { type: String, required: true },     // e.g. "Account Number"
      name: { type: String, required: true },      // e.g. "account_number"
      type: { type: String, default: "text" },     // e.g. "text", "file", "number"
      required: { type: Boolean, default: true }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);