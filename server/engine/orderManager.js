const db = require('../database');
const upstoxService = require('../services/upstox');

class OrderManager {
    constructor() {
        this.orderHistory = new Map(); // accountId -> [timestamp, timestamp, ...]
    }

    async placeOrder(userId, { accountId, symbol, side, lots, type, accountSize, sl, tp }) {
        const now = Date.now();
        if (!this.orderHistory.has(accountId)) this.orderHistory.set(accountId, []);
        const history = this.orderHistory.get(accountId);
        const windowStart = now - 60000;
        const recentOrders = history.filter(t => t > windowStart);
        this.orderHistory.set(accountId, recentOrders);

        if (recentOrders.length >= 20) throw new Error('Order limit exceeded (Max 20/min).');
        recentOrders.push(now);

        const maxLots = this.getMaxLots(accountSize, symbol);
        if (lots > maxLots) throw new Error(`Lot limit exceeded. Max is ${maxLots} lots.`);

        // Get Price from Cache (Zero Latency / Zero API Hammering)
        let ltp = upstoxService.latestQuotes.get(symbol);
        if (!ltp) {
            // If not in cache, try one quick burst fetch or fail
            throw new Error('Waiting for market data connection... Try again in 2 seconds.');
        }

        const quote = { ask: ltp, bid: ltp, ltp: ltp };
        const price = side === 'buy' ? quote.ask : quote.bid;

        // RULE: Trading Hours (09:15 - 15:25 IST)
        const istTime = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
        const totalMinutes = istTime.getUTCHours() * 60 + istTime.getUTCMinutes();
        if (totalMinutes < 555 || totalMinutes >= 925) throw new Error('Market Closed (09:15-15:25 IST)');

        const openPositions = await this.getOpenPositionsCount(accountId, symbol, side);
        if (openPositions >= 2) throw new Error(`Max entries reached (2).`);

        const contractSize = symbol === 'NIFTY' ? 75 : 15; // Standard Lot Sizes
        const totalValue = price * lots * contractSize;
        const leverage = (symbol.includes('CE') || symbol.includes('PE')) ? (side === 'buy' ? 10 : 5) : 3;
        const marginRequired = totalValue / leverage;

        const account = await this.getAccount(accountId);
        if (account.equity < marginRequired) throw new Error(`Insufficient Margin. Req: ₹${marginRequired.toLocaleString('en-IN')}`);

        // SL/TP Validation
        if (sl) {
            if (side === 'buy' && sl >= price) throw new Error('SL must be below Entry');
            if (side === 'sell' && sl <= price) throw new Error('SL must be above Entry');
        }

        const executionPrice = price; // Simulating direct fill since we are trading indices

        return new Promise((resolve, reject) => {
            db.run(`INSERT INTO trades (account_id, symbol, side, lots, entry_price, sl, tp, status, pnl) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, 'open', 0)`,
                [accountId, symbol, side, lots, executionPrice, sl || null, tp || null],
                function (err) {
                    if (err) return reject(err);
                    resolve({ message: 'Order Filled', status: 'filled', fillPrice: executionPrice, orderId: this.lastID });
                }
            );
        });
    }

    startMatchingEngine() {
        console.log("[Engine] Starting SL/TP Monitor (2s Cycle)");
        setInterval(() => { try { this.monitorStops(); } catch (e) { } }, 2000);
        setInterval(() => { try { this.monitorEquity(); } catch (e) { } }, 5000);
    }

    monitorEquity() {
        const query = `SELECT t.account_id, t.symbol, t.side, t.lots, t.entry_price, a.balance 
                       FROM trades t JOIN accounts a ON t.account_id = a.id WHERE t.status = 'open'`;
        db.all(query, [], (err, rows) => {
            if (err || !rows) return;
            const accountMap = {};
            rows.forEach(r => {
                const ltp = upstoxService.latestQuotes.get(r.symbol);
                if (ltp) {
                    const diff = r.side === 'buy' ? ltp - r.entry_price : r.entry_price - ltp;
                    const contractSize = r.symbol === 'NIFTY' ? 75 : 15;
                    let pnl = (diff * r.lots * contractSize); // PnL in INR
                    if (!accountMap[r.account_id]) accountMap[r.account_id] = r.balance;
                    accountMap[r.account_id] += pnl;
                }
            });
            Object.keys(accountMap).forEach(id => {
                db.run("UPDATE accounts SET equity = ? WHERE id = ?", [accountMap[id], id]);
            });
        });
    }

    monitorStops() {
        db.all("SELECT * FROM trades WHERE status = 'open'", [], (err, trades) => {
            if (err || !trades) return;
            trades.forEach(trade => {
                const price = upstoxService.latestQuotes.get(trade.symbol);
                if (!price) return;

                let hit = null;
                if (trade.sl) {
                    if (trade.side === 'buy' && price <= trade.sl) hit = 'SL_HIT';
                    if (trade.side === 'sell' && price >= trade.sl) hit = 'SL_HIT';
                }
                if (trade.tp) {
                    if (trade.side === 'buy' && price >= trade.tp) hit = 'TP_HIT';
                    if (trade.side === 'sell' && price <= trade.tp) hit = 'TP_HIT';
                }
                if (hit) this.executeClose(trade, price, hit);
            });
        });
    }

    async processLiveTick(symbol, price) {
        // High frequency limit matching (Triggered by UpstoxService)
        db.all("SELECT * FROM limit_orders WHERE status = 'pending' AND symbol = ?", [symbol], (err, orders) => {
            if (err || !orders) return;
            orders.forEach(o => {
                let triggered = o.side === 'buy' ? price <= o.limit_price : price >= o.limit_price;
                if (triggered) this.executeLimitOrder(o, price);
            });
        });
    }

    executeLimitOrder(order, price) {
        db.run(`INSERT INTO trades (account_id, symbol, side, lots, entry_price, sl, tp, status, pnl) 
                VALUES (?, ?, ?, ?, ?, ?, ?, 'open', 0)`,
            [order.account_id, order.symbol, order.side, order.lots, price, order.sl, order.tp],
            (err) => {
                if (!err) db.run("UPDATE limit_orders SET status = 'filled' WHERE id = ?", [order.id]);
            }
        );
    }

    async fetchPrice(symbol) {
        return upstoxService.latestQuotes.get(symbol);
    }

    executeClose(trade, price, reason) {
        const diff = trade.side === 'buy' ? price - trade.entry_price : trade.entry_price - price;
        const contractSize = trade.symbol === 'NIFTY' ? 75 : 15;
        let pnl = diff * trade.lots * contractSize;
        db.run("UPDATE trades SET status = 'closed', exit_price = ?, close_time = CURRENT_TIMESTAMP, pnl = ? WHERE id = ?",
            [price, pnl, trade.id], (err) => {
                if (err) return;
                db.get("SELECT balance FROM accounts WHERE id = ?", [trade.account_id], (err, acc) => {
                    if (acc) {
                        const nb = acc.balance + pnl;
                        db.run("UPDATE accounts SET balance = ?, equity = ? WHERE id = ?", [nb, nb, trade.account_id]);
                    }
                });
            }
        );
    }

    getAccount(id) { return new Promise(r => db.get("SELECT * FROM accounts WHERE id = ?", [id], (err, row) => r(row))); }
    getOpenPositionsCount(acc, sym, side) { return new Promise(r => db.get("SELECT COUNT(*) as c FROM trades WHERE account_id=? AND symbol=? AND side=? AND status='open'", [acc, sym, side], (err, row) => r(row?.c || 0))); }
    getMaxLots(size) { return size <= 500000 ? 3 : (size <= 1000000 ? 5 : (size <= 2000000 ? 8 : 12)); }
}

const manager = new OrderManager();
manager.startMatchingEngine();
module.exports = manager;
