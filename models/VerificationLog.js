const mongoose = require("mongoose");

const verificationLogSchema = new mongoose.Schema({
  refid: String,
  type: String,
  requestPayload: Object,
  responsePayload: Object,
  statusCode: Number,
  success: Boolean,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("VerificationLog", verificationLogSchema);
