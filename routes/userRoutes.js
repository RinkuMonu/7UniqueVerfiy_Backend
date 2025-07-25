const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middlewares/authMiddleware');
const upload = require('../utils/upload');

const {
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
} = require('../controllers/userController');

// @route   POST /api/user/hit/:serviceName
// @desc    Hit a specific service if allowed and deduct charge
// @access  Private (User)
router.post('/hit/:serviceName', protect, hitService);

// @route   POST /api/user/upload-kyc
router.post(
  '/upload-kyc',
  protect,
  upload.fields([
    { name: 'panCard', maxCount: 1 },
    { name: 'aadhaarCard', maxCount: 1 },
    { name: 'gstCert', maxCount: 1 }
  ]),
  uploadKYC
);


router.get("/service/:id", getServiceById);
// @route   GET /api/user/wallet-ledger
router.get('/wallet-ledger', protect, getWalletLedger);
// @route   POST /api/user/service-request
router.post('/service-request', protect, serviceRequest);



// @route   GET /api/user/usage-report
router.get('/usage-report', protect, getUsageReport);
router.get('/usage-report/csv', protect, exportCSV);
router.get('/usage-report/pdf', protect, exportPDF);
router.get('/details', protect, userDetails);
router.put('/update/:id', protect, updateUser);

module.exports = router;
