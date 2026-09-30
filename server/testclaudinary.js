require('dotenv').config();
const cloudinary = require('./config/cloudinary');

const c = cloudinary.config();
console.log('cloud_name:', c.cloud_name, '| key:', !!c.api_key, '| secret:', !!c.api_secret);

cloudinary.uploader
  .upload('https://res.cloudinary.com/demo/image/upload/sample.jpg', { folder: 'jersey-store/test' })
  .then((r) => console.log('OK', r.secure_url))
  .catch((e) => console.error('FAILED:', e.message || e));