import express from 'express';
import { getReels, addReel, deleteReel } from '../controllers/instagramController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getReels)
    .post(protect, admin, addReel);

router.route('/:id')
    .delete(protect, admin, deleteReel);

export default router;
