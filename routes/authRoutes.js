
const express = require('express');
const router = express.Router();
const { register, login, requestReset, resetPassword } = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);

module.exports = router;


router.post('/request-reset', requestReset);
router.post('/reset-password', resetPassword);
