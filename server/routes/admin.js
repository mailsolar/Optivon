const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

// Middleware to check admin status
const isAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).send({ error: 'Access denied. Admins only.' });
    }
    next();
};

// Get All Users
router.get('/users', authenticateToken, isAdmin, (req, res) => {
    db.all('SELECT id, email, is_admin, ip_address, created_at FROM users', [], (err, rows) => {
        if (err) return res.status(500).send({ error: 'Database error' });
        res.send(rows);
    });
});

// Get Violations
router.get('/violations', authenticateToken, isAdmin, (req, res) => {
    db.all(`SELECT v.*, u.email 
          FROM violations v 
          JOIN accounts a ON v.account_id = a.id 
          JOIN users u ON a.user_id = u.id`, [], (err, rows) => {
        if (err) return res.status(500).send({ error: 'Database error' });
        res.send(rows);
    });
});

// Get All Accounts (Risk Monitor)
router.get('/accounts', authenticateToken, isAdmin, (req, res) => {
    db.all(`SELECT a.*, u.email 
          FROM accounts a 
          JOIN users u ON a.user_id = u.id`, [], (err, rows) => {
        if (err) return res.status(500).send({ error: 'Database error' });
        res.send(rows);
    });
});

module.exports = router;
