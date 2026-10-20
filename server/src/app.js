require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const setupSwagger = require('./config/swagger');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const blogRoutes = require('./routes/blogRoute');
const reviewRoutes = require('./routes/reviewRoutes');
const customerRoutes = require('./routes/customerRoutes');
const categoryRoutes = require('./routes/categoriesRoutes');
const heroSlideRoutes = require('./routes/heroSlideRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const { router: uploadRoutes } = require('./routes/uploadRoutes');

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/logger');

const app = express();

// If behind a proxy (Render, Railway, nginx, etc.), required for rate limiting by real IP
app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const allowedOrigins = [
  'https://www.pediwajersey.co.ke',
  'https://pediwajersey.co.ke',
  'http://localhost:5173',
  ...(process.env.CORS_ORIGINS || '').split(',').map(o => o.trim().replace(/\/$/, '')).filter(Boolean),
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    console.warn('CORS rejected:', origin, '| allowed:', allowedOrigins);
    return callback(null, false); // don't throw, so it never becomes a 500
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // use '/*splat' if on Express 5

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
  app.use(requestLogger);
}

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/api', limiter);

app.get('/', (req, res) => {
  res.json({ name: 'Jersey Store API', version: '1.0.0', status: 'running' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', uptime: process.uptime() });
});

const swaggerSpec = setupSwagger(app);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/hero-slides', heroSlideRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/analytics', analyticsRoutes);
app.get('/api/swagger', (req, res) => res.json(swaggerSpec));

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;