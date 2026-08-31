import express from 'express';
import { getEnquiries, updateEnquiryStatus, deleteEnquiry, createEnquiry } from '../controllers/enquiryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/all', protect, getEnquiries);
router.post('/', createEnquiry);
router.put('/:id/status', protect, updateEnquiryStatus);
router.delete('/:id', protect, deleteEnquiry);

export default router;
