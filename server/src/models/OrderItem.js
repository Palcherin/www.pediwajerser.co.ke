const { validationResult } = require('express-validator');
const { sequelize, Order, OrderItem, Product } = require('../models');
const { ApiError } = require('../middleware/errorHandler');

const createOrder = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            await t.rollback();
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { customerName, phone, location, houseNumber, deliveryNotes, paymentMethod, orderItems } = req.body;

        const products = await Product.findAll({
            where: { id: orderItems.map(i => i.productId) },
            transaction: t
        });

        let subtotal = 0;
        const lines = orderItems.map(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product) throw new ApiError(400, `Product ${item.productId} not found`, 'INVALID_PRODUCT');
            const qty = parseInt(item.quantity, 10);
            subtotal += Number(product.price) * qty;
            return { product_id: product.id, name: product.name, size: item.size || null,
                     printing: item.printing || null, quantity: qty, price: product.price };
        });

        const deliveryFee = 150; // later: look up by location
        const order = await Order.create({
            user_id: req.userId || null,
            order_number: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            customer_name: customerName,
            customer_phone: phone,
            shipping_address: houseNumber,
            shipping_city: location,
            payment_method: paymentMethod,
            notes: deliveryNotes || null,
            delivery_fee: deliveryFee,
            total_amount: subtotal + deliveryFee,
        }, { transaction: t });

        await OrderItem.bulkCreate(lines.map(l => ({ ...l, order_id: order.id })), { transaction: t });
        await t.commit();

        res.status(201).json({ success: true, message: 'Order created successfully', order });
    } catch (err) {
        await t.rollback();
        next(err);
    }
};