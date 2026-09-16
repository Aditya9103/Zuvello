import express from 'express';
import {
    createCoupon,
    getCoupons,
    getAdminCoupons,
    updateCoupon,
    deleteCoupon,
    validateCoupon
} from '../controllers/couponController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getCoupons).post(protect, admin, createCoupon);
router.route('/admin').get(protect, admin, getAdminCoupons);
router.route('/validate').post(validateCoupon);
router.route('/:id').put(protect, admin, updateCoupon).delete(protect, admin, deleteCoupon);

export default router;
