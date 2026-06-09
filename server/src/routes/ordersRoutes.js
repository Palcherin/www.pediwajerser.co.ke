// import express from 'express';
// import * as orderController from '../controllers/orderControllers.js';
// import { protect, adminOnly } from '../middleware/authMiddleware.js';

// const router = express.Router();

// // ── PUBLIC: Guest checkout ──────────────────────────────────────
// router.post('/', orderController.createOrder);

// // ── AUTHENTICATED: Logged-in user's own orders ──────────────────
// // ⚠️ Must come BEFORE /:id or Express matches "my-orders" as an id
// router.get('/my-orders', protect, orderController.getMyOrders);

// // ── ADMIN ONLY ──────────────────────────────────────────────────
// router.get('/',           protect, adminOnly, orderController.getAllOrders);
// router.get('/:id',        protect, adminOnly, orderController.getOrderById);
// router.put('/:id/status', protect, adminOnly, orderController.updateOrderStatus);
// router.delete('/:id',     protect, adminOnly, orderController.deleteOrder);

// export default router;
import express from 'express';
import { createOrder } from '../controllers/orderControllers.js';

const router = express.Router();

// Public — no auth needed
router.post('/', createOrder);

export default router;