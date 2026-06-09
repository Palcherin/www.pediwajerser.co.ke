import express from 'express';
import {
  getCart, addToCart, updateCartItem,
  removeFromCart, clearCart,
} from '../controllers/cartControllers.js';

const router = express.Router();

router.get('/:sessionId',           getCart);
router.post('/add',                 addToCart);
router.put('/item/:itemId',         updateCartItem);
router.delete('/item/:itemId',      removeFromCart);
router.delete('/clear/:sessionId',  clearCart);

export default router;