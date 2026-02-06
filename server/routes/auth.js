const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const db = require('../database'); // Adjust path
const { SECRET_KEY, authenticateToken } = require('../middleware/auth');

// Get Me
router.get('/me', authenticateToken, (req, res) => {
    db.get('SELECT id, email, is_admin, two_fa_secret FROM users WHERE id = ?', [req.user.id], (err, row) => {
        if (err || !row) return res.status(404).send({ error: 'User not found' });

        // Derive name from email (e.g., john.doe@... -> John Doe)
        const namePart = row.email.split('@')[0];
        const name = namePart.split('.').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');

        res.send({ user: { id: row.id, email: row.email, name, isAdmin: row.is_admin, has2FA: !!row.two_fa_secret } });
    });
});

// Register
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    // Anti-Duplication: Check IP limit (Relaxed for dev)
    db.get('SELECT COUNT(*) as count FROM users WHERE ip_address = ?', [ip], async (err, row) => {
        if (err) return res.status(500).send({ error: 'Database error' });

        if (row && row.count >= 10) {
            return res.status(403).send({ error: 'Anti-Cheat: Maximum accounts reached for this IP address.' });
        }

        try {
            const hash = await bcrypt.hash(password, 10);
            db.run('INSERT INTO users (email, password_hash, ip_address) VALUES (?, ?, ?)', [email, hash, ip], function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).send({ error: 'Email already registered' });
                    }
                    return res.status(500).send({ error: 'Registration failed' });
                }
                res.status(201).send({ message: 'User registered successfully', userId: this.lastID });
            });
        } catch (e) {
            res.status(500).send({ error: 'Server error' });
        }
    });
});

// Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) return res.status(500).send({ error: 'Database error' });
        if (!user) return res.status(401).send({ error: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(401).send({ error: 'Invalid credentials' });

        // Generate JWT
        const token = jwt.sign({ id: user.id, email: user.email, isAdmin: user.is_admin }, SECRET_KEY, { expiresIn: '24h' });

        // Derive name
        const namePart = user.email.split('@')[0];
        const name = namePart.split('.').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');

        res.send({ token, user: { id: user.id, email: user.email, name, isAdmin: user.is_admin, has2FA: !!user.two_fa_secret } });
    });
});

// 2FA Setup (Protected)
router.post('/2fa/setup', authenticateToken, (req, res) => {
    const secret = speakeasy.generateSecret({ name: `Optivon (${req.user.email})` });

    // Store temp secret? Ideally we store it only after verification, but for simplicity we can update DB now or send code to verify.
    // We'll return the secret and QR code, client must verify to save it permanently.
    // Actually, let's just save it.

    db.run('UPDATE users SET two_fa_secret = ? WHERE id = ?', [secret.base32, req.user.id], (err) => {
        if (err) return res.status(500).send({ error: 'Database error' });

        QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
            res.send({ secret: secret.base32, qrCode: data_url });
        });
    });
});

// 2FA Verify (Can be used for setup confirmation or login challenge)
router.post('/2fa/verify', async (req, res) => {
    const { token, userId } = req.body;

    if (!userId) return res.status(400).send({ error: 'User ID required' });

    db.get('SELECT * FROM users WHERE id = ?', [userId], async (err, user) => {
        if (err || !user) return res.status(404).send({ error: 'User not found' });

        if (!user.two_fa_secret) return res.status(400).send({ error: '2FA not setup for this user' });

        const verified = speakeasy.totp.verify({
            secret: user.two_fa_secret,
            encoding: 'base32',
            token: token
        });

        if (verified) {
            // Generate JWT
            const authToken = jwt.sign({ id: user.id, email: user.email, isAdmin: user.is_admin }, SECRET_KEY, { expiresIn: '24h' });

            // Derive name
            const namePart = user.email.split('@')[0];
            const name = namePart.split('.').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');

            res.send({
                verified: true,
                token: authToken,
                user: { id: user.id, email: user.email, name, isAdmin: user.is_admin, has2FA: true }
            });
        } else {
            res.send({ verified: false });
        }
    });
});

module.exports = router;
