const express = require('express');
const router = express.Router();
const { 
  loginUser, 
  forgotPassword, 
  verifyResetToken, 
  resetPassword,
  verifyEmail,
  getUserProfile, 
  updateUserProfile 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { loginLimiter, forgotPasswordLimiter, resetPasswordLimiter } = require('../../middleware/rateLimiter');

router.post('/login', loginLimiter, loginUser);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.get('/verify-reset-token', verifyResetToken);
router.post('/reset-password', resetPasswordLimiter, resetPassword);
router.get('/verify-email', verifyEmail);

router.get('/me', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

module.exports = router;
