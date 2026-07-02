/**
 * Product Controller
 * 
 * Handles all product management operations
 * 
 * @module controllers/productController
 */

const { Product, Review, User } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

/**
 * Get all products with filtering and pagination
 * 
 * @async
 * @function getAllProducts
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllProducts = async (req, res, next) => {
    try {
        const {
            category,
            brand,
            minPrice,
            maxPrice,
            search,
            sortBy = 'created_at',
            sortOrder = 'DESC',
            limit = 20,
            offset = 0
        } = req.query;
        
        // Build where clause
        const where = { is_active: true };
        
        if (category) {
            where.category = category;
        }
        
        if (brand) {
            where.brand = brand;
        }
        
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
            if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
        }
        
        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } }
            ];
        }
        
        // Get products with review statistics
        const { count, rows } = await Product.findAndCountAll({
            where,
            include: [
                {
                    model: Review,
                    attributes: [
                        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
                        [sequelize.fn('COUNT', sequelize.col('id')), 'reviewCount']
                    ]
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sortBy, sortOrder]],
            group: ['Product.id']
        });
        
        res.json({
            success: true,
            total: count,
            limit: parseInt(limit),
            offset: parseInt(offset),
            products: rows
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get product by ID
 * 
 * @async
 * @function getProductById
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const product = await Product.findByPk(id, {
            where: { is_active: true },
            include: [
                {
                    model: Review,
                    attributes: [
                        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
                        [sequelize.fn('COUNT', sequelize.col('id')), 'reviewCount']
                    ]
                },
                {
                    model: Review,
                    as: 'recentReviews',
                    limit: 5,
                    order: [['created_at', 'DESC']],
                    include: [
                        {
                            model: User,
                            attributes: ['id', 'first_name', 'last_name']
                        }
                    ]
                }
            ],
            group: ['Product.id', 'recentReviews.id', 'recentReviews->User.id']
        });
        
        if (!product) {
            throw new ApiError(404, 'Product not found', 'PRODUCT_NOT_FOUND');
        }
        
        res.json({
            success: true,
            product
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new product (admin only)
 * 
 * @async
 * @function createProduct
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createProduct = async (req, res, next) => {
    try {
        const {
            name,
            description,
            price,
            discount_price,
            category,
            brand,
            size,
            color,
            material,
            stock_quantity,
            images
        } = req.body;
        
        const product = await Product.create({
            name,
            description,
            price,
            discount_price,
            category,
            brand,
            size,
            color,
            material,
            stock_quantity: stock_quantity || 0,
            images: images || [],
            is_active: true
        });
        
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update a product (admin only)
 * 
 * @async
 * @function updateProduct
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            name,
            description,
            price,
            discount_price,
            category,
            brand,
            size,
            color,
            material,
            stock_quantity,
            images,
            is_active
        } = req.body;
        
        const product = await Product.findByPk(id);
        if (!product) {
            throw new ApiError(404, 'Product not found', 'PRODUCT_NOT_FOUND');
        }
        
        // Update product
        const updateData = {
            name,
            description,
            price,
            discount_price,
            category,
            brand,
            size,
            color,
            material,
            stock_quantity,
            images,
            is_active
        };
        
        // Remove undefined values
        Object.keys(updateData).forEach(key => 
            updateData[key] === undefined && delete updateData[key]
        );
        
        await product.update(updateData);
        
        // Get updated product
        const updatedProduct = await Product.findByPk(id);
        
        res.json({
            success: true,
            message: 'Product updated successfully',
            product: updatedProduct
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a product (soft delete)
 * 
 * @async
 * @function deleteProduct
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const product = await Product.findByPk(id);
        if (!product) {
            throw new ApiError(404, 'Product not found', 'PRODUCT_NOT_FOUND');
        }
        
        // Soft delete
        await product.update({ is_active: false });
        
        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update product stock
 * 
 * @async
 * @function updateStock
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateStock = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        
        const product = await Product.findByPk(id);
        if (!product) {
            throw new ApiError(404, 'Product not found', 'PRODUCT_NOT_FOUND');
        }
        
        await product.update({ stock_quantity: quantity });
        
        res.json({
            success: true,
            message: 'Stock updated successfully',
            product
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock
};