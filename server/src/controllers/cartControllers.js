import { prisma } from '../config/db.js';

// Get or create cart by sessionId
const getOrCreateCart = async (sessionId) => {
  return await prisma.cart.upsert({
    where:  { sessionId },
    update: {},
    create: { sessionId },
    include: { items: { orderBy: { createdAt: 'asc' } } },
  });
};

// ── GET cart ─────────────────────────────────────────────────────
export const getCart = async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) return res.status(400).json({ message: 'sessionId required' });

    const cart = await getOrCreateCart(sessionId);
    res.json({ status: 'success', data: cart });
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ── ADD item to cart ─────────────────────────────────────────────
export const addToCart = async (req, res) => {
  try {
    const { sessionId, productId, name, image, price, quantity = 1, size, printing } = req.body;
    if (!sessionId || !productId) return res.status(400).json({ message: 'sessionId and productId required' });

    const cart = await getOrCreateCart(sessionId);

    // Check if same product+size+printing combo already exists
    const existing = cart.items.find(item =>
      item.productId === productId &&
      item.size === (size || null) &&
      JSON.stringify(item.printing) === JSON.stringify(printing || null)
    );

    let updatedItem;

    if (existing) {
      // Increase quantity
      updatedItem = await prisma.cartItem.update({
        where: { id: existing.id },
        data:  { quantity: existing.quantity + quantity },
      });
    } else {
      // Add new item
      updatedItem = await prisma.cartItem.create({
        data: {
          cartId:    cart.id,
          productId,
          name,
          image:     image || null,
          price:     parseFloat(price),
          quantity:  parseInt(quantity),
          size:      size   || null,
          printing:  printing || null,
        },
      });
    }

    // Return full updated cart
    const updatedCart = await prisma.cart.findUnique({
      where:   { sessionId },
      include: { items: { orderBy: { createdAt: 'asc' } } },
    });

    res.json({ status: 'success', data: updatedCart });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ── UPDATE item quantity ──────────────────────────────────────────
export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId }   = req.params;

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      await prisma.cartItem.update({
        where: { id: itemId },
        data:  { quantity: parseInt(quantity) },
      });
    }

    const { sessionId } = req.body;
    const cart = await prisma.cart.findUnique({
      where:   { sessionId },
      include: { items: { orderBy: { createdAt: 'asc' } } },
    });

    res.json({ status: 'success', data: cart });
  } catch (err) {
    console.error('Update cart error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ── REMOVE item ───────────────────────────────────────────────────
export const removeFromCart = async (req, res) => {
  try {
    const { itemId }   = req.params;
    const { sessionId } = req.body;

    await prisma.cartItem.delete({ where: { id: itemId } });

    const cart = await prisma.cart.findUnique({
      where:   { sessionId },
      include: { items: { orderBy: { createdAt: 'asc' } } },
    });

    res.json({ status: 'success', data: cart });
  } catch (err) {
    console.error('Remove from cart error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ── CLEAR cart ────────────────────────────────────────────────────
export const clearCart = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const cart = await prisma.cart.findUnique({ where: { sessionId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    res.json({ status: 'success', data: { items: [] } });
  } catch (err) {
    console.error('Clear cart error:', err);
    res.status(500).json({ message: err.message });
  }
};