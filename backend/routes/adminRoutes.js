import express from 'express';
import { adminLogin, verifyAdmin, getUsers } from '../controllers/authController.js';
import { getDashboardStats } from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', adminLogin);
router.post('/verify', verifyAdmin);
router.get('/users', protect, admin, getUsers);
router.get('/stats', protect, admin, getDashboardStats);

export default router;
