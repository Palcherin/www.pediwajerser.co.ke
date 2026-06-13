import multer from 'multer';
import path   from 'path';

// ── Memory storage — files go to buffer, not disk ────────────────
// ImageKit receives buffer directly, no disk writes needed
const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const ok = allowed.test(path.extname(file.originalname).toLowerCase()) &&
             allowed.test(file.mimetype);
  cb(ok ? null : new Error('Only image files allowed'), ok);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ← named correctly to match productRoutes.js import
export const uploadImages = upload.array('images', 10);