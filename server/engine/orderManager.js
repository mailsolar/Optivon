const db = require('../database');
const market = require('./market');

class OrderManager {
    async placeOrder(userId, { accountId, symbol, side, lots, type, accountSize, sl, tp }) {
        // 1. Enforce Lot Limits
        const maxLots = this.getMaxLots(accountSize, symbol);
        if (lots > maxLots) {
            throw new Error(`Lot limit exceeded. Max for ${symbol} on $${accountSize} is ${maxLots} lots.`);
        }

        const quote = market.getQuote(symbol);
        if (!quote) throw new Error('Market Closed / No Quote');

        // 2. Leverage Check
        const price = side === 'buy' ? quote.ask : quote.bid;
        const contractSize = symbol === 'NIFTY' ? 50 : 15;
        const totalValue = price * lots * contractSize;

        // Leverage: High Leverage for NIFTY (100x)
        const leverage = 100;
        const requiredMargin = totalValue / leverage;

        // Check Balance (Pseudo)
        const account = await this.getAccount(accountId);
        if (account.equity < requiredMargin) {
            throw new Error(`Insufficient Margin. Req: $${requiredMargin.toFixed(2)}`);
        }

        // Validate SL/TP
        if (sl) {
            if (side === 'buy' && sl >= price) throw new Error('SL must be below Entry Price for Buy');
            if (side === 'sell' && sl <= price) throw new Error('SL must be above Entry Price for Sell');
        }
        if (tp) {
            if (side === 'buy' && tp <= price) throw new Error('TP must be above Entry Price for Buy');
            if (side === 'sell' && tp >= price) throw new Error('TP must be below Entry Price for Sell');
        }

        // 3. Execution with Slippage
        // Simulated Slippage: +/- 0.05% max mechanism
        const slippagePct = (Math.random() - 0.5) * 0.001;
        const executionPrice = price * (1 + slippagePct);

        return new Promise((resolve, reject) => {
            db.run(`INSERT INTO trades (account_id, symbol, side, lots, entry_price, sl, tp, status, pnl) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, 'open', 0)`,
                [accountId, symbol, side, lots, executionPrice, sl || null, tp || null],
                function (err) {
                    if (err) return reject(err);
                    resolve({
                        message: 'Order Filled',
                        status: 'filled',
                        fillPrice: executionPrice,
                        slippage: executionPrice - price,
                        orderId: this.lastID
                    });
                }
            );
        });
    }

    async placeLimitOrder(userId, { accountId, symbol, side, lots, price, accountSize, sl, tp }) {
        // 1. Enforce Lot Limits
        const maxLots = this.getMaxLots(accountSize, symbol);
        if (lots > maxLots) {
            throw new Error(`Lot limit exceeded. Max for ${symbol} on $${accountSize} is ${maxLots} lots.`);
        }

        return new Promise((resolve, reject) => {
            db.run(`INSERT INTO limit_orders (account_id, symbol, side, lots, limit_price, sl, tp, status) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
                [accountId, symbol, side, lots, price, sl || null, tp || null],
                function (err) {
                    if (err) return reject(err);
                    resolve({
                        message: 'Limit Order Placed',
                        orderId: this.lastID
                    });
                }
            );
        });
    }

    startMatchingEngine() {
        console.log("Matching Engine Started");
        setInterval(() => {
            try { this.matchOrders(); } catch (e) { console.error("MatchOrders Error:", e); }
        }, 1000);
        setInterval(() => {
            try { this.monitorStops(); } catch (e) { console.error("MonitorStops Error:", e); }
        }, 1000);
        setInterval(() => {
            try { this.monitorEquity(); } catch (e) { console.error("MonitorEquity Error:", e); }
        }, 2000);
    }

    // New: Sync Floating Equity to DB for real-time frontend updates
    monitorEquity() {
        try {
            // Get all active accounts with open trades
            const query = `
                SELECT t.account_id, t.symbol, t.side, t.lots, t.entry_price, a.balance 
                FROM trades t 
                JOIN accounts a ON t.account_id = a.id 
                WHERE t.status = 'open'
            `;

            db.all(query, [], (err, rows) => {
                if (err) {
                    console.error("monitorEquity DB Error:", err);
                    return;
                }
                if (!rows || rows.length === 0) return;

                try {
                    // Group trades by account
                    const accountTrades = {};
                    rows.forEach(row => {
                        if (!accountTrades[row.account_id]) {
                            accountTrades[row.account_id] = { balance: row.balance, trades: [] };
                        }
                        accountTrades[row.account_id].trades.push(row);
                    });

                    // Calculate Equity for each account
                    Object.keys(accountTrades).forEach(accountId => {
                        const { balance, trades } = accountTrades[accountId];
                        let floatingPnL = 0;

                        trades.forEach(trade => {
                            const quote = market.getQuote(trade.symbol);
                            if (quote) {
                                const price = trade.side === 'buy' ? quote.bid : quote.ask;
                                const diff = trade.side === 'buy' ? price - trade.entry_price : trade.entry_price - price;
                                const contractSize = trade.symbol === 'NIFTY' ? 50 : 15;
                                floatingPnL += diff * trade.lots * contractSize;
                            }
                        });

                        // Update DB
                        const equity = balance + floatingPnL;
                        // Use a safe wrapper or try-catch for the update too, though db.run handles its own err
                        db.run("UPDATE accounts SET equity = ? WHERE id = ?", [equity, accountId], (err) => {
                            if (err) console.error("Update Equity Error:", err);
                        });
                    });
                } catch (innerErr) {
                    console.error("monitorEquity Logic Error:", innerErr);
                }
            });
        } catch (e) {
            console.error("monitorEquity Fatal Error:", e);
        }
    }

    // Monitor Open Trades for SL/TP Hits
    monitorStops() {
        db.all("SELECT * FROM trades WHERE status = 'open'", [], (err, trades) => {
            if (err) { console.error("monitorStops DB Error", err); return; }
            if (!trades) return;

            try {
                trades.forEach(trade => {
                    const quote = market.getQuote(trade.symbol);
                    if (!quote) return;

                    // Check SL/TP
                    // Buy: Close if Bid <= SL or Bid >= TP
                    // Sell: Close if Ask >= SL or Ask <= TP
                    const price = trade.side === 'buy' ? quote.bid : quote.ask;

                    let closeReason = null;
                    if (trade.sl) {
                        if (trade.side === 'buy' && price <= trade.sl) closeReason = 'SL_HIT';
                        if (trade.side === 'sell' && price >= trade.sl) closeReason = 'SL_HIT';
                    }
                    if (trade.tp) {
                        if (trade.side === 'buy' && price >= trade.tp) closeReason = 'TP_HIT';
                        if (trade.side === 'sell' && price <= trade.tp) closeReason = 'TP_HIT';
                    }

                    if (closeReason) {
                        this.executeClose(trade, price, closeReason);
                    }
                });
            } catch (e) {
                console.error("monitorStops Logic Error:", e);
            }
        });
    }

    executeClose(trade, price, reason) {
        // Calculate Final PnL
        const diff = trade.side === 'buy' ? price - trade.entry_price : trade.entry_price - price;
        const contractSize = trade.symbol === 'NIFTY' ? 50 : 15;
        const pnl = diff * trade.lots * contractSize;

        db.run("UPDATE trades SET status = 'closed', exit_price = ?, close_time = CURRENT_TIMESTAMP, pnl = ? WHERE id = ?",
            [price, pnl, trade.id],
            (err) => {
                if (err) { console.error("executeClose DB Error", err); return; }
                try {
                    console.log(`Trade ${trade.id} Closed (${reason}) at ${price}. PnL: ${pnl.toFixed(2)}`);
                    // Update Account Balance/Equity? 
                    // Usually RiskManager or specific BalanceManager handles this, but for simulation we update balance here
                    db.get("SELECT balance FROM accounts WHERE id = ?", [trade.account_id], (err, acc) => {
                        if (acc) {
                            const newBalance = acc.balance + pnl;
                            db.run("UPDATE accounts SET balance = ?, equity = ? WHERE id = ?", [newBalance, newBalance, trade.account_id]); // Equity syncs on close
                        }
                    });
                } catch (e) {
                    console.error("executeClose Logic Error:", e);
                }
            }
        );
    }

    matchOrders() {
        db.all("SELECT * FROM limit_orders WHERE status = 'pending'", [], (err, orders) => {
            if (err) {
                console.error("matchOrders DB Error:", err);
                return;
            }
            if (!orders) return;

            try {
                orders.forEach(order => {
                    const quote = market.getQuote(order.symbol);
                    if (!quote) return;

                    // Check Trigger
                    // Buy Limit: Market Price <= Limit Price
                    // Sell Limit: Market Price >= Limit Price
                    // Using Ask for Buy, Bid for Sell
                    const marketPrice = order.side === 'buy' ? quote.ask : quote.bid;

                    let triggered = false;
                    if (order.side === 'buy' && marketPrice <= order.limit_price) triggered = true;
                    if (order.side === 'sell' && marketPrice >= order.limit_price) triggered = true;

                    if (triggered) {
                        this.executeLimitOrder(order, marketPrice);
                    }
                });
            } catch (e) {
                console.error("matchOrders Logic Error:", e);
            }
        });
    }

    executeLimitOrder(order, price) {
        // Move to Trades table
        db.run(`INSERT INTO trades (account_id, symbol, side, lots, entry_price, sl, tp, status, pnl) 
                VALUES (?, ?, ?, ?, ?, ?, ?, 'open', 0)`,
            [order.account_id, order.symbol, order.side, order.lots, price, order.sl, order.tp],
            (err) => {
                if (err) { console.error("executeLimitOrder DB Error", err); return; }
                try {
                    db.run("UPDATE limit_orders SET status = 'filled' WHERE id = ?", [order.id]);
                    console.log(`Limit Order ${order.id} Filled at ${price}`);
                } catch (e) {
                    console.error("executeLimitOrder Logic Error:", e);
                }
            }
        );
    }

    getMaxLots(size, symbol) {
        if (size <= 50000) return symbol === 'NIFTY' ? 3 : 2;
        if (size <= 100000) return symbol === 'NIFTY' ? 6 : 4;
        if (size <= 200000) return symbol === 'NIFTY' ? 12 : 8;
        return symbol === 'NIFTY' ? 30 : 20; // 500k
    }

    getAccount(id) {
        return new Promise((resolve) => {
            db.get("SELECT * FROM accounts WHERE id = ?", [id], (err, row) => resolve(row));
        });
    }
}

const manager = new OrderManager();
manager.startMatchingEngine(); // Start the loop on require

// Start Risk Manager
const riskManager = require('./riskManager');
riskManager.start();

module.exports = manager;
