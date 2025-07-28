
const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middlewares/authMiddleware');
const {
  createUser,
  assignServices,
  updateServiceCharge,
  getAllUsers,
  getServiceReport,
  addService,
  getAllServices,
  verifyKYC, adminWalletTopup, getUserLedger,
  assignAllServicesToUser,
  getKycRequestedUsers,
  getTotalWalletBalance,
  putStatusChange,
  updateUser,
  parchaseService,
  apirequests,
  updateApirequests,
  getUserById,

} = require('../controllers/adminController');

// Admin-only protected routes
router.post('/create-user', protect, isAdmin, createUser);
router.post('/update-user', protect, isAdmin, updateUser);
router.post('/assign-services', protect, isAdmin, assignServices);
router.post('/assign-services-bulk', protect, isAdmin, assignAllServicesToUser);
router.post('/add-services', protect, isAdmin, addService);
router.patch('/update-service-purchase', protect, isAdmin, updateApirequests);
router.get('/read-service-purchase', protect, isAdmin, apirequests);
router.post('/service-purchase', protect, isAdmin, parchaseService);


router.get('/services', protect, getAllServices);
router.get('/kyc-request', protect, isAdmin, getKycRequestedUsers);
router.post('/productionKey', protect, isAdmin, getAllServices);

router.put('/update-service/:editId', protect, isAdmin, updateServiceCharge);
router.get('/users', protect, isAdmin, getAllUsers);
router.get('/user/:id', protect, isAdmin, getUserById);
router.get('/report', protect, isAdmin, getServiceReport);


router.post('/verify-kyc', protect, isAdmin, verifyKYC);
router.post('/wallet-topup', protect, isAdmin, adminWalletTopup);
router.get('/wallet-balance', protect, isAdmin, getTotalWalletBalance);

router.put('/status-change/:userId', protect, putStatusChange);

router.get('/ledger/:userId', protect, isAdmin, getUserLedger);
module.exports = router;

