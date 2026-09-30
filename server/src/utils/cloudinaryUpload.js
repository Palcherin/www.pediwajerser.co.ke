const cloudinary = require('../config/claudinary');
console.log('>>> cloudinary config check:', typeof cloudinary.config, cloudinary.config().cloud_name);

const FOLDER = 'jersey-store/products';

const uploadBuffer = (buffer) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: FOLDER, resource_type: 'image' },
            (err, result) => (err ? reject(err) : resolve(result.secure_url))
        );
        stream.end(buffer);
    });

const uploadMany = async (files = []) => {
    const results = await Promise.allSettled(files.map((f) => uploadBuffer(f.buffer)));
    const urls = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
    const failed = results.find((r) => r.status === 'rejected');
    if (failed) {
        await deleteMany(urls);
        throw failed.reason;
    }
    return urls;
};

const publicIdFromUrl = (url) => {
    if (typeof url !== 'string' || !url.includes('res.cloudinary.com')) return null;
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
    return match ? match[1] : null;
};

const deleteMany = async (urls = []) => {
    const ids = urls.map(publicIdFromUrl).filter(Boolean);
    await Promise.allSettled(ids.map((id) => cloudinary.uploader.destroy(id)));
};

module.exports = { uploadMany, deleteMany };