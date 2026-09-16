import express from 'express';
import {
    createPaymentOrder,
    verifyPayment,
    handleWebhook,
    initiateRefund
} from '../controllers/paymentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-order', protect, createPaymentOrder);
router.post('/verify', protect, verifyPayment);
router.post('/webhook', handleWebhook);
router.post('/refund', protect, admin, initiateRefund);

export default router;
