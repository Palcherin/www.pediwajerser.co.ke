/**
 * Order Controller
 *
 * Handles all order management operations
 *
 * @module controllers/orderController
 */

const { validationResult } = require('express-validator');
const { Order, OrderItem, Product, User } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const { sequelize } = require('../config/database');
const { getDeliveryFee } = require('../config/deliveryZones');
const { notifyNewOrder } = require('../service/notification');

const generateOrderNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `ORD-${timestamp}-${random}`;
};

// 0743666719 / +254743666719 / 254743666719 -> 254743666719
const normalizePhone = (p) => {
    const digits = String(p).replace(/\D/g, '');
    if (digits.startsWith('254')) return digits;
    if (digits.startsWith('0')) return '254' + digits.slice(1);
    return digits;
};

/**
 * Create a new order (guest or logged-in)
 */
const createOrder = async (req, res, next) => {
    // Validate BEFORE opening a transaction
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const transaction = await sequelize.transaction();

    try {
        const {
            customerName, phone, location, houseNumber,
            deliveryNotes, paymentMethod, orderItems
        } = req.body;

        // Delivery fee is decided by the server from zone + payment method,
        // never trusted from the browser
        let deliveryFee;
        try {
            ({ fee: deliveryFee } = getDeliveryFee(location, paymentMethod));
        } catch (feeErr) {
            if (!feeErr.code) throw feeErr; // a real bug, not a customer error
            throw new ApiError(400, feeErr.message, feeErr.code);
        }

        // Lock product rows so two simultaneous orders can't oversell the last kit
        const productIds = [...new Set(orderItems.map(i => Number(i.productId)))];
        const products = await Product.findAll({
            where: { id: productIds },
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        let subtotal = 0;
        const lines = [];

        for (const item of orderItems) {
            const product = products.find(p => p.id === Number(item.productId));
            if (!product) {
                throw new ApiError(400, `Product ${item.productId} not found`, 'INVALID_PRODUCT');
            }

            const qty = parseInt(item.quantity, 10);
            if (product.stock_quantity < qty) {
                throw new ApiError(
                    400,
                    `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}`,
                    'INSUFFICIENT_STOCK'
                );
            }

            const price = Number(product.discount_price || product.price);
            const total = price * qty;
            subtotal += total;

            lines.push({
                product_id: product.id,
                product_name: product.name,
                product_price: price,
                quantity: qty,
                size: item.size && item.size !== 'N/A' ? item.size : null,
                printing: item.printing || null, // needs a printing column on OrderItem
                total_price: total
            });
        }

        const order = await Order.create({
            user_id: req.userId || null,
            order_number: generateOrderNumber(),
            customer_name: customerName,
            customer_phone: normalizePhone(phone),
            shipping_address: houseNumber,
            shipping_city: location,
            payment_method: paymentMethod,
            notes: deliveryNotes || null,
            delivery_fee: deliveryFee,
            total_amount: subtotal + deliveryFee,
            payment_status: 'pending',
            order_status: 'pending'
        }, { transaction });

        for (const line of lines) {
            await OrderItem.create({ order_id: order.id, ...line }, { transaction });
            await Product.decrement('stock_quantity', {
                by: line.quantity,
                where: { id: line.product_id },
                transaction
            });
        }

        await transaction.commit();

        // Email + WhatsApp the shop owner. Not awaited, and failures are only
        // logged, so a notification problem can never fail the customer's order.
        notifyNewOrder(
            {
                id: order.id,
                orderNumber: order.order_number,
                customerName,
                phone: normalizePhone(phone),
                location,
                houseNumber,
                deliveryNotes,
                paymentMethod,
                deliveryFee,
                totalAmount: subtotal + deliveryFee
            },
            lines.map(l => ({
                name: l.product_name,
                size: l.size,
                printing: l.printing,
                quantity: l.quantity,
                price: l.product_price
            }))
        ).catch(err => console.error('[notify] unexpected error:', err.message));

        const completeOrder = await Order.findByPk(order.id, {
            include: [{ model: OrderItem, as: 'items' }]
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
 * Get all orders (admin only)
 * Supports pagination and optional filtering by order/payment status
 * or a search term matched against order number, customer name or phone.
 */
const getAllOrders = async (req, res, next) => {
    try {
        const {
            limit = 20,
            offset = 0,
            status,
            payment_status,
            search
        } = req.query;

        const where = {};
        if (status) where.order_status = status;
        if (payment_status) where.payment_status = payment_status;

        if (search) {
            const { Op } = require('sequelize');
            where[Op.or] = [
                { order_number: { [Op.iLike]: `%${search}%` } },
                { customer_name: { [Op.iLike]: `%${search}%` } },
                { customer_phone: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows } = await Order.findAndCountAll({
            where,
            include: [
                { model: OrderItem, as: 'items' },
                {
                    model: User,
                    as: 'user', // must match Order.belongsTo(User, { as: 'user' })
                    attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
                    required: false // orders can belong to a guest (user_id: null)
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']],
            distinct: true // keeps `count` correct when joining the items table
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
 * Get current user's orders
 */
const getMyOrders = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { limit = 20, offset = 0 } = req.query;

        const { count, rows } = await Order.findAndCountAll({
            where: { user_id: userId },
            include: [{ model: OrderItem, as: 'items' }],
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
 * Get order by ID (owner or admin)
 */
const getOrderById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const userRole = req.user.role;

        const order = await Order.findByPk(id, {
            include: [
                { model: OrderItem, as: 'items' },
                {
                    model: User,
                    as: 'user', // must match Order.belongsTo(User, { as: 'user' })
                    attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
                }
            ]
        });

        if (!order) {
            throw new ApiError(404, 'Order not found', 'ORDER_NOT_FOUND');
        }

        if (order.user_id !== userId && userRole !== 'admin') {
            throw new ApiError(403, 'Access denied', 'FORBIDDEN');
        }

        res.json({ success: true, order });
    } catch (error) {
        next(error);
    }
};

/**
 * Update order status (admin only)
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
 * Track an order by order number + phone (public, rate-limited)
 */
const trackOrder = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Enter your order number and the phone number used at checkout.'
            });
        }

        const orderNumber = String(req.body.orderNumber).trim().toUpperCase();
        const phone = normalizePhone(req.body.phone);

        const order = await Order.findOne({
            where: { order_number: orderNumber, customer_phone: phone },
            include: [{ model: OrderItem, as: 'items' }]
        });

        // Same message for a wrong number or wrong phone, so nobody can probe for valid orders
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'We could not find an order with those details. Check the order number and phone number.'
            });
        }

        res.json({
            success: true,
            order: {
                orderNumber: order.order_number,
                status: order.order_status,
                paymentStatus: order.payment_status,
                paymentMethod: order.payment_method,
                trackingNumber: order.tracking_number,
                city: order.shipping_city,
                createdAt: order.created_at,
                deliveryFee: Number(order.delivery_fee || 0),
                total: Number(order.total_amount),
                items: order.items.map((i) => ({
                    name: i.product_name,
                    quantity: i.quantity,
                    size: i.size,
                    printing: i.printing,
                    total: Number(i.total_price)
                }))
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update tracking number (admin only)
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
 * Cancel order (owner or admin) and restore stock
 */
const cancelOrder = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const userId = req.userId;
        const userRole = req.user.role;

        const order = await Order.findByPk(id, {
            include: [{ model: OrderItem, as: 'items' }],
            transaction
        });

        if (!order) {
            throw new ApiError(404, 'Order not found', 'ORDER_NOT_FOUND');
        }

        if (order.user_id !== userId && userRole !== 'admin') {
            throw new ApiError(403, 'Access denied', 'FORBIDDEN');
        }

        if (order.order_status === 'cancelled') {
            throw new ApiError(400, 'Order already cancelled', 'ALREADY_CANCELLED');
        }

        if (order.order_status === 'shipped' || order.order_status === 'delivered') {
            throw new ApiError(400, 'Order cannot be cancelled', 'ORDER_SHIPPED');
        }

        await order.update({ order_status: 'cancelled' }, { transaction });

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
    getAllOrders,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    updatePaymentStatus,
    updateTracking,
    cancelOrder,
    trackOrder
};