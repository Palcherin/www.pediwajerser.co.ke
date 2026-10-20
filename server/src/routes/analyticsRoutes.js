/**
 * Analytics Routes
 *
 * All routes are admin-only — they power the Analytics and Sales
 * dashboard pages, both of which call the same underlying endpoints
 * with different query parameters (date-range vs daily/weekly/monthly).
 *
 * @module routes/analyticsRoutes
 */

const express = require('express');
const router = express.Router();

const {
    getOverview,
    getRevenueTrend,
    getTopProducts,
    getInsights
} = require('../controllers/analyticsController');

const { authenticate, authorizeAdmin } = require('../middleware/auth');

// GET /api/analytics/overview?days=30
router.get('/overview', authenticate, authorizeAdmin, getOverview);

// GET /api/analytics/revenue-trend?days=180&groupBy=month
router.get('/revenue-trend', authenticate, authorizeAdmin, getRevenueTrend);

// GET /api/analytics/top-products?days=30&limit=4
router.get('/top-products', authenticate, authorizeAdmin, getTopProducts);

// GET /api/analytics/insights?days=30
router.get('/insights', authenticate, authorizeAdmin, getInsights);

module.exports = router;