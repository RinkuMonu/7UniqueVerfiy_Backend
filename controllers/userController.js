const User = require('../models/User');
const Service = require('../models/Service');
const Wallet = require('../models/Wallet');
const path = require('path');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');
const ServicePurchase = require('../models/ServicePurchase');
const ApiPurchaseRequest = require('../models/ApiPurchaseRequest');

// Hit assigned service
const hitService = async (req, res) => {
  try {
    const userId = req.user._id;
    const serviceName = req.params.serviceName;

    const user = await User.findById(userId);
    if (!user.services.includes(serviceName)) {
      return res.status(403).json({ message: 'Service not assigned to user' });
    }

    const service = await Service.findOne({ name: serviceName });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (user.wallet.mode.production < service.charge) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    // Deduct charge
    user.wallet.mode.production -= service.charge;

    // Track service usage
    const usageIndex = user.serviceUsage.findIndex(s => s.service === serviceName);
    if (usageIndex > -1) {
      user.serviceUsage[usageIndex].hitCount += 1;
      user.serviceUsage[usageIndex].totalCharge += service.charge;
    } else {
      user.serviceUsage.push({
        service: serviceName,
        hitCount: 1,
        totalCharge: service.charge
      });
    }

    await user.save();

    // Simulate API call here
    res.json({
      message: 'Service hit successful',
      service: serviceName,
      deducted: service.charge,
      remainingWallet: user.wallet
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Upload KYC documents
const uploadKYC = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user.documents.kycRequest) {
      if (req.files.panCard) {
        user.documents.panCard = req.files.panCard[0].filename;
      }
      if (req.files.aadhaarCard) {
        user.documents.aadhaarCard = req.files.aadhaarCard[0].filename;
      }
      if (req.files.gstCert) {
        user.documents.gstCert = req.files.gstCert[0].filename;
      }
      user.documents.kycRequest = true;
      await user.save();
      res.json({ message: 'Documents uploaded successfully', documents: user.documents, status: 1 });
    } else {
      res.json({ message: 'Documents allready uploaded', status: 0 });
    }



  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};


// Get wallet ledger/history
const getWalletLedger = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      mode,
      page = 1,
      limit = 10,
      startDate,
      endDate
    } = req.query;

    const {
      type,
      minAmount,
      maxAmount
    } = req.query;


    const modeData = mode === 'true' ? 'production' : 'credentials';

    const filter = { userId, mode: modeData };

    if (type) {
      filter.type = type; // assuming `type` is a field in Wallet
    }

    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = Number(minAmount);
      if (maxAmount) filter.amount.$lte = Number(maxAmount);
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const total = await Wallet.countDocuments(filter);
    const ledger = await Wallet.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      ledger,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch wallet history",
      error: err.message,
    });
  }
};

// post serviceRequest

const serviceRequest = async (req, res) => {
  try {
    const { userId, serviceId } = req.body;

    if (!serviceId) {
      return res.status(400).json({ message: 'Service ID is required' });
    }

    // Get service details
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if service already purchased
    const alreadyPurchased = user.services.includes(serviceId);
    if (alreadyPurchased) {
      return res.status(400).json({ message: 'Service already purchased' });
    }
    const env = user.documents.isVerified ? 'production' : 'credentials'
    
    // Check wallet balance
    if (user.wallet.mode.env < service.active_charge) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    // Deduct from wallet
    // user.wallet.mode.production -= service.active_charge;

    // // Add service to user's purchased services
    // user.services.push(serviceId);
    // await user.save();

    // // Log the purchase
    // await ServicePurchase.create({
    //   userId,
    //   serviceId,
    //   status: true,
    // });
    const alreadyPurchasedReq = await ApiPurchaseRequest.findOne({ userId, serviceId });

    if (alreadyPurchasedReq && alreadyPurchasedReq.status === 'approved') {
      return res.status(400).json({ message: 'This API service is already approved for you.' });
    }
    if (alreadyPurchasedReq && alreadyPurchasedReq.status === 'pending') {
      return res.status(400).json({ message: 'You have already requested to purchase this API. Awaiting admin approval.' });
    }
    await ApiPurchaseRequest.create({
      userId,
      serviceId,
    })

    res.status(200).json({ message: 'Service purchased Request send successfully' });

  } catch (error) {
    res.status(500).json({
      message: 'Failed to purchase service',
      error: error.message,
    });
  }
};

const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    res.status(200).json({ success: true, data: service });
  } catch (error) {
    console.error("Error fetching service by ID:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

// Return usage report as JSON


const getUsageReport = async (req, res) => {
  try {
    const { service, startDate, endDate, mode } = req.query;
    console.log('mode', mode);

    const user = await User.findById(req.user._id);

    let usage = user.serviceUsage || [];
    const modeData = mode == 'true' ? 'production' : 'credentials';
    console.log('modeData', modeData);

    if (modeData) {
      usage = usage.filter((u) => u.mode.toLowerCase() == modeData
      );
    }

    if (service) {
      usage = usage.filter((u) =>
        u.service.toLowerCase().includes(service.toLowerCase())
      );
    }

    if (startDate || endDate) {
      usage = usage.filter((u) => {
        const usedDate = new Date(u.lastUsed || Date.now());
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        return (!start || usedDate >= start) && (!end || usedDate <= end);
      });
    }

    res.json({ usage });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch usage report',
      error: err.message,
    });
  }
};


// Return usage report as JSON
const userDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('services');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'user not found', error: err.message });
  }
};

// update user profie
const updateUser = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json({ message: "Updated successfully", status: 1 });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

// Export usage report to CSV
const exportCSV = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const fields = ['service', 'hitCount', 'totalCharge'];
    const parser = new Parser({ fields });
    const csv = parser.parse(user.serviceUsage);

    res.header('Content-Type', 'text/csv');
    res.attachment('usage-report.csv');
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ message: 'CSV export failed', error: err.message });
  }
};

// Export usage report to PDF
const exportPDF = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const doc = new PDFDocument();
    const filename = 'usage-report.pdf';

    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);
    doc.fontSize(20).text('Service Usage Report', { align: 'center' });
    doc.moveDown();

    user.serviceUsage.forEach((item, idx) => {
      doc.fontSize(12).text(
        `${idx + 1}. Service: ${item.service}, Hits: ${item.hitCount}, Charges: ₹${item.totalCharge}`
      );
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ message: 'PDF export failed', error: err.message });
  }
};

// ✅ Export all
module.exports = {
  hitService,
  uploadKYC,
  getWalletLedger,
  getUsageReport,
  exportCSV,
  exportPDF,
  serviceRequest,
  userDetails,
  getServiceById,
  updateUser
};
