/**
 * Order Controller
 * 
 * Handles all order management operations
 * 
 * @module controllers/orderController
 */

const { Order, OrderItem, Cart, Product, User } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const { sequelize } = require('../config/database');

/**
 * Generate unique order number
 * 
 * @function generateOrderNumber
 * @returns {string} Unique order number
 */
const generateOrderNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `ORD-${timestamp}-${random}`;
};

/**
 * Create a new order from cart
 * 
 * @async
 * @function createOrder
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createOrder = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    
    try {
        const {
            shipping_address,
            shipping_city,
            shipping_state,
            shipping_zip,
            shipping_country,
            payment_method,
            notes
        } = req.body;
        
        const userId = req.userId;
        
        // Get cart items
        const cartItems = await Cart.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: Product,
                    attributes: ['id', 'name', 'price', 'discount_price', 'stock_quantity']
                }
            ],
            transaction
        });
        
        if (cartItems.length === 0) {
            throw new ApiError(400, 'Cart is empty', 'EMPTY_CART');
        }
        
        // Calculate total and check stock
        let totalAmount = 0;
        const orderItems = [];
        
        for (const item of cartItems) {
            const product = item.Product;
            const price = product.discount_price || product.price;
            const total = price * item.quantity;
            
            // Check stock
            if (product.stock_quantity < item.quantity) {
                throw new ApiError(
                    400,
                    `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}`,
                    'INSUFFICIENT_STOCK'
                );
            }
            
            totalAmount += total;
            
            orderItems.push({
                product_id: product.id,
                product_name: product.name,
                product_price: price,
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                total_price: total
            });
        }
        
        // Generate order number
        const orderNumber = generateOrderNumber();
        
        // Create order
        const order = await Order.create({
            user_id: userId,
            order_number: orderNumber,
            total_amount: totalAmount,
            shipping_address,
            shipping_city,
            shipping_state,
            shipping_zip,
            shipping_country,
            payment_method,
            notes,
            payment_status: 'pending',
            order_status: 'pending'
        }, { transaction });
        
        // Create order items
        for (const item of orderItems) {
            await OrderItem.create({
                order_id: order.id,
                ...item
            }, { transaction });
            
            // Update product stock
            await Product.decrement('stock_quantity', {
                by: item.quantity,
                where: { id: item.product_id },
                transaction
            });
        }
        
        // Clear cart
        await Cart.destroy({
            where: { user_id: userId },
            transaction
        });
        
        await transaction.commit();
        
        // Get complete order with items
        const completeOrder = await Order.findByPk(order.id, {
            include: [
                {
                    model: OrderItem,
                    as: 'items'
                }
            ]
        });
        
        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order: completeOrder
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

/**
 * Get current user's orders
 * 
 * @async
 * @function getMyOrders
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getMyOrders = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { limit = 20, offset = 0 } = req.query;
        
        const { count, rows } = await Order.findAndCountAll({
            where: { user_id: userId },
            include: [
                {
                    model: OrderItem,
                    as: 'items'
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
            orders: rows
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get order by ID
 * 
 * @async
 * @function getOrderById
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getOrderById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const userRole = req.user.role;
        
        const order = await Order.findByPk(id, {
            include: [
                {
                    model: OrderItem,
                    as: 'items'
                },
                {
                    model: User,
                    attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
                }
            ]
        });
        
        if (!order) {
            throw new ApiError(404, 'Order not found', 'ORDER_NOT_FOUND');
        }
        
        // Check if user owns the order or is admin
        if (order.user_id !== userId && userRole !== 'admin') {
            throw new ApiError(403, 'Access denied', 'FORBIDDEN');
        }
        
        res.json({
            success: true,
            order
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update order status (admin only)
 * 
 * @async
 * @function updateOrderStatus
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            throw new ApiError(400, 'Invalid status', 'INVALID_STATUS');
        }
        
        const order = await Order.findByPk(id);
        if (!order) {
            throw new ApiError(404, 'Order not found', 'ORDER_NOT_FOUND');
        }
        
        await order.update({ order_status: status });
        
        res.json({
            success: true,
            message: 'Order status updated successfully',
            order
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update payment status (admin only)
 * 
 * @async
 * @function updatePaymentStatus
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updatePaymentStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const validStatuses = ['pending', 'paid', 'failed'];
        if (!validStatuses.includes(status)) {
            throw new ApiError(400, 'Invalid payment status', 'INVALID_STATUS');
        }
        
        const order = await Order.findByPk(id);
        if (!order) {
            throw new ApiError(404, 'Order not found', 'ORDER_NOT_FOUND');
        }
        
        await order.update({ payment_status: status });
        
        res.json({
            success: true,
            message: 'Payment status updated successfully',
            order
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update tracking number (admin only)
 * 
 * @async
 * @function updateTracking
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateTracking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { tracking_number } = req.body;
        
        const order = await Order.findByPk(id);
        if (!order) {
            throw new ApiError(404, 'Order not found', 'ORDER_NOT_FOUND');
        }
        
        await order.update({ tracking_number });
        
        res.json({
            success: true,
            message: 'Tracking number updated successfully',
            order
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Cancel order (user or admin)
 * 
 * @async
 * @function cancelOrder
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const cancelOrder = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { id } = req.params;
        const userId = req.userId;
        const userRole = req.user.role;
        
        const order = await Order.findByPk(id, {
            include: [
                {
                    model: OrderItem,
                    as: 'items'
                }
            ],
            transaction
        });
        
        if (!order) {
            throw new ApiError(404, 'Order not found', 'ORDER_NOT_FOUND');
        }
        
        // Check if user owns the order or is admin
        if (order.user_id !== userId && userRole !== 'admin') {
            throw new ApiError(403, 'Access denied', 'FORBIDDEN');
        }
        
        // Check if order can be cancelled
        if (order.order_status === 'shipped' || order.order_status === 'delivered') {
            throw new ApiError(400, 'Order cannot be cancelled', 'ORDER_SHIPPED');
        }
        
        // Update order status
        await order.update({ order_status: 'cancelled' }, { transaction });
        
        // Restore stock
        for (const item of order.items) {
            await Product.increment('stock_quantity', {
                by: item.quantity,
                where: { id: item.product_id },
                transaction
            });
        }
        
        await transaction.commit();
        
        res.json({
            success: true,
            message: 'Order cancelled successfully',
            order
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    updatePaymentStatus,
    updateTracking,
    cancelOrder
};