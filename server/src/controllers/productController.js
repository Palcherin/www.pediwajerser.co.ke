const { Product } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');


console.log('>>> productController LOADED (cloudinary version)');
const SORT_FIELDS = {
    created_at: 'created_at',
    createdAt: 'created_at',
    price: 'price',
    name: 'name',
    discount: 'discount',
};
const { uploadMany, deleteMany } = require('../utils/cloudinaryUpload');
// Multipart form values arrive as strings, so convert them
const toNum = (v) => (v === undefined || v === null || v === '' ? null : Number(v));
const toBool = (v, fallback) => (v === undefined ? fallback : v === true || v === 'true');
const parseSizes = (v) => {
    if (v === undefined) return undefined;
    if (Array.isArray(v)) return v;
    try {
        const parsed = JSON.parse(v);
        if (Array.isArray(parsed)) return parsed;
    } catch { /* not JSON */ }
    return String(v).split(',').map((s) => s.trim()).filter(Boolean);
};
const calcDiscount = (price, oldPrice) =>
    oldPrice && price !== null && oldPrice > price
        ? Math.round(((oldPrice - price) / oldPrice) * 100)
        : 0;

const getAllProducts = async (req, res, next) => {
    try {
        const {
            category, minPrice, maxPrice, search,
            sortBy = 'created_at', sortOrder = 'DESC',
            limit = 100, offset = 0,
        } = req.query;

        const where = {};
        if (category) where.categorySlug = category;

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
            if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
        }

        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } },
            ];
        }

        const orderField = SORT_FIELDS[sortBy] || 'created_at';
        const orderDir = String(sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const { count, rows } = await Product.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[orderField, orderDir]],
        });

        res.json({ success: true, total: count, data: rows });
    } catch (error) {
        next(error);
    }
};

const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) throw new ApiError(404, 'Product not found', 'PRODUCT_NOT_FOUND');
        res.json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
};

const createProduct = async (req, res, next) => {
    let uploaded = [];
    try {
        console.log('CREATE → files:', req.files?.length, '| buffer:', !!req.files?.[0]?.buffer);
        const { name, description, brand, categorySlug } = req.body;
        const price = toNum(req.body.price);
        const oldPrice = toNum(req.body.oldPrice);

        if (!name || price === null || !categorySlug) {
            return res.status(400).json({
                success: false,
                message: 'name, price and categorySlug are required',
            });
        }

        uploaded = await uploadMany(req.files);
        const images = uploaded.length
            ? uploaded
            : Array.isArray(req.body.images) ? req.body.images : [];

        const product = await Product.create({
            name,
            description: description || null,
            price,
            oldPrice,
            discount: calcDiscount(price, oldPrice),
            images,
            sizes: parseSizes(req.body.sizes) || [],
            categorySlug,
            brand: brand || null,
            stockQuantity: toNum(req.body.stockQuantity) ?? 0,
            inStock: toBool(req.body.inStock, true),
            featured: toBool(req.body.featured, false),
            
        });

        res.status(201).json({ success: true, data: product });
    } catch (error) {
          console.error('CREATE PRODUCT ERROR:', error);
        await deleteMany(uploaded); // don't leave orphaned images if the DB insert fails
        next(error);
    }
};

const updateProduct = async (req, res, next) => {
    let uploaded = [];
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) throw new ApiError(404, 'Product not found', 'PRODUCT_NOT_FOUND');

        const b = req.body;
        const data = {};

if (b.name !== undefined) data.name = b.name;
if (b.description !== undefined) data.description = b.description || null;
if (b.brand !== undefined) data.brand = b.brand || null;
if (b.categorySlug) data.categorySlug = b.categorySlug;
if (b.price !== undefined && b.price !== '') data.price = toNum(b.price);
if (b.oldPrice !== undefined) data.oldPrice = toNum(b.oldPrice);
if (b.stockQuantity !== undefined) data.stockQuantity = toNum(b.stockQuantity) ?? 0;
if (b.inStock !== undefined) data.inStock = toBool(b.inStock, true);
if (b.featured !== undefined) data.featured = toBool(b.featured, false);
if (b.sizes !== undefined) data.sizes = parseSizes(b.sizes);

        // New uploads replace the images; no uploads keeps the existing ones
        let oldImages = [];
        if (req.files && req.files.length) {
            uploaded = await uploadMany(req.files);
            data.images = uploaded;
            oldImages = product.images || [];
        }

        const finalPrice = data.price ?? product.price;
        const finalOld = 'oldPrice' in data ? data.oldPrice : product.oldPrice;
        data.discount = calcDiscount(finalPrice, finalOld);

        await product.update(data);
        deleteMany(oldImages); // fire-and-forget cleanup of replaced images

        res.json({ success: true, data: await Product.findByPk(req.params.id) });
    } catch (error) {
        await deleteMany(uploaded);
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) throw new ApiError(404, 'Product not found', 'PRODUCT_NOT_FOUND');
        const images = product.images || [];
        await product.destroy();
        deleteMany(images);
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };