import express from 'express';
import multer from 'multer';
import { uploadFileToS3 } from '../utils/s3Storage.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB for video support
    },
});

router.post('/', protect, admin, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const imageUrl = await uploadFileToS3(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
        );

        res.json({
            message: 'Image uploaded successfully',
            url: imageUrl,
        });
    } catch (error) {
        console.error('Upload API Error:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
