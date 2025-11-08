import express from 'express';
import multer from 'multer';
import {
    createBulkMail,
    getBulkMailStats,
    getBulkMailHistory,
    getBulkMailById
} from '../controllers/bulkMailController.js';

const router = express.Router();

// Ensure temp directory exists
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tempDir = path.join(__dirname, '../public/temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
    console.log('Temp directory created:', tempDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = file.originalname.split('.').pop();
        cb(null, 'festival-photo-' + uniqueSuffix + '.' + fileExtension);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
        }
    }
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 5MB.'
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected field name. Use "photo" as field name.'
            });
        }
    }

    if (error.message.includes('Only image files are allowed')) {
        return res.status(400).json({
            success: false,
            message: 'Only image files are allowed'
        });
    }

    next(error);
};

// Routes
router.post('/', upload.single('photo'), handleMulterError, createBulkMail);
router.get('/history', getBulkMailHistory);
router.get('/stats/:id', getBulkMailStats);
router.get('/:bulkMailId', getBulkMailById);

export default router;