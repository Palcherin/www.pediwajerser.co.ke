import express from 'express';
import {
  trackVisit,
  attachOrderToCustomer,
  getAllCustomers,
  getCustomerById,
  toggleCustomerStatus,
} from '../controllers/customerControllers.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public — called by frontend silently
router.post('/track',        trackVisit);
router.post('/attach-order', attachOrderToCustomer);

// Admin only
router.get('/',          protect, adminOnly, getAllCustomers);
router.get('/:id',       protect, adminOnly, getCustomerById);
router.patch('/:id/toggle', protect, adminOnly, toggleCustomerStatus);

export default router;