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

// Place Order (Market or Limit)
router.post('/place', authenticateToken, async (req, res) => {
    try {
        const { accountId, symbol, side, lots, type, price, sl, tp } = req.body;

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

        let result;
        if (type === 'limit') {
            result = await OrderManager.placeLimitOrder(req.user.id, { accountId, symbol, side, lots, price, accountSize: account.size, sl, tp });
        } else {
            result = await OrderManager.placeOrder(req.user.id, { accountId, symbol, side, lots, type, accountSize: account.size, sl, tp });
        }

        res.status(200).send(result);
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

// Get Single Account Details
router.get('/account/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM accounts WHERE id = ? AND user_id = ?', [id, req.user.id], (err, row) => {
        if (err) return res.status(500).send({ error: 'Database error' });
        if (!row) return res.status(404).send({ error: 'Account not found' });
        res.send(row);
    });
});

// Get All Positions (User level)
router.get('/positions', authenticateToken, (req, res) => {
    // Join trades with accounts to verify user ownership
    const query = `
        SELECT t.* 
        FROM trades t
        JOIN accounts a ON t.account_id = a.id
        WHERE a.user_id = ? AND t.status = 'open'
        ORDER BY t.id DESC
    `;
    db.all(query, [req.user.id], (err, rows) => {
        if (err) return res.status(500).send({ error: 'Database error' });
        res.send(rows);
    });
});

// Get Positions (Account specific)
router.get('/positions/:accountId', authenticateToken, (req, res) => {
    const { accountId } = req.params;
    db.all('SELECT * FROM trades WHERE account_id = ? AND status = "open" ORDER BY id DESC', [accountId], (err, rows) => {
        if (err) return res.status(500).send({ error: 'Database error' });
        res.send(rows);
    });
});

// Get Pending Orders
router.get('/orders/:accountId', authenticateToken, (req, res) => {
    const { accountId } = req.params;
    db.all('SELECT * FROM limit_orders WHERE account_id = ? AND status = "pending" ORDER BY id DESC', [accountId], (err, rows) => {
        if (err) return res.status(500).send({ error: 'Database error' });
        res.send(rows);
    });
});

// Cancel Order
router.post('/cancel', authenticateToken, (req, res) => {
    const { orderId } = req.body;
    db.run("UPDATE limit_orders SET status = 'cancelled' WHERE id = ?", [orderId], (err) => {
        if (err) return res.status(500).send({ error: 'Database error' });
        res.send({ message: 'Order Cancelled' });
    });
});

// Close Position
router.post('/close', authenticateToken, (req, res) => {
    const { tradeId } = req.body;
    // Logic to close trade... (Simulated immediate close at market)
    // We can reuse OrderManager.executeClose if we exposed it or simplified logic here
    db.get("SELECT * FROM trades WHERE id = ?", [tradeId], (err, trade) => {
        if (err || !trade || trade.status !== 'open') return res.status(400).send({ error: 'Invalid Trade' });

        // Get Market Price
        // This requires 'market' instance access or we just trust the request? 
        // Better to require 'market' engine tick.
        const market = require('../engine/market');
        const quote = market.getQuote(trade.symbol);
        if (!quote) return res.status(400).send({ error: 'Market Closed' });

        const price = trade.side === 'buy' ? quote.bid : quote.ask;
        // Call OrderManager to execute close to ensure Balance updates
        OrderManager.executeClose(trade, price, 'MANUAL_CLOSE');
        res.send({ message: 'Position Closed' });
    });
});

module.exports = router;
