// src/middleware/adminOnly.js
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';

export const adminOnly = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || user.role !== 'ADMIN')
      return res.status(403).json({ message: 'Admins only' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};