import express from 'express';
import {
    createReview,
    getProductReviews,
    getAdminReviews,
    updateReviewStatus,
    deleteReview,
    checkReviewEligibility
} from '../controllers/reviewController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, createReview);

router.route('/eligibility/:productId')
    .get(protect, checkReviewEligibility);

router.route('/product/:id')
    .get(getProductReviews);

router.route('/admin')
    .get(protect, admin, getAdminReviews);

router.route('/:id/status')
    .put(protect, admin, updateReviewStatus);

router.route('/:id')
    .delete(protect, admin, deleteReview);

export default router;
