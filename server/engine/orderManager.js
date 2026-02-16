const db = require('../database');
// const market = require('./market'); // Removed for real data

class OrderManager {
    constructor() {
        this.orderHistory = new Map(); // accountId -> [timestamp, timestamp, ...]
    }

    async placeOrder(userId, { accountId, symbol, side, lots, type, accountSize, sl, tp }) {
        // RATE LIMITING (HFT / Spam Protection)
        const now = Date.now();
        if (!this.orderHistory.has(accountId)) {
            this.orderHistory.set(accountId, []);
        }
        const history = this.orderHistory.get(accountId);

        // 1. Clean old history (> 60s)
        const windowStart = now - 60000;
        const recentOrders = history.filter(t => t > windowStart);
        this.orderHistory.set(accountId, recentOrders);

        // 2. Check Frequency (Max 20 per minute)
        if (recentOrders.length >= 20) {
            throw new Error('Order limit exceeded (Max 20/min). Slow down.');
        }

        // 3. Check HFT (Min 500ms between orders)
        if (recentOrders.length > 0) {
            const lastOrderTime = recentOrders[recentOrders.length - 1];
            if (now - lastOrderTime < 500) {
                throw new Error('HFT Detected. Please wait between orders.');
            }
        }

        // Add current timestamp (will be saved if execution succeeds, but for rate limit we track attempts too?)
        // Let's track successful attempts to avoid punishing validation errors too hard, 
        // OR track all attempts to prevent DOS. Let's track tentatively, revert if fail?
        // For simplicity, we just push now.
        recentOrders.push(now);
        this.orderHistory.set(accountId, recentOrders);


        // 1. Enforce Lot Limits
        const maxLots = this.getMaxLots(accountSize, symbol);
        if (lots > maxLots) {
            throw new Error(`Lot limit exceeded. Max for ${symbol} on ₹${accountSize} is ${maxLots} lots.`);
        }

        // 2. Get Quote (Async/Real)
        // const quote = market.getQuote(symbol);
        // We need a way to get the latest price from UpstoxService (which is polling)
        // For now, let's assume UpstoxService has a 'getLastPrice(symbol)' method or we fetch it.
        // Since we are inside an async function, we can await.

        let quote = null;
        try {
            // Quick Fetch or use internal state of service if we expose it
            // Ideally: const price = await upstoxService.fetchLTP(symbol);
            // But we didn't implement that yet.
            // Let's rely on the service to have a `latestQuotes` map?
            // Actually, let's just use a default safe object for now to prevent crash
            // and assume the user is looking at the chart.
            // BETTER: Implement `getLTP` in `OrderManager` using `https` directly as a helper?
            // No, duplicated code.

            // Temporary Fix: Trust the limit price or recent history?
            // Logic: If Market Order, we need price.
            // Let's add a helper here to fetch price briefly or fail safe.

            // For this iteration, since we deleted market.js, let's mock the quote object structure 
            // with a "Fetch" if possible, or just use `0` and let execution happen (dangerous but requested "just connected").

            // Let's implement a quick HTTPS fetch here for safety
            const latestPrice = await this.fetchPrice(symbol);
            if (latestPrice) {
                quote = { ask: latestPrice, bid: latestPrice, ltp: latestPrice };
            }
        } catch (e) {
            console.error("Price Fetch Error", e);
        }

        if (!quote) throw new Error('Market Closed / No Quote');

        // RULE 4: Trading Hours (09:15 - 15:25 IST)
        const currentTime = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istTime = new Date(currentTime.getTime() + istOffset);
        const hours = istTime.getUTCHours();
        const minutes = istTime.getUTCMinutes();
        const totalMinutes = hours * 60 + minutes;

        const marketOpen = 9 * 60 + 15;  // 09:15
        const marketClose = 15 * 60 + 25; // 15:25

        if (totalMinutes < marketOpen || totalMinutes >= marketClose) {
            throw new Error('Market Closed. Trading allowed 09:15 - 15:25 IST.');
        }

        // RULE 3: Anti-Martingale (Max 2 Entries)
        // Check existing open positions for this account + symbol + side
        const openPositions = await this.getOpenPositionsCount(accountId, symbol, side);
        if (openPositions >= 2) {
            throw new Error(`Max entries reached (2). No averaging down allowed.`);
        }

        // 2. Leverage Check
        const price = side === 'buy' ? quote.ask : quote.bid;
        const contractSize = symbol === 'NIFTY' ? 65 : 15; // NIFTY Lot Size Updated to 65
        const totalValue = price * lots * contractSize;

        // Leverage Rules: 
        // Option Buying (Long Options): 1:10
        // Option Selling (Short Options): 1:5
        // Futures (NIFTY/BANKNIFTY): 1:3 (Taking the 1:3 limit from "1:2/3")

        let leverage = 3; // Default Futures

        // Simple heuristic for Options (Check symbol or assume side logic if symbols aren't distinct yet)
        // Since we currently assume NIFTY/BANKNIFTY are Futures, we use 3.
        // If we want to simulate Options logic based on Side for specific Option Symbols (e.g. containing CE/PE)
        // For now, adhering to the "Futures: 1:2/3" rule for NIFTY/BANKNIFTY.

        // Mocking Option Detection:
        if (symbol.includes('CE') || symbol.includes('PE')) {
            leverage = side === 'buy' ? 10 : 5;
        } else {
            // Futures
            leverage = 3;
        }

        const requiredMargin = totalValue / leverage;

        // RULE 1: Max Risk Per Trade (2% of Account)
        // Requires SL to calculate risk
        if (!sl) {
            throw new Error('Stop Loss is REQUIRED to calculate risk (Max 2%).');
        }

        let riskPerShare = 0;
        if (side === 'buy') {
            if (sl >= price) throw new Error('SL must be below Entry Price');
            riskPerShare = price - sl;
        } else {
            if (sl <= price) throw new Error('SL must be above Entry Price');
            riskPerShare = sl - price;
        }

        const totalRisk = riskPerShare * lots * contractSize;
        const maxRiskAllowed = accountSize * 0.02;

        // 3. Conversion for USD Accounts trading INR Assets (NIFTY/BANKNIFTY)
        // Assumption: Account is USD, Instrument is INR.
        // Approx Rate: 1 USD = 84 INR.
        // We must convert the INR Risk to USD before comparing with Account Risk Limit.

        let riskInAccountCurrency = totalRisk;
        if (symbol === 'NIFTY' || symbol === 'BANKNIFTY') {
            riskInAccountCurrency = totalRisk / 84;
        }

        if (riskInAccountCurrency > maxRiskAllowed) {
            throw new Error(`Risk Exceeds 2% Limit. Risk: $${riskInAccountCurrency.toFixed(2)} > Limit: $${maxRiskAllowed.toFixed(2)}`);
        }

        // Check Balance for Margin
        const account = await this.getAccount(accountId);
        const marginRequiredUSD = (symbol === 'NIFTY' || symbol === 'BANKNIFTY') ? requiredMargin / 84 : requiredMargin;

        if (account.equity < marginRequiredUSD) {
            throw new Error(`Insufficient Margin. Req: $${marginRequiredUSD.toFixed(2)}`);
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

        // RULE: Spread Protection & Volatility Check
        const spread = quote.ask - quote.bid;
        const maxSpread = symbol === 'NIFTY' ? 3 : 6;

        // 1. Spread Protection (Anti-Manipulation)
        if (spread > maxSpread) {
            throw new Error(`Spread too high (${spread.toFixed(2)}). Max allowed: ${maxSpread}. Order Rejected.`);
        }

        // 2. Volatility Chop Protection
        // If spread is excessively wide (e.g. > 10 points on Nifty), it indicates extreme event
        if (spread > 10) {
            throw new Error(`Extreme Volatility/Chop Detected (Spread: ${spread.toFixed(2)}). Order Rejected.`);
        }

        // 3. Execution with Realistic Slippage
        // Slippage is proportional to Spread (Wider spread = higher impact/slippage)
        // Base slippage: +/- 10% of Spread
        const slippageBase = spread * 0.1;
        const slippageRandom = (Math.random() - 0.5) * slippageBase;
        const executionPrice = price + slippageRandom; // Price can slip either way, but usually worse? 
        // Realistically, market orders slip against you. 
        // Buy: Price + Slippage (Higher), Sell: Price - Slippage (Lower)
        // Let's bias it slightly against the trader (0.02% penalty)
        const penalty = price * 0.0002;
        const finalPrice = side === 'buy' ? executionPrice + penalty : executionPrice - penalty;

        return new Promise((resolve, reject) => {
            db.run(`INSERT INTO trades (account_id, symbol, side, lots, entry_price, sl, tp, status, pnl) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, 'open', 0)`,
                [accountId, symbol, side, lots, finalPrice, sl || null, tp || null],
                function (err) {
                    if (err) return reject(err);
                    resolve({
                        message: 'Order Filled',
                        status: 'filled',
                        fillPrice: finalPrice,
                        slippage: finalPrice - price,
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
            throw new Error(`Lot limit exceeded. Max for ${symbol} on ₹${accountSize} is ${maxLots} lots.`);
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
                                const contractSize = trade.symbol === 'NIFTY' ? 65 : 15;
                                let tradePnL = diff * trade.lots * contractSize;

                                if (trade.symbol === 'NIFTY' || trade.symbol === 'BANKNIFTY') {
                                    tradePnL = tradePnL / 84;
                                }

                                floatingPnL += tradePnL;
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
        const contractSize = trade.symbol === 'NIFTY' ? 65 : 15;
        let pnl = diff * trade.lots * contractSize;

        // Convert INR PnL to USD for Account Balance
        if (trade.symbol === 'NIFTY' || trade.symbol === 'BANKNIFTY') {
            pnl = pnl / 84;
        }

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
        // Tiers: 5L (3), 10L (5), 20L (8), 50L (12)
        if (size <= 500000) return 3;
        if (size <= 1000000) return 5;
        if (size <= 2000000) return 8;
        return 12; // 50L and above
    }

    getAccount(id) {
        return new Promise((resolve) => {
            db.get("SELECT * FROM accounts WHERE id = ?", [id], (err, row) => resolve(row));
        });
    }

    getOpenPositionsCount(accountId, symbol, side) {
        return new Promise((resolve) => {
            db.get("SELECT COUNT(*) as count FROM trades WHERE account_id = ? AND symbol = ? AND side = ? AND status = 'open'",
                [accountId, symbol, side],
                (err, row) => resolve(row ? row.count : 0)
            );
        });
    }

    // Helper to fetch price directly (since we killed market.js)
    fetchPrice(symbol) {
        return new Promise((resolve) => {
            // We can access upstoxService's polling data if we exposed it?
            // Or just make a quick API call?
            // API call is safer.
            // Copied logic from service for robustness
            const https = require('https');
            const instrumentMap = {
                'NIFTY': 'NSE_INDEX|Nifty 50',
                'BANKNIFTY': 'NSE_INDEX|Nifty Bank'
            };
            const key = instrumentMap[symbol] || instrumentMap['NIFTY'];
            // SIMPLE FIX: Read the upstox_token.json file here too
            const fs = require('fs');
            const path = require('path');
            const tokenPath = path.join(__dirname, '../upstox_token.json');

            if (fs.existsSync(tokenPath)) {
                const tData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
                const accToken = tData.access_token;

                const options = {
                    hostname: 'api.upstox.com',
                    port: 443,
                    path: `/v2/market-quote/ltp?instrument_key=${encodeURIComponent(key)}`,
                    method: 'GET',
                    headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accToken}` }
                };

                const req = https.request(options, (res) => {
                    let data = '';
                    res.on('data', c => data += c);
                    res.on('end', () => {
                        try {
                            const p = JSON.parse(data);
                            const ltp = p.data[Object.keys(p.data)[0]].last_price;
                            resolve(ltp);
                        } catch (e) { resolve(null); }
                    });
                });
                req.on('error', () => resolve(null));
                req.end();
            } else {
                resolve(null);
            }
        });
    }
}

const manager = new OrderManager();
// manager.startMatchingEngine(); // Disable Engine Loop (Cpu heavy and depends on market)

// Start Risk Manager
const riskManager = require('./riskManager');
riskManager.start();

module.exports = manager;
