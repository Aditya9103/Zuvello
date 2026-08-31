import express from 'express';
import {
    addOrderItems,
    getOrderById,
    updateOrderStatus,
    getMyOrders,
    getOrders,
    addOrderTrackingUpdate,
    cancelOrder,
    updateOrderDetails
} from '../controllers/orderController.js';
import { protect, admin, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(optionalAuth, addOrderItems).get(protect, admin, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/status').put(protect, admin, updateOrderStatus);
router.route('/:id/edit').put(protect, admin, updateOrderDetails);
router.route('/:id/cancel').put(protect, cancelOrder);
router.route('/:id/tracking').post(protect, admin, addOrderTrackingUpdate);

export default router;
