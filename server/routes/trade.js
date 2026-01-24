const express = require('express');
const router = express.Router();
const OrderManager = require('../engine/orderManager');
const { authenticateToken } = require('../middleware/auth');
const db = require('../database');

// Purchase Challenge
router.post('/purchase', authenticateToken, (req, res) => {
    const { type, size } = req.body;
    // Simplified logic: Create active account immediately? 
    // Or create 'pending' account that needs 'launch'?
    // User requirement: "after which the challeneg they chose will be shown int their profile and after clicking launch terminal their timing should start"
    // So status = 'pending' initially.

    // ALLOW MULTIPLE ACCOUNTS - Removed restriction check
    db.run(`INSERT INTO accounts (user_id, type, size, balance, equity, daily_start_balance, status, phase) 
            VALUES (?, ?, ?, ?, ?, ?, 'pending', 1)`,
        [req.user.id, type, size, size, size, size],
        function (err) {
            if (err) return res.status(500).send({ error: 'Purchase failed' });
            res.status(201).send({ message: 'Challenge Purchased', accountId: this.lastID });
        }
    );
});

// Launch Session (24h Timer)
router.post('/launch', authenticateToken, (req, res) => {
    const { accountId } = req.body;

    db.get('SELECT * FROM accounts WHERE id = ? AND user_id = ?', [accountId, req.user.id], (err, row) => {
        if (err || !row) return res.status(404).send({ error: 'Account not found' });

        const now = new Date();

        // If already active, check expiry
        if (row.status === 'active') {
            if (new Date(row.session_expires) > now) {
                return res.send({ message: 'Session Active', expires: row.session_expires });
            } else {
                return res.status(403).send({ error: 'Session Expired' });
            }
        }

        if (row.status !== 'pending') {
            return res.status(400).send({ error: 'Challenge cannot be launched (Invalid Status)' });
        }

        // Activate new session (24 hours)
        const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        db.run(`UPDATE accounts SET status = 'active', session_start = ?, session_expires = ? WHERE id = ?`,
            [now.toISOString(), expires.toISOString(), accountId],
            (err) => {
                if (err) return res.status(500).send({ error: 'Failed to launch' });
                res.send({ message: 'Session Launched', expires: expires });
            }
        );
    });
});

// Get User Accounts
router.get('/accounts', authenticateToken, (req, res) => {
    db.all('SELECT * FROM accounts WHERE user_id = ? ORDER BY id DESC', [req.user.id], (err, rows) => {
        if (err) return res.status(500).send({ error: 'Database error' });

        // Check for expiry on read (lazy expiry)
        const now = new Date();
        const updatedRows = rows.map(r => {
            if (r.status === 'active' && r.session_expires && new Date(r.session_expires) < now) {
                // Update DB async
                db.run("UPDATE accounts SET status = 'expired' WHERE id = ?", [r.id]);
                return { ...r, status: 'expired' };
            }
            return r;
        });

        res.send(updatedRows);
    });
});

// Place Order
router.post('/place', authenticateToken, async (req, res) => {
    try {
        const { accountId, symbol, side, lots, type } = req.body;

        // Verify Account and Status
        const account = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM accounts WHERE id = ?', [accountId], (err, row) => {
                if (err) reject(new Error('Database Error'));
                resolve(row);
            });
        });

        if (!account) return res.status(404).send({ error: 'Account not found' });
        if (account.user_id !== req.user.id) return res.status(403).send({ error: 'Unauthorized' });

        // Strict Active Check
        if (account.status !== 'active') return res.status(403).send({ error: 'Account is not active' });

        // Session Check
        if (new Date(account.session_expires) < new Date()) {
            return res.status(403).send({ error: 'Session Expired' });
        }

        const result = await OrderManager.placeOrder(req.user.id, { accountId, symbol, side, lots, type, accountSize: account.size });
        res.status(200).send(result);
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

// Get Positions
router.get('/positions/:accountId', authenticateToken, (req, res) => {
    const { accountId } = req.params;
    db.all('SELECT * FROM trades WHERE account_id = ? AND status = "open"', [accountId], (err, rows) => {
        if (err) return res.status(500).send({ error: 'Database error' });
        res.send(rows);
    });
});

module.exports = router;
