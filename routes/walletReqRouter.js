const express = require("express");
const router = express.Router();
const controller = require('../controllers/walletReqController');
const { protect, isAdmin } = require("../middlewares/authMiddleware");



router.post("/request-topup", protect, controller.createPaymentRequest);
// router.get("/:id", protect, controller.getPaymentRequestById);
router.get("/", protect, isAdmin, controller.listPaymentRequests);
router.patch("/:id/status", protect,isAdmin, controller.updatePaymentRequestStatus);

module.exports = router;