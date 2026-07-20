const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const requireAuth = require('../middleware/authMiddleware');

router.get('/check-username', authController.checkUsername);

router.post('/signup', authController.signup);
router.post('/verify-otp', authController.verifyOtp);
router.post('/resend-otp', authController.resendOtp);
router.post('/login', authController.login);

router.get('/check-gmail', authController.checkGmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-reset-otp', authController.verifyResetOtp);

router.post('/google', authController.googleAuth);
router.post('/google/complete-signup', authController.googleCompleteSignup);

router.get('/me', requireAuth, authController.me);

module.exports = router;