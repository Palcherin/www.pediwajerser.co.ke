const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Same handling as blogRoute.js: works if authorizeAdmin is plain middleware or a factory
const adminOnly = authorizeAdmin.length >= 3 ? authorizeAdmin : authorizeAdmin('admin');

const uploadPath = path.join(__dirname, '../public/uploads');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname).toLowerCase());
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (req, file, cb) => {
        if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) return cb(null, true);
        cb(new Error('Only JPG, PNG, WEBP or GIF images are allowed'));
    },
});

const router = express.Router();

// POST /api/upload  (form-data, field name: "image")
router.post('/', authenticate, adminOnly, (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            const message = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5 MB or smaller' : err.message;
            return res.status(400).json({ success: false, message });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image uploaded' });
        }

        res.status(201).json({
            success: true,
            filename: req.file.filename,
            url: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`,
        });
    });
});

module.exports = router;