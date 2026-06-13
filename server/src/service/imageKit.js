import 'dotenv/config';
import ImageKit from 'imagekit';

// ── Singleton instance ───────────────────────────────────────────
let imagekitInstance = null;

const getImageKit = () => {
  if (!imagekitInstance) {
    if (
      !process.env.IMAGEKIT_PUBLIC_KEY  ||
      !process.env.IMAGEKIT_PRIVATE_KEY ||
      !process.env.IMAGEKIT_URL_ENDPOINT
    ) {
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

// ── Upload a single file buffer ──────────────────────────────────
export const uploadImage = async (fileBuffer, fileName, folder = 'products') => {
  if (!fileBuffer) {
    throw new Error('File buffer is missing. Check Multer configuration.');
  }

  const ik = getImageKit(); // ← defined above, always in scope

  const result = await ik.upload({
    file:              fileBuffer.toString('base64'),
    fileName:          `${Date.now()}-${fileName || 'image.jpg'}`,
    folder:            `/pedi-wa-jersey/${folder}`,
    useUniqueFileName: true,
  });

  return result.url;
};

// ── Upload multiple files ────────────────────────────────────────
export const uploadImages = async (files, folder = 'products') => {
  if (!files?.length) return [];

  return Promise.all(
    files.map(file => uploadImage(file.buffer, file.originalname, folder))
  );
};

// ── Delete image by FileId ───────────────────────────────────────
export const deleteImage = async (fileId) => {
  try {
    await getImageKit().deleteFile(fileId);
  } catch (err) {
    console.error('ImageKit delete error:', err.message);
  }
};