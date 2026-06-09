import { prisma }                    from '../config/db.js';
import { uploadImages, deleteImage } from '../service/imageKit.js';

const generateSlug = (name) =>
  name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const parseImages = (images) => {
  try {
    if (Array.isArray(images))           return images;
    if (typeof images === 'string')      return JSON.parse(images || '[]');
    return [];
  } catch { return []; }
};

export const getProducts = async (req, res) => {
  try {
    const { category, search, featured, inStock } = req.query;

    const where = {
      ...(category && { categorySlug: category }),
      ...(featured && { featured: featured === 'true' }),
      ...(inStock  && { inStock:   inStock  === 'true' }),
      ...(search   && {
        OR: [
          { name:        { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { brand:       { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const products = await prisma.product.findMany({
      where,
      include:  { category: true },
      orderBy:  { createdAt: 'desc' },
    });

    res.json({
      status: 'success',
      data: products.map(p => ({ ...p, images: parseImages(p.images) })),
    });
  } catch (error) {
    console.error('Get Products Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where:   { id: req.params.id },
      include: { category: true },
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({
      status: 'success',
      data: { ...product, images: parseImages(product.images) },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ── CREATE — now uploads to ImageKit ────────────────────────────
export const createProduct = async (req, res) => {
  try {
    const {
      name, description, price, oldPrice, discount,
      brand, categoryId, categorySlug, inStock,
      stockQuantity, featured,
    } = req.body;

    // ✅ Upload files to ImageKit, get back CDN URLs
    const images = req.files?.length
      ? await uploadImages(req.files, 'products')
      : [];

    const slug = `${generateSlug(name)}-${Date.now()}`;

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description:   description   || '',
        price:         parseFloat(price),
        oldPrice:      oldPrice       ? parseFloat(oldPrice)    : null,
        discount:      discount       ? parseFloat(discount)    : null,
        images:        JSON.stringify(images),  // full CDN URLs stored
        brand:         brand          || '',
        categoryId:    categoryId     || null,
        categorySlug:  categorySlug   || '',
        inStock:       inStock  === 'true' || inStock  === true,
        stockQuantity: stockQuantity  ? parseInt(stockQuantity) : 0,
        featured:      featured === 'true' || featured === true,
      },
    });

    res.status(201).json({
      status: 'success',
      data: { ...product, images: parseImages(product.images) },
    });
  } catch (error) {
    console.error('Create Product Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ── UPDATE — uploads new files to ImageKit ───────────────────────
export const updateProduct = async (req, res) => {
  try {
    const {
      name, description, price, oldPrice, discount,
      brand, categoryId, categorySlug, inStock,
      stockQuantity, featured, existingImages,
    } = req.body;

    // ✅ Upload any new files to ImageKit
    const uploadedImages = req.files?.length
      ? await uploadImages(req.files, 'products')
      : [];

    // Keep existing CDN URLs + add new ones
    const existing = existingImages
      ? (Array.isArray(existingImages) ? existingImages : [existingImages])
      : [];

    const images = [...existing, ...uploadedImages];

    const data = {
      ...(name          && { name, slug: `${generateSlug(name)}-${Date.now()}` }),
      ...(description   !== undefined && { description }),
      ...(price         !== undefined && { price:         parseFloat(price) }),
      ...(oldPrice      !== undefined && { oldPrice:      parseFloat(oldPrice) }),
      ...(discount      !== undefined && { discount:      parseFloat(discount) }),
      ...(brand         !== undefined && { brand }),
      ...(categoryId    !== undefined && { categoryId }),
      ...(categorySlug  !== undefined && { categorySlug }),
      ...(inStock       !== undefined && { inStock:       inStock === 'true' || inStock === true }),
      ...(stockQuantity !== undefined && { stockQuantity: parseInt(stockQuantity) }),
      ...(featured      !== undefined && { featured:      featured === 'true' || featured === true }),
      ...(images.length  && { images: JSON.stringify(images) }),
    };

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data,
    });

    res.json({
      status: 'success',
      data: { ...product, images: parseImages(product.images) },
    });
  } catch (error) {
    console.error('Update Product Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ status: 'success', message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete Product Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};