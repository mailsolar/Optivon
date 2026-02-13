const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database');
const { sendOTP, sendPasswordReset } = require('../utils/email');
const { authenticateToken } = require('../middleware/auth');

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

// Helper: Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// 1. Send OTP for Registration
router.post('/send-otp-register', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).send({ error: 'Email required' });

    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
        if (err) return res.status(500).send({ error: 'Database error' });
        if (row) return res.status(400).send({ error: 'Email already registered' });

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60000); // 10 mins

        // Store OTP
        db.run('INSERT INTO otps (email, otp, type, expires_at) VALUES (?, ?, ?, ?)',
            [email, otp, 'registration', expiresAt.toISOString()],
            (err) => {
                if (err) return res.status(500).send({ error: 'Failed to generate OTP' });

                // Send Email
                sendOTP(email, otp)
                    .then(() => res.send({ message: 'OTP sent to email', devOTP: otp })) // Dev Mode: Return OTP
                    .catch(() => res.status(500).send({ error: 'Failed to send email' }));
            }
        );
    });
});

// 2. Register (Verify OTP + Create User)
router.post('/register', async (req, res) => {
    const { email, password, otp } = req.body;

    // Verify OTP
    db.get('SELECT * FROM otps WHERE email = ? AND type = ? ORDER BY created_at DESC LIMIT 1',
        [email, 'registration'],
        async (err, row) => {
            if (err) return res.status(500).send({ error: 'Database error' });
            if (!row || row.otp !== otp) return res.status(400).send({ error: 'Invalid or expired OTP' });

            if (new Date(row.expires_at) < new Date()) {
                return res.status(400).send({ error: 'OTP Expired' });
            }

            try {
                const hash = await bcrypt.hash(password, 10);
                db.run('INSERT INTO users (email, password_hash, email_verified) VALUES (?, ?, 1)',
                    [email, hash],
                    function (err) {
                        if (err) return res.status(500).send({ error: 'Error creating user' });
                        // Clean up OTPs
                        db.run('DELETE FROM otps WHERE email = ?', [email]);
                        res.status(201).send({ message: 'Registered Successfully' });
                    }
                );
            } catch {
                res.status(500).send({ error: 'Server Error' });
            }
        }
    );
});

// 3. Login (Step 1)
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) return res.status(500).send({ error: 'Database error' });
        if (!user) return res.status(400).send({ error: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(400).send({ error: 'Invalid credentials' });

        // Check 2FA
        if (user.two_fa_enabled) {
            return res.send({ require2FA: true, userId: user.id });
        }

        // Issue Token
        const token = jwt.sign({ id: user.id, email: user.email, isAdmin: user.is_admin }, SECRET_KEY, { expiresIn: '24h' });
        res.send({ message: 'Login Successful', token, user: { id: user.id, email: user.email, is_admin: user.is_admin } });
    });
});

// 4. Verify 2FA (Login Step 2)
router.post('/verify-2fa-login', (req, res) => {
    const { userId, pin } = req.body;

    db.get('SELECT * FROM users WHERE id = ?', [userId], async (err, user) => {
        if (err || !user) return res.status(400).send({ error: 'User not found' });

        const match = await bcrypt.compare(pin, user.two_fa_pin);
        if (!match) return res.status(400).send({ error: 'Invalid PIN' });

        const token = jwt.sign({ id: user.id, email: user.email, isAdmin: user.is_admin }, SECRET_KEY, { expiresIn: '24h' });
        res.send({ message: 'Login Successful', token, user: { id: user.id, email: user.email, is_admin: user.is_admin } });
    });
});

// 5. Setup 2FA (Authenticated)
router.post('/setup-2fa', authenticateToken, async (req, res) => {
    const { pin } = req.body;
    if (!pin || pin.length !== 6) return res.status(400).send({ error: 'PIN must be 6 digits' });

    try {
        const pinHash = await bcrypt.hash(pin, 10);
        db.run('UPDATE users SET two_fa_pin = ?, two_fa_enabled = 1 WHERE id = ?',
            [pinHash, req.user.id],
            (err) => {
                if (err) return res.status(500).send({ error: 'Database error' });
                res.send({ message: '2FA Enabled Successfully' });
            }
        );
    } catch {
        res.status(500).send({ error: 'Server Error' });
    }
});

// 6. Forgot Password - Request
router.post('/forgot-password', (req, res) => {
    const { email } = req.body;
    db.get('SELECT id FROM users WHERE email = ?', [email], (err, user) => {
        if (!user) return res.status(404).send({ error: 'Email not found' });

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 15 * 60000); // 15 mins

        db.run('INSERT INTO otps (email, otp, type, expires_at) VALUES (?, ?, ?, ?)',
            [email, otp, 'recovery', expiresAt.toISOString()],
            (err) => {
                if (err) return res.status(500).send({ error: 'Database error' });

                // Construct Link (User will be redirected to this frontend route)
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                const link = `${frontendUrl}/reset-password?email=${email}&code=${otp}`;
                sendPasswordReset(email, link)
                    .then(() => res.send({ message: 'Recovery link sent to email', devLink: link })) // Dev Mode: Return Link
                    .catch(() => res.status(500).send({ error: 'Failed to send email' }));
            }
        );
    });
});

// 7. Reset Password
router.post('/reset-password', async (req, res) => {
    const { email, code, newPassword } = req.body;

    db.get('SELECT * FROM otps WHERE email = ? AND type = ? ORDER BY created_at DESC LIMIT 1',
        [email, 'recovery'],
        async (err, row) => {
            if (err) return res.status(500).send({ error: 'Database check failed' });
            if (!row || row.otp !== code) return res.status(400).send({ error: 'Invalid or expired link' });

            if (new Date(row.expires_at) < new Date()) {
                return res.status(400).send({ error: 'Link Expired' });
            }

            try {
                const hash = await bcrypt.hash(newPassword, 10);
                db.run('UPDATE users SET password_hash = ? WHERE email = ?',
                    [hash, email],
                    (err) => {
                        if (err) return res.status(500).send({ error: 'Database update failed' });
                        db.run('DELETE FROM otps WHERE email = ?', [email]);
                        res.send({ message: 'Password reset successfully' });
                    }
                );
            } catch {
                res.status(500).send({ error: 'Server Error' });
            }
        }
    );
});


// Me Route
router.get('/me', authenticateToken, (req, res) => {
    try {
        db.get('SELECT id, email, is_admin, two_fa_enabled FROM users WHERE id = ?', [req.user.id], (err, user) => {
            if (err) {
                console.error('[Auth] /me DB Error:', err);
                return res.status(500).send({ error: 'Database error' });
            }
            if (!user) {
                console.warn('[Auth] /me User not found for ID:', req.user.id);
                return res.status(404).send({ error: 'User not found' });
            }
            res.send({ user });
        });
    } catch (e) {
        console.error('[Auth] /me Unexpected Error:', e);
        res.status(500).send({ error: 'Server Error' });
    }
});

module.exports = router;
