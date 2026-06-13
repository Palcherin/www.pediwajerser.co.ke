import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB, disconnectDB } from './config/db.js';

import authRoutes      from './routes/authRoutes.js';
import userRoutes      from './routes/userRoutes.js';
import categoryRoutes  from './routes/categoryRoutes.js';
import productRoutes   from './routes/productRoutes.js';
import orderRoutes     from './routes/ordersRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import customerRoutes  from './routes/customerRoutes.js';
import cartRoutes      from './routes/cartRoutes.js';

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ───────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/dashboard',  dashboardRoutes);
app.use('/api/customers',  customerRoutes);
app.use('/api/cart',       cartRoutes);

// ── Static files ─────────────────────────────────────────────────
app.use('/uploads', express.static('uploads'));

// ── Health check ─────────────────────────────────────────────────
app.get('/', (_req, res) =>
  res.json({ message: 'Pedi Wa Jersey API Running 🚀', status: 'ok' })
);

// ── 404 handler ───────────────────────────────────────────────────
app.use((_req, res) =>
  res.status(404).json({ success: false, message: 'Route not found' })
);

// ── Global error handler ──────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

// ── Start ──────────────────────────────────── ─────────────────────
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
};

startServer();

process.on('SIGTERM', async () => { await disconnectDB(); process.exit(0); });
process.on('SIGINT',  async () => { await disconnectDB(); process.exit(0); });