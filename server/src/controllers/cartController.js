/**
 * Cart Controller
 *
 * Handles all shopping cart operations (Postgres-backed).
 *
 * @module controllers/cartController
 */

const { Cart, Product } = require('../models');
const { ApiError } = require('../middleware/errorHandler');

// Must match `as:` in Cart.belongsTo(Product, { ..., as: '...' })
const PRODUCT_ALIAS = 'product';

// Columns that actually exist on your Product model
const productAttrs = ['id', 'name', 'price', 'images', 'stockQuantity', 'inStock'];

const firstImage = (images) => {
    if (Array.isArray(images)) return images[0] || null;
    if (typeof images === 'string') {
        try {
            const parsed = JSON.parse(images);
            return Array.isArray(parsed) ? parsed[0] || null : images;
        } catch {
            return images;
        }
    }
    return null;
};

// Treat "no printing" in all its forms as null so matching is reliable
const normPrinting = (p) => {
    if (!p || p.type === 'none' || (!p.name && !p.number)) return null;
    return { type: p.type ?? null, name: p.name ?? '', number: p.number ?? '' };
};
const samePrinting = (a, b) =>
    JSON.stringify(normPrinting(a)) === JSON.stringify(normPrinting(b));

// Flat shape the React pages expect
const formatItem = (item) => {
    const p = item[PRODUCT_ALIAS];
    return {
        id: item.id,
        productId: item.product_id,
        name: p.name,
        image: firstImage(p.images),
        price: Number(p.price),
        size: item.size,
        color: item.color,
        printing: item.printing,
        quantity: item.quantity,
        stock: p.stockQuantity
    };
};

const loadItem = (id) =>
    Cart.findByPk(id, {
        include: [{ model: Product, as: PRODUCT_ALIAS, attributes: productAttrs }]
    });

/**
 * Add item to cart
 */
const addToCart = async (req, res, next) => {
    try {
        const { product_id, size, color, printing } = req.body;
        const quantity = Number(req.body.quantity) || 1;
        const userId = req.userId;

        const product = await Product.findByPk(product_id);
        if (!product) {
            throw new ApiError(404, 'Product not found', 'PRODUCT_NOT_FOUND');
        }
        if (product.inStock === false) {
            throw new ApiError(400, 'Product is not available', 'PRODUCT_INACTIVE');
        }
        if (product.stockQuantity < quantity) {
            throw new ApiError(400, 'Insufficient stock', 'INSUFFICIENT_STOCK');
        }

        // Same product + size + color + printing = same cart line
        const candidates = await Cart.findAll({
            where: { user_id: userId, product_id, size: size || null, color: color || null }
        });
        let cartItem = candidates.find(c => samePrinting(c.printing, printing));

        if (cartItem) {
            const newQuantity = cartItem.quantity + quantity;
            if (product.stockQuantity < newQuantity) {
                throw new ApiError(400, 'Insufficient stock', 'INSUFFICIENT_STOCK');
            }
            await cartItem.update({ quantity: newQuantity });
        } else {
            cartItem = await Cart.create({
                user_id: userId,
                product_id,
                quantity,
                size: size || null,
                color: color || null,
                printing: normPrinting(printing)
            });
        }

        const full = await loadItem(cartItem.id);
        res.status(201).json({
            success: true,
            message: 'Item added to cart',
            cartItem: formatItem(full)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get current user's cart
 */
const getCart = async (req, res, next) => {
    try {
        const cartItems = await Cart.findAll({
            where: { user_id: req.userId },
            include: [{ model: Product, as: PRODUCT_ALIAS, attributes: productAttrs }],
            order: [['added_at', 'DESC']]
        });

        const items = cartItems.filter(i => i[PRODUCT_ALIAS]).map(formatItem);
        const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

        res.json({
            success: true,
            items,
            summary: { item_count: items.length, subtotal }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update cart item quantity (by cart row id)
 */
const updateCartItem = async (req, res, next) => {
    try {
        const quantity = Number(req.body.quantity);
        if (!Number.isInteger(quantity) || quantity < 0) {
            throw new ApiError(400, 'Quantity must be 0 or more', 'INVALID_QUANTITY');
        }

        const cartItem = await Cart.findOne({
            where: { id: req.params.id, user_id: req.userId }
        });
        if (!cartItem) {
            throw new ApiError(404, 'Cart item not found', 'CART_ITEM_NOT_FOUND');
        }

        if (quantity === 0) {
            await cartItem.destroy();
            return res.json({ success: true, message: 'Item removed from cart' });
        }

        const product = await Product.findByPk(cartItem.product_id);
        if (product && product.stockQuantity < quantity) {
            throw new ApiError(400, 'Insufficient stock', 'INSUFFICIENT_STOCK');
        }

        await cartItem.update({ quantity });
        const full = await loadItem(cartItem.id);
        res.json({
            success: true,
            message: 'Cart updated successfully',
            cartItem: formatItem(full)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Remove item from cart (by cart row id)
 */
const removeFromCart = async (req, res, next) => {
    try {
        const cartItem = await Cart.findOne({
            where: { id: req.params.id, user_id: req.userId }
        });
        if (!cartItem) {
            throw new ApiError(404, 'Cart item not found', 'CART_ITEM_NOT_FOUND');
        }
        await cartItem.destroy();
        res.json({ success: true, message: 'Item removed from cart' });
    } catch (error) {
        next(error);
    }
};

/**
 * Clear entire cart
 */
const clearCart = async (req, res, next) => {
    try {
        await Cart.destroy({ where: { user_id: req.userId } });
        res.json({ success: true, message: 'Cart cleared successfully' });
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