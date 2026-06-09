// services/imagekit.js
import 'dotenv/config';
import ImageKit from 'imagekit';

let imagekitInstance = null;

const getImageKit = () => {
  if (!imagekitInstance) {
    if (!process.env.IMAGEKIT_PUBLIC_KEY || 
        !process.env.IMAGEKIT_PRIVATE_KEY || 
        !process.env.IMAGEKIT_URL_ENDPOINT) {
      throw new Error('Missing ImageKit environment variables. Check your .env file.');
    }

    imagekitInstance = new ImageKit({
      publicKey:   process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey:  process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  }
  return imagekitInstance;
};

// ── Upload a single file buffer ──────────────────────
export const uploadImage = async (fileBuffer, fileName, folder = 'products') => {
  if (!fileBuffer) {
    throw new Error('File buffer is missing. Check Multer configuration.');
  }

  const imagekit = getImageKit();   // ← Fixed: use getImageKit()

  const result = await imagekit.upload({
    file:     fileBuffer.toString('base64'),
    fileName: `${Date.now()}-${fileName || 'image.jpg'}`,
    folder:   `/pedi-wa-jersey/${folder}`,
    useUniqueFileName: true,
  });

  return result.url;
};

// ── Upload multiple files ────────────────────────────────────────
export const uploadImages = async (files, folder = 'products') => {
  if (!files || !Array.isArray(files) || files.length === 0) {
    throw new Error('No files provided for upload');
  }

  const uploads = files.map(file =>
    uploadImage(file.buffer, file.originalname, folder)
  );
  return Promise.all(uploads);
};

// ── Delete an image by its FileId ───────────────────────────────
export const deleteImage = async (fileId) => {
  try {
    const imagekit = getImageKit();   // ← Fixed
    await imagekit.deleteFile(fileId);
  } catch (err) {
    console.error('ImageKit delete error:', err.message);
  }
};