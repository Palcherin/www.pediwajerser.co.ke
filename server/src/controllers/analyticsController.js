/**
 * Analytics Controller
 *
 * Computes revenue, order, customer and product metrics from existing
 * Order / OrderItem / Product / Category / User data. There is no
 * dedicated "Analytics" table — everything here is aggregated on the fly
 * from tables you already have, so no new Sequelize model was needed.
 *
 * Used by both the Analytics page (date-range driven) and the Sales page
 * (daily/weekly/monthly period driven) — they just pass different query params.
 *
 * @module controllers/analyticsController
 */

const { Op, QueryTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { Order, User } = require('../models');

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Orders in these statuses don't count as real revenue
const NON_REVENUE_STATUSES = ['cancelled'];

// ── Helpers ────────────────────────────────────────────────────────────

const parseDays = (value, fallback = 30) => {
    const n = parseInt(value, 10);
    return Number.isFinite(n) && n > 0 ? n : fallback;
};

// Current period [start, now] and the equal-length period right before it,
// so every metric can report a "% change from last period".
const getRanges = (days) => {
    const now = new Date();
    const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const prevEnd = start;
    const prevStart = new Date(start.getTime() - days * 24 * 60 * 60 * 1000);
    return { now, start, prevStart, prevEnd };
};

const pctChange = (current, previous) => {
    if (!previous) return current > 0 ? 100 : 0;
    return Number((((current - previous) / previous) * 100).toFixed(1));
};

// ── GET /api/analytics/overview?days=30 ──────────────────────────────────
const getOverview = async (req, res, next) => {
    try {
        const days = parseDays(req.query.days);
        const { now, start, prevStart, prevEnd } = getRanges(days);

        const whereCurrent = {
            created_at: { [Op.between]: [start, now] },
            order_status: { [Op.notIn]: NON_REVENUE_STATUSES },
        };
        const wherePrevious = {
            created_at: { [Op.between]: [prevStart, prevEnd] },
            order_status: { [Op.notIn]: NON_REVENUE_STATUSES },
        };

        const [currentRevenue, previousRevenue, currentOrders, previousOrders] = await Promise.all([
            Order.sum('total_amount', { where: whereCurrent }),
            Order.sum('total_amount', { where: wherePrevious }),
            Order.count({ where: whereCurrent }),
            Order.count({ where: wherePrevious }),
        ]);

        const totalRevenue = Number(currentRevenue || 0);
        const totalOrders = currentOrders || 0;
        const avgOrderValue = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;

        const [totalCustomers, newCustomers] = await Promise.all([
            User.count({ where: { role: 'user' } }),
            User.count({ where: { role: 'user', created_at: { [Op.between]: [start, now] } } }),
        ]);

        res.json({
            success: true,
            data: {
                totalRevenue,
                revenueChange: pctChange(totalRevenue, Number(previousRevenue || 0)),
                totalOrders,
                ordersChange: pctChange(totalOrders, previousOrders || 0),
                avgOrderValue,
                totalCustomers,
                newCustomers,
            },
        });
    } catch (error) {
        next(error);
    }
};

// ── GET /api/analytics/revenue-trend?days=180&groupBy=month ──────────────
const getRevenueTrend = async (req, res, next) => {
    try {
        const days = parseDays(req.query.days, 180);
        const groupBy = ['day', 'week', 'month'].includes(req.query.groupBy)
            ? req.query.groupBy
            : (days <= 30 ? 'day' : days <= 120 ? 'week' : 'month');

        const { now, start } = getRanges(days);

        const rows = await sequelize.query(
            `SELECT DATE_TRUNC(:groupBy, created_at) AS bucket,
                    SUM(total_amount) AS revenue,
                    COUNT(*) AS orders
             FROM orders
             WHERE created_at BETWEEN :start AND :now
               AND order_status NOT IN (:excluded)
             GROUP BY bucket
             ORDER BY bucket ASC`,
            {
                replacements: { groupBy, start, now, excluded: NON_REVENUE_STATUSES },
                type: QueryTypes.SELECT,
            }
        );

        const fmt = (d) => {
            const date = new Date(d);
            if (groupBy === 'month') return date.toLocaleDateString('en-US', { month: 'short' });
            if (groupBy === 'week') return `Wk of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        };

        res.json({
            success: true,
            groupBy,
            data: rows.map((r) => ({
                label: fmt(r.bucket),
                revenue: Number(r.revenue || 0),
                orders: Number(r.orders || 0),
            })),
        });
    } catch (error) {
        next(error);
    }
};

// ── GET /api/analytics/top-products?days=30&limit=4 ───────────────────────
const getTopProducts = async (req, res, next) => {
    try {
        const days = parseDays(req.query.days);
        const limit = Math.min(parseInt(req.query.limit, 10) || 4, 20);
        const { now, start } = getRanges(days);

        const rows = await sequelize.query(
            `SELECT oi.product_name AS name,
                    SUM(oi.quantity) AS sales,
                    SUM(oi.total_price) AS revenue
             FROM order_items oi
             JOIN orders o ON o.id = oi.order_id
             WHERE o.created_at BETWEEN :start AND :now
               AND o.order_status NOT IN (:excluded)
             GROUP BY oi.product_name
             ORDER BY revenue DESC
             LIMIT :limit`,
            {
                replacements: { start, now, excluded: NON_REVENUE_STATUSES, limit },
                type: QueryTypes.SELECT,
            }
        );

        res.json({
            success: true,
            data: rows.map((r) => ({
                name: r.name,
                sales: Number(r.sales || 0),
                revenue: Number(r.revenue || 0),
            })),
        });
    } catch (error) {
        next(error);
    }
};

// ── GET /api/analytics/insights?days=30 ────────────────────────────────────
const getInsights = async (req, res, next) => {
    try {
        const days = parseDays(req.query.days);
        const { now, start } = getRanges(days);

        const [bestCategoryRow] = await sequelize.query(
            `SELECT c.name AS name, SUM(oi.total_price) AS revenue
             FROM order_items oi
             JOIN orders o ON o.id = oi.order_id
             JOIN products p ON p.id = oi.product_id
             LEFT JOIN categories c ON c.id = p.category_id
             WHERE o.created_at BETWEEN :start AND :now
               AND o.order_status NOT IN (:excluded)
             GROUP BY c.name
             ORDER BY revenue DESC
             LIMIT 1`,
            { replacements: { start, now, excluded: NON_REVENUE_STATUSES }, type: QueryTypes.SELECT }
        );

        const [peakDayRow] = await sequelize.query(
            `SELECT EXTRACT(DOW FROM created_at) AS dow, SUM(total_amount) AS revenue
             FROM orders
             WHERE created_at BETWEEN :start AND :now
               AND order_status NOT IN (:excluded)
             GROUP BY dow
             ORDER BY revenue DESC
             LIMIT 1`,
            { replacements: { start, now, excluded: NON_REVENUE_STATUSES }, type: QueryTypes.SELECT }
        );

        const [bestProductRow] = await sequelize.query(
            `SELECT oi.product_name AS name, SUM(oi.quantity) AS sales
             FROM order_items oi
             JOIN orders o ON o.id = oi.order_id
             WHERE o.created_at BETWEEN :start AND :now
               AND o.order_status NOT IN (:excluded)
             GROUP BY oi.product_name
             ORDER BY sales DESC
             LIMIT 1`,
            { replacements: { start, now, excluded: NON_REVENUE_STATUSES }, type: QueryTypes.SELECT }
        );

        // Conversion rate needs a visits/sessions count. This assumes a
        // `customer_sessions` table with a `last_seen` timestamp column
        // (seen in your server logs) — adjust the column name below if
        // your actual schema differs. Fails quietly to null rather than
        // breaking the rest of the insights response.
        let conversionRate = null;
        try {
            const [sessionRow] = await sequelize.query(
                `SELECT COUNT(DISTINCT session_id) AS sessions
                 FROM customer_sessions
                 WHERE last_seen BETWEEN :start AND :now`,
                { replacements: { start, now }, type: QueryTypes.SELECT }
            );
            const sessions = Number(sessionRow?.sessions || 0);
            if (sessions > 0) {
                const orderCount = await Order.count({
                    where: {
                        created_at: { [Op.between]: [start, now] },
                        order_status: { [Op.notIn]: NON_REVENUE_STATUSES },
                    },
                });
                conversionRate = Number(((orderCount / sessions) * 100).toFixed(1));
            }
        } catch (sessionErr) {
            conversionRate = null;
        }

        res.json({
            success: true,
            data: {
                bestCategory: bestCategoryRow?.name || null,
                peakSalesDay: peakDayRow ? DAY_NAMES[Number(peakDayRow.dow)] : null,
                bestProduct: bestProductRow?.name || null,
                bestProductSales: bestProductRow ? Number(bestProductRow.sales) : null,
                conversionRate,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getOverview,
    getRevenueTrend,
    getTopProducts,
    getInsights,
};