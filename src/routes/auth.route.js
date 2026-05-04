import express from 'express';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-otp', authController.resendOTP);
router.post('/forget-password', authController.forgetPassword);
router.post('/verify-forget-password-otp', authController.verifyForgetPasswordOTP);
router.post('/reset-password', authController.resetPassword);
router.post('/refresh-access-token', authController.refreshAccessToken);
router.post('/admin-login', authController.adminLogin);
export default router;