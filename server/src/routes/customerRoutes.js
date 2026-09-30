const express = require('express');
const { sequelize } = require('../config/database');

const router = express.Router();

router.post('/track', async (req, res) => {
    const { sessionId, page, referrer } = req.body || {};
    if (!sessionId || !page) return res.status(400).json({ success: false });

    const sid = String(sessionId).slice(0, 64);
    const pg  = String(page).slice(0, 500);
    const ref = String(referrer || '').slice(0, 500);

    try {
        await sequelize.transaction(async (t) => {
            await sequelize.query(
                `INSERT INTO customer_sessions (session_id, first_page, referrer, page_views)
                 VALUES ($1, $2, $3, 1)
                 ON CONFLICT (session_id) DO UPDATE
                 SET page_views = customer_sessions.page_views + 1, last_seen = NOW()`,
                { bind: [sid, pg, ref], transaction: t }
            );
            await sequelize.query(
                `INSERT INTO page_views (session_id, page, referrer) VALUES ($1, $2, $3)`,
                { bind: [sid, pg, ref], transaction: t }
            );
        });
        res.json({ success: true });
    } catch (err) {
        console.error('Track error:', err.message);
        res.status(500).json({ success: false });
    }
});

module.exports = router;