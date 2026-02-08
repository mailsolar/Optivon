const express = require('express');
const router = express.Router();
const db = require('../database');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'optivon_secret_key_123';

// Middleware to check Admin
const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        if (!user.isAdmin) return res.status(403).json({ error: 'Admin privileges required' });
        req.user = user;
        next();
    });
};

router.use(verifyAdmin);

// 1. Dashboard Stats
router.get('/stats', (req, res) => {
    const stats = {};

    // Parallel queries for efficiency
    db.serialize(() => {
        db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            stats.totalUsers = row.count;

            db.get("SELECT COUNT(*) as count FROM accounts WHERE status = 'active'", (err, row) => {
                stats.activeChallenges = row.count;

                db.get("SELECT COUNT(*) as count FROM accounts WHERE status = 'failed'", (err, row) => {
                    stats.failedAccounts = row.count;

                    db.get("SELECT SUM(amount) as revenue FROM payments WHERE status = 'completed'", (err, row) => {
                        // Mock revenue if table doesn't exist or is empty
                        stats.revenue = row ? row.revenue || 125000 : 125000;
                        res.json(stats);
                    });
                });
            });
        });
    });
});

// 2. User Management
router.get('/users', (req, res) => {
    db.all(`SELECT id, email, created_at, is_admin FROM users ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 3. Risk Dashboard (Active Accounts with Drawdown)
router.get('/risk-monitor', (req, res) => {
    // Get all active accounts with their current equity and balance
    db.all(`SELECT id, user_id, size, balance, equity, daily_start_balance, type, phase 
            FROM accounts WHERE status = 'active'`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        // Calculate Drawdown % for each
        const report = rows.map(acc => {
            const currentDD = (acc.size - acc.equity) / acc.size * 100;
            const dailyStart = acc.daily_start_balance || acc.balance;
            const dailyDD = (dailyStart - acc.equity) / dailyStart * 100;

            return {
                ...acc,
                currentDD: currentDD.toFixed(2),
                dailyDD: dailyDD.toFixed(2),
                isDanger: currentDD > 8 || dailyDD > 4 // Flag if close to breach
            };
        });

        res.json(report);
    });
});

// 4. Update User Role (Ban/Promote)
router.post('/user-role', (req, res) => {
    const { userId, isAdmin } = req.body;
    db.run("UPDATE users SET is_admin = ? WHERE id = ?", [isAdmin ? 1 : 0, userId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User role updated' });
    });
});

module.exports = router;
