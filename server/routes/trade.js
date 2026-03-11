const express = require('express');
const router = express.Router();
const OrderManager = require('../engine/orderManager');
const { authenticateToken } = require('../middleware/auth');
const db = require('../database');

// Purchase Challenge
router.post('/purchase', authenticateToken, (req, res) => {
    const { type, size } = req.body;

    // Check for existing active/pending challenges of the same type/size
    db.get('SELECT COUNT(*) as count FROM accounts WHERE user_id = ? AND size = ? AND status IN (?, ?)',
        [req.user.id, size, 'pending', 'active'],
        (err, row) => {
            if (err) return res.status(500).send({ error: 'Database check failed' });

            if (row.count > 0) {
                return res.status(400).send({ error: 'You already have an active or pending challenge of this level. Please complete or reset it first.' });
            }

            // Create Account
            db.run(`INSERT INTO accounts (user_id, type, size, balance, equity, daily_start_balance, status, phase) 
                    VALUES (?, ?, ?, ?, ?, ?, 'pending', 1)`,
                [req.user.id, type, size, size, size, size],
                function (err) {
                    if (err) return res.status(500).send({ error: 'Purchase failed' });
                    res.status(201).send({ message: 'Challenge Purchased', accountId: this.lastID });
                }
            );
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

// Get Comprehensive Account Metrics
router.get('/account/:id/metrics', authenticateToken, (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    db.get('SELECT * FROM accounts WHERE id = ? AND user_id = ?', [id, userId], (err, account) => {
        if (err || !account) return res.status(404).send({ error: 'Account not found' });

        // Get Trade History
        db.all('SELECT * FROM trades WHERE account_id = ? ORDER BY close_time DESC, open_time DESC', [id], (err, trades) => {
            if (err) return res.status(500).send({ error: 'Failed to fetch trades' });

            // Calculate Daily Summary
            const dailyStats = {};
            let runningBalance = account.size; // Start from initial size? Or work backwards from current balance?
            // Working backwards is harder if we don't have all transactions (deposits/withdrawals).
            // Let's rely on trade history sum.

            // Build Daily Summary from Trades
            trades.forEach(trade => {
                if (trade.status === 'closed' && trade.close_time) {
                    const date = new Date(trade.close_time).toLocaleDateString();
                    if (!dailyStats[date]) {
                        dailyStats[date] = { date, result: 0, trades: 0 };
                    }
                    dailyStats[date].result += trade.pnl;
                    dailyStats[date].trades += 1;
                }
            });

            // Convert to Array and Sort
            const dailySummary = Object.values(dailyStats).sort((a, b) => new Date(b.date) - new Date(a.date));

            // Chart Data (Equity Curve)
            // Simplified: Start with current balance and subtract PnL backwards?
            // Or start with Size and add PnL forwards?
            // Let's do Forwards from Account Start Date
            let currentEquity = account.size;
            const chartData = [{ date: new Date(account.created_at).toLocaleDateString(), equity: account.size }];

            // We need to replay trades chronologically for the chart
            const chronologyTrades = [...trades].sort((a, b) => new Date(a.close_time || a.open_time) - new Date(b.close_time || b.open_time));

            chronologyTrades.forEach(t => {
                if (t.status === 'closed') {
                    currentEquity += t.pnl;
                    const date = new Date(t.close_time).toLocaleDateString();
                    // Update or Add entry for this date
                    const existing = chartData.find(d => d.date === date);
                    if (existing) {
                        existing.equity = currentEquity;
                    } else {
                        chartData.push({ date, equity: currentEquity });
                    }
                }
            });

            res.send({
                account,
                trades,
                dailySummary,
                chartData
            });
        });
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

// Get Trade History (Filled Orders)
router.get('/history/:accountId', authenticateToken, (req, res) => {
    const { accountId } = req.params;
    db.all('SELECT * FROM trades WHERE account_id = ? ORDER BY open_time DESC LIMIT 50', [accountId], (err, rows) => {
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

// Update Position (TP / SL Modification)
router.post('/update-position', authenticateToken, async (req, res) => {
    try {
        const { positionId, sl, tp } = req.body;

        if (!positionId) return res.status(400).send({ error: 'Missing Position ID' });

        // Authenticate ownership
        const trade = await new Promise((resolve, reject) => {
            db.get(`SELECT t.* FROM trades t
                    JOIN accounts a ON t.account_id = a.id
                    WHERE t.id = ? AND a.user_id = ?`,
                [positionId, req.user.id], (err, row) => resolve(row));
        });

        if (!trade || trade.status !== 'open') return res.status(400).send({ error: 'Invalid or Closed Trade' });

        // Validate SL/TP logic based on side
        const price = trade.entry_price;
        if (sl !== undefined && sl !== null && sl !== '') {
            const numSl = parseFloat(sl);
            if (trade.side === 'buy' && numSl >= price) return res.status(400).send({ error: 'SL must be below Entry' });
            if (trade.side === 'sell' && numSl <= price) return res.status(400).send({ error: 'SL must be above Entry' });
        }

        // Apply Update
        db.run(
            "UPDATE trades SET sl = ?, tp = ? WHERE id = ?",
            [sl || null, tp || null, positionId],
            (err) => {
                if (err) return res.status(500).send({ error: 'Failed to update position' });
                res.send({ message: 'Position Updated Successfully', sl, tp });
            }
        );
    } catch (e) {
        console.error("Update Position Error:", e);
        res.status(500).send({ error: 'Update Failed' });
    }
});

// Close Position
router.post('/close', authenticateToken, async (req, res) => {
    try {
        const { tradeId, positionId } = req.body;
        const id = tradeId || positionId;

        if (!id) return res.status(400).send({ error: 'Missing Position ID' });

        const trade = await new Promise((resolve, reject) => {
            db.get("SELECT * FROM trades WHERE id = ?", [id], (err, row) => resolve(row));
        });

        if (!trade || trade.status !== 'open') return res.status(400).send({ error: 'Invalid Trade' });

        // Get current price
        let closePrice = await OrderManager.fetchPrice(trade.symbol);

        // If price unavailable, maybe allow a "forced close" at entry price or return error?
        // Let's assume error for now to prevent massive account damage
        if (!closePrice) {
            return res.status(400).send({ error: 'Market Data Unavailable (Cannot Close)' });
        }

        // Execute Close
        await OrderManager.executeClose(trade, closePrice, 'MANUAL_CLOSE');
        res.send({ message: 'Position Closed' });

    } catch (e) {
        console.error("Close Error:", e);
        res.status(500).send({ error: 'Close Failed' });
    }
});


module.exports = router;
