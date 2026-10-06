/**
 * Order Routes
 * 
 * @module routes/orderRoutes
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { 
    trackOrder,
    createOrder, 
    getMyOrders, 
    getAllOrders,
    getOrderById, 
    updateOrderStatus,
    updatePaymentStatus,
    updateTracking,
    cancelOrder
} = require('../controllers/orderController');


// Validation rules
const { authenticate, optionalAuthenticate, authorizeAdmin } = require('../middleware/auth');

const createOrderValidation = [
    body('customerName').trim().notEmpty().withMessage('Name is required'),
    body('phone').trim().matches(/^(?:\+?254|0)[17]\d{8}$/).withMessage('Valid Kenyan phone number required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('houseNumber').trim().notEmpty().withMessage('Address / house number is required'),
    body('deliveryNotes').optional({ checkFalsy: true }).trim(),
    body('paymentMethod').isIn(['MPESA', 'COD','CASH_ON_DELIVERY']).withMessage('Invalid payment method'), // adjust to what you support
    body('orderItems').isArray({ min: 1 }).withMessage('Order must have at least one item'),
    body('orderItems.*.productId').isInt({ min: 1 }),
    body('orderItems.*.quantity').isInt({ min: 1, max: 20 }),
    body('paymentMethod')
    .isIn(['MPESA', 'COD', 'CASH_ON_DELIVERY'])
    .withMessage('Invalid payment method')
];

router.post('/', optionalAuthenticate, createOrderValidation, createOrder);

const updateStatusValidation = [
    body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
        .withMessage('Invalid status')
];

const updatePaymentValidation = [
    body('status').isIn(['pending', 'paid', 'failed'])
        .withMessage('Invalid payment status')
];
console.log({
    optionalAuthenticate: typeof optionalAuthenticate,
    createOrderValidation: typeof createOrderValidation,
    createOrder: typeof createOrder
});

const trackLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many attempts. Please wait a few minutes and try again.' }
});

const trackValidation = [
    body('orderNumber').trim().notEmpty(),
    body('phone').trim().matches(/^(?:\+?254|0)[17]\d{8}$/)
];
/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management endpoints
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order from cart
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shipping_address
 *               - shipping_city
 *               - shipping_state
 *               - shipping_zip
 *               - shipping_country
 *               - payment_method
 *             properties:
 *               shipping_address:
 *                 type: string
 *                 example: 123 Main St, Apt 4B
 *               shipping_city:
 *                 type: string
 *                 example: New York
 *               shipping_state:
 *                 type: string
 *                 example: NY
 *               shipping_zip:
 *                 type: string
 *                 example: 10001
 *               shipping_country:
 *                 type: string
 *                 example: USA
 *               payment_method:
 *                 type: string
 *                 enum: [credit_card, paypal, bank_transfer]
 *                 example: credit_card
 *               notes:
 *                 type: string
 *                 example: Please leave at front door
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Order created successfully
 *                 order:
 * 
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Cart is empty or insufficient stock
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', optionalAuthenticate, createOrderValidation, createOrder);

/**
 * @swagger
 * /api/orders/myorders:
 *   get:
 *     summary: Get current user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of orders per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Pagination offset
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 total:
 *                   type: integer
 *                   example: 5
 *                 limit:
 *                   type: integer
 *                   example: 20
 *                 offset:
 *                   type: integer
 *                   example: 0
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/myorders', authenticate, getMyOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Access denied - order belongs to another user
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', authenticate, getOrderById);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Update order status (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled]
 *                 example: shipped
 *     responses:
 *       200:
 *         description: Order status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Order status updated successfully
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Admin access required
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id/status', authenticate, authorizeAdmin, updateStatusValidation, updateOrderStatus);

/**
 * @swagger
 * /api/orders/{id}/payment:
 *   put:
 *     summary: Update payment status (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, paid, failed]
 *                 example: paid
 *     responses:
 *       200:
 *         description: Payment status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Payment status updated successfully
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Admin access required
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id/payment', authenticate, authorizeAdmin, updatePaymentValidation, updatePaymentStatus);

/**
 * @swagger
 * /api/orders/{id}/tracking:
 *   put:
 *     summary: Update tracking number (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tracking_number
 *             properties:
 *               tracking_number:
 *                 type: string
 *                 example: 1Z999AA10123456784
 *     responses:
 *       200:
 *         description: Tracking number updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Tracking number updated successfully
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Admin access required
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id/tracking', authenticate, authorizeAdmin, updateTracking);

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   put:
 *     summary: Cancel order (User or Admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Order cancelled successfully
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Access denied
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id/cancel', authenticate, cancelOrder);
router.post('/track', trackLimiter, trackValidation, trackOrder);
router.get('/', authenticate, authorizeAdmin, getAllOrders);

module.exports = router;