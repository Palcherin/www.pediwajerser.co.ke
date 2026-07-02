/**
 * Cart Controller
 * 
 * Handles all shopping cart operations
 * 
 * @module controllers/cartController
 */

const { Cart, Product } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

/**
 * Add item to cart
 * 
 * @async
 * @function addToCart
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const addToCart = async (req, res, next) => {
    try {
        const { product_id, quantity = 1, size, color } = req.body;
        const userId = req.userId;
        
        // Check if product exists and has stock
        const product = await Product.findByPk(product_id);
        if (!product) {
            throw new ApiError(404, 'Product not found', 'PRODUCT_NOT_FOUND');
        }
        
        if (!product.is_active) {
            throw new ApiError(400, 'Product is not available', 'PRODUCT_INACTIVE');
        }
        
        if (product.stock_quantity < quantity) {
            throw new ApiError(400, 'Insufficient stock', 'INSUFFICIENT_STOCK');
        }
        
        // Check if item already in cart
        let cartItem = await Cart.findOne({
            where: {
                user_id: userId,
                product_id: product_id,
                size: size || null,
                color: color || null
            }
        });
        
        if (cartItem) {
            // Update quantity if already exists
            const newQuantity = cartItem.quantity + quantity;
            if (product.stock_quantity < newQuantity) {
                throw new ApiError(400, 'Insufficient stock', 'INSUFFICIENT_STOCK');
            }
            await cartItem.update({ quantity: newQuantity });
        } else {
            // Create new cart item
            cartItem = await Cart.create({
                user_id: userId,
                product_id: product_id,
                quantity,
                size: size || null,
                color: color || null
            });
        }
        
        // Get cart item with product details
        const cartItemWithProduct = await Cart.findByPk(cartItem.id, {
            include: [
                {
                    model: Product,
                    attributes: ['name', 'price', 'discount_price', 'images', 'stock_quantity']
                }
            ]
        });
        
        res.status(201).json({
            success: true,
            message: 'Item added to cart',
            cartItem: cartItemWithProduct
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get current user's cart
 * 
 * @async
 * @function getCart
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getCart = async (req, res, next) => {
    try {
        const userId = req.userId;
        
        const cartItems = await Cart.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: Product,
                    attributes: ['id', 'name', 'price', 'discount_price', 'images', 'stock_quantity', 'is_active']
                }
            ],
            order: [['created_at', 'DESC']]
        });
        
        // Calculate totals
        let subtotal = 0;
        const items = cartItems.map(item => {
            const price = item.Product.discount_price || item.Product.price;
            const total = price * item.quantity;
            subtotal += total;
            
            return {
                ...item.toJSON(),
                price: price,
                total: total
            };
        });
        
        res.json({
            success: true,
            items: items,
            summary: {
                item_count: items.length,
                subtotal: subtotal,
                tax: subtotal * 0.1, // 10% tax
                shipping: subtotal > 100 ? 0 : 10, // Free shipping over $100
                total: subtotal + (subtotal * 0.1) + (subtotal > 100 ? 0 : 10)
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update cart item quantity
 * 
 * @async
 * @function updateCartItem
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateCartItem = async (req, res, next) => {
    try {
        const { product_id, quantity, size, color } = req.body;
        const userId = req.userId;
        
        if (quantity < 0) {
            throw new ApiError(400, 'Quantity must be positive', 'INVALID_QUANTITY');
        }
        
        // Find cart item
        const cartItem = await Cart.findOne({
            where: {
                user_id: userId,
                product_id: product_id,
                size: size || null,
                color: color || null
            }
        });
        
        if (!cartItem) {
            throw new ApiError(404, 'Cart item not found', 'CART_ITEM_NOT_FOUND');
        }
        
        if (quantity === 0) {
            // Remove item if quantity is 0
            await cartItem.destroy();
            return res.json({
                success: true,
                message: 'Item removed from cart'
            });
        }
        
        // Check stock
        const product = await Product.findByPk(product_id);
        if (product && product.stock_quantity < quantity) {
            throw new ApiError(400, 'Insufficient stock', 'INSUFFICIENT_STOCK');
        }
        
        await cartItem.update({ quantity });
        
        // Get updated cart item
        const updatedItem = await Cart.findByPk(cartItem.id, {
            include: [
                {
                    model: Product,
                    attributes: ['name', 'price', 'discount_price', 'images', 'stock_quantity']
                }
            ]
        });
        
        res.json({
            success: true,
            message: 'Cart updated successfully',
            cartItem: updatedItem
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Remove item from cart
 * 
 * @async
 * @function removeFromCart
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const removeFromCart = async (req, res, next) => {
    try {
        const { product_id, size, color } = req.body;
        const userId = req.userId;
        
        const cartItem = await Cart.findOne({
            where: {
                user_id: userId,
                product_id: product_id,
                size: size || null,
                color: color || null
            }
        });
        
        if (!cartItem) {
            throw new ApiError(404, 'Cart item not found', 'CART_ITEM_NOT_FOUND');
        }
        
        await cartItem.destroy();
        
        res.json({
            success: true,
            message: 'Item removed from cart'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Clear entire cart
 * 
 * @async
 * @function clearCart
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const clearCart = async (req, res, next) => {
    try {
        const userId = req.userId;
        
        await Cart.destroy({
            where: { user_id: userId }
        });
        
        res.json({
            success: true,
            message: 'Cart cleared successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart
};