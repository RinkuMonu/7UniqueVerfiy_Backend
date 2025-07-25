const mongoose = require("mongoose");

const apiPurchaseRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service", 
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  approvedAt: Date,
  adminNote: String,
});

module.exports = mongoose.model("ApiPurchaseRequest", apiPurchaseRequestSchema);
