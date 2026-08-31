import express from 'express';
import { 
    authUser, 
    registerUser, 
    getUserProfile, 
    adminLogin, 
    passwordlessLogin,
    sendRegisterOTP,
    verifyRegisterOTP,
    sendForgotPasswordOTP,
    resetPasswordWithOTP
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', authUser);
router.post('/passwordless-login', passwordlessLogin);
router.post('/register', registerUser); // legacy, keep or remove later
router.post('/send-register-otp', sendRegisterOTP);
router.post('/verify-register-otp', verifyRegisterOTP);
router.post('/forgot-password-otp', sendForgotPasswordOTP);
router.post('/reset-password-otp', resetPasswordWithOTP);

router.route('/profile').get(protect, getUserProfile);

// This matches /api/admin/login if mounted at /api/admin
router.post('/admin-login-internal', adminLogin); // Internal helper

export default router;
