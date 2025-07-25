
const mongoose = require('mongoose');

const ServicePurchase = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Service'
    },
    status: {
        type: Boolean,
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('ServicePurchase', ServicePurchase);
