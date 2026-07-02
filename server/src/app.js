/**
 * Express Application Configuration
 * 
 * Configures the Express app with middleware, routes, and error handling.
 * 
 * @module app
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

// Import middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/logger');

// Initialize Express app
const app = express();

/**
 * Rate limiting configuration
 * Prevents brute force attacks and API abuse
 */
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * CORS Configuration
 * Allows cross-origin requests from specified origins
 */
const corsOptions = {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Apply middleware
app.use(helmet()); // Security headers
app.use(compression()); // Response compression
app.use(cors(corsOptions)); // Cross-origin resource sharing
app.use(express.json({ limit: '10mb' })); // JSON body parser
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // URL-encoded body parser

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined')); // HTTP request logging
    app.use(requestLogger); // Custom request logger
}

// Apply rate limiting to all routes
app.use('/api', limiter);

/**
 * Welcome Route
 * Root endpoint with API information
 */
app.get('/', (req, res) => {
    res.json({
        name: 'Jersey Store API',
        version: '1.0.0',
        description: 'E-commerce backend for jersey store',
        endpoints: {
            health: '/health',
            api: '/api',
            documentation: '/api-docs'
        },
        status: 'running',
        environment: process.env.NODE_ENV
    });
});

/**
 * Health Check Endpoint
 * Used for monitoring and load balancer health checks
 */
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV
    });
});

/**
 * API Routes
 * Grouped by resource with proper versioning
 */
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

// API documentation route placeholder
app.get('/api-docs', (req, res) => {
    res.json({
        message: 'API Documentation will be available here',
        version: '1.0.0',
        endpoints: [
            {
                resource: 'Authentication',
                base: '/api/auth',
                endpoints: ['POST /register', 'POST /login', 'GET /profile', 'PUT /profile']
            },
            {
                resource: 'Products',
                base: '/api/products',
                endpoints: ['GET /', 'GET /:id', 'POST / (admin)', 'PUT /:id (admin)', 'DELETE /:id (admin)']
            },
            {
                resource: 'Cart',
                base: '/api/cart',
                endpoints: ['GET /', 'POST /add', 'PUT /update', 'DELETE /remove', 'DELETE /clear']
            },
            {
                resource: 'Orders',
                base: '/api/orders',
                endpoints: ['GET /', 'POST /', 'GET /:id', 'PUT /:id/status (admin)']
            }
        ]
    });
});

// 404 handler
app.use(notFoundHandler);

// Error handler middleware (must be last)
app.use(errorHandler);

module.exports = app;