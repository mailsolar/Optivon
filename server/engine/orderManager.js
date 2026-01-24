const db = require('../database');
const market = require('./market');

class OrderManager {
    async placeOrder(userId, { accountId, symbol, side, lots, type, accountSize }) {
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

        // Leverage: Buy 10x, Sell 5x
        const leverage = side === 'buy' ? 10 : 5;
        const requiredMargin = totalValue / leverage;

        // Check Balance (Pseudo)
        const account = await this.getAccount(accountId);
        if (account.equity < requiredMargin) {
            throw new Error(`Insufficient Margin. Req: $${requiredMargin.toFixed(2)}`);
        }

        // 3. Execution with Slippage
        // Simulated Slippage: +/- 0.05% max mechanism
        const slippagePct = (Math.random() - 0.5) * 0.001;
        const executionPrice = price * (1 + slippagePct);

        return new Promise((resolve, reject) => {
            db.run(`INSERT INTO trades (account_id, symbol, side, lots, entry_price, status, pnl) 
                     VALUES (?, ?, ?, ?, ?, 'open', 0)`,
                [accountId, symbol, side, lots, executionPrice],
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

    async placeLimitOrder(userId, { accountId, symbol, side, lots, price, accountSize }) {
        // 1. Enforce Lot Limits
        const maxLots = this.getMaxLots(accountSize, symbol);
        if (lots > maxLots) {
            throw new Error(`Lot limit exceeded. Max for ${symbol} on $${accountSize} is ${maxLots} lots.`);
        }

        return new Promise((resolve, reject) => {
            db.run(`INSERT INTO limit_orders (account_id, symbol, side, lots, limit_price, status) 
                     VALUES (?, ?, ?, ?, ?, 'pending')`,
                [accountId, symbol, side, lots, price],
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
        setInterval(() => this.matchOrders(), 1000); // Check every 1s
    }

    matchOrders() {
        db.all("SELECT * FROM limit_orders WHERE status = 'pending'", [], (err, orders) => {
            if (err || !orders) return;

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
        });
    }

    executeLimitOrder(order, price) {
        // Move to Trades table
        db.run(`INSERT INTO trades (account_id, symbol, side, lots, entry_price, status, pnl) 
                VALUES (?, ?, ?, ?, ?, 'open', 0)`,
            [order.account_id, order.symbol, order.side, order.lots, price],
            (err) => {
                if (!err) {
                    db.run("UPDATE limit_orders SET status = 'filled' WHERE id = ?", [order.id]);
                    console.log(`Limit Order ${order.id} Filled at ${price}`);
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
module.exports = manager;
