const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { authenticate } = require('../middleware/auth');
const c = require('../controllers/heroSlideController');

const router = express.Router();

const uploadDir = path.join(__dirname, '../public/uploads/hero');
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
    storage: multer.diskStorage({
        destination: uploadDir,
        filename: (req, file, cb) =>
            cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(file.originalname).toLowerCase()}`)
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => cb(null, /^image\/(jpeg|png|webp)$/.test(file.mimetype))
});

// Swap for your existing admin check if you have one
const requireAdmin = (req, res, next) =>
    req.user?.role === 'admin'
        ? next()
        : res.status(403).json({ success: false, message: 'Admin access required' });

router.get('/', c.getActiveSlides);                                                   // public
router.get('/all', authenticate, requireAdmin, c.getAllSlides);                       // admin
router.post('/', authenticate, requireAdmin, upload.single('image'), c.createSlide);
router.put('/:id', authenticate, requireAdmin, upload.single('image'), c.updateSlide);
router.delete('/:id', authenticate, requireAdmin, c.deleteSlide);

module.exports = router;