import express from 'express';
import * as userController from '../controllers/userControllers.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// ====================== PUBLIC AUTH ROUTES ======================
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/logout', userController.logoutUser);

// ====================== PROTECTED USER ROUTES ======================
router.get('/profile', protect, userController.getUserProfile);
router.put('/profile', protect, userController.updateProfile);

// ====================== ADMIN ONLY ROUTES ======================
router.get('/', protect, adminOnly, userController.getAllUsers);
router.get('/:id', protect, adminOnly, userController.getUserById);
router.put('/:id', protect, adminOnly, userController.updateUser);
router.delete('/:id', protect, adminOnly, userController.deleteUser);


router.get('/check-admin', async (req, res) => {
  const admin = await prisma.user.findUnique({ where: { email: 'admin@citysports.co.ke' } });
  res.json({ 
    exists: !!admin,
    role: admin?.role,
    hasPassword: !!admin?.password
  });
});
export default router;