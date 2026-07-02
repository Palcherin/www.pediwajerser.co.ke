/**
 * Review Controller
 * 
 * Handles all product review operations
 * 
 * @module controllers/reviewController
 */

const { Review, Product, User } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

/**
 * Create a new review
 * 
 * @async
 * @function createReview
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createReview = async (req, res, next) => {
    try {
        const { product_id, rating, comment } = req.body;
        const userId = req.userId;
        
        // Check if product exists
        const product = await Product.findByPk(product_id);
        if (!product) {
            throw new ApiError(404, 'Product not found', 'PRODUCT_NOT_FOUND');
        }
        
        // Check if user already reviewed this product
        const existingReview = await Review.findOne({
            where: {
                user_id: userId,
                product_id: product_id
            }
        });
        
        if (existingReview) {
            throw new ApiError(409, 'You have already reviewed this product', 'REVIEW_EXISTS');
        }
        
        // Create review
        const review = await Review.create({
            user_id: userId,
            product_id,
            rating,
            comment
        });
        
        // Get review with user details
        const createdReview = await Review.findByPk(review.id, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'first_name', 'last_name']
                }
            ]
        });
        
        res.status(201).json({
            success: true,
            message: 'Review created successfully',
            review: createdReview
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all reviews for a product
 * 
 * @async
 * @function getProductReviews
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getProductReviews = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { limit = 20, offset = 0 } = req.query;
        
        // Check if product exists
        const product = await Product.findByPk(productId);
        if (!product) {
            throw new ApiError(404, 'Product not found', 'PRODUCT_NOT_FOUND');
        }
        
        const { count, rows } = await Review.findAndCountAll({
            where: { product_id: productId },
            include: [
                {
                    model: User,
                    attributes: ['id', 'first_name', 'last_name']
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });
        
        // Calculate average rating
        const avgRating = await Review.findOne({
            where: { product_id: productId },
            attributes: [
                [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating']
            ]
        });
        
        res.json({
            success: true,
            total: count,
            limit: parseInt(limit),
            offset: parseInt(offset),
            averageRating: parseFloat(avgRating.dataValues.averageRating) || 0,
            reviews: rows
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update a review
 * 
 * @async
 * @function updateReview
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const userId = req.userId;
        
        const review = await Review.findByPk(id);
        if (!review) {
            throw new ApiError(404, 'Review not found', 'REVIEW_NOT_FOUND');
        }
        
        // Check if user owns the review
        if (review.user_id !== userId) {
            throw new ApiError(403, 'You can only update your own reviews', 'FORBIDDEN');
        }
        
        // Update review
        await review.update({ rating, comment });
        
        // Get updated review with user details
        const updatedReview = await Review.findByPk(id, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'first_name', 'last_name']
                }
            ]
        });
        
        res.json({
            success: true,
            message: 'Review updated successfully',
            review: updatedReview
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a review
 * 
 * @async
 * @function deleteReview
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const userRole = req.user.role;
        
        const review = await Review.findByPk(id);
        if (!review) {
            throw new ApiError(404, 'Review not found', 'REVIEW_NOT_FOUND');
        }
        
        // Check if user owns the review or is admin
        if (review.user_id !== userId && userRole !== 'admin') {
            throw new ApiError(403, 'You can only delete your own reviews', 'FORBIDDEN');
        }
        
        await review.destroy();
        
        res.json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get current user's reviews
 * 
 * @async
 * @function getUserReviews
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getUserReviews = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { limit = 20, offset = 0 } = req.query;
        
        const { count, rows } = await Review.findAndCountAll({
            where: { user_id: userId },
            include: [
                {
                    model: Product,
                    attributes: ['id', 'name', 'price', 'images']
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });
        
        res.json({
            success: true,
            total: count,
            limit: parseInt(limit),
            offset: parseInt(offset),
            reviews: rows
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createReview,
    getProductReviews,
    updateReview,
    deleteReview,
    getUserReviews
};