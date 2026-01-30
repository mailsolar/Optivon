const db = require('../database');
const market = require('./market');

class RiskManager {
    start() {
        console.log("Risk Manager Started");
        setInterval(() => this.monitorRisk(), 1000); // Check every 1s
    }

    monitorRisk() {
        // Enforce Daily Drawdown & Overall Drawdown
        db.all("SELECT * FROM accounts WHERE status = 'active'", [], (err, accounts) => {
            if (err) return;

            accounts.forEach(async acc => {
                // Calculate PnL from open positions
                const positions = await this.getOpenPositions(acc.id);
                let openPnL = 0;

                positions.forEach(pos => {
                    const quote = market.getQuote(pos.symbol);
                    if (quote) {
                        const curr = pos.side === 'buy' ? quote.bid : quote.ask;
                        const diff = pos.side === 'buy' ? curr - pos.entry_price : pos.entry_price - curr;
                        const size = pos.symbol === 'NIFTY' ? 50 : 15;
                        openPnL += diff * pos.lots * size;
                    }
                });

                const currentEquity = acc.balance + openPnL;

                // 1. Max Drawdown (4% of Size)
                const maxLoss = acc.size * 0.04;
                const minEquityAllowed = acc.size - maxLoss;

                if (currentEquity < minEquityAllowed) {
                    this.failAccount(acc.id, 'Max Drawdown Violation (4%)');
                    return;
                }

                // 2. Daily Drawdown (2% of Daily Start Balance)
                const dailyLossLimit = acc.daily_start_balance * 0.02;
                const minDailyEquity = acc.daily_start_balance - dailyLossLimit;

                if (currentEquity < minDailyEquity) {
                    this.failAccount(acc.id, 'Daily Drawdown Violation (2%)');
                    return;
                }

                // 3. Profit Target Logic (Optional auto-pass)
                // 1-Step: 10%, 2-Step: P1 8%, P2 5%
                let target = 0.10;
                if (acc.type === '2-Step') {
                    target = acc.phase === 1 ? 0.08 : 0.05;
                }

                if (currentEquity >= acc.size * (1 + target)) {
                    // Pass! (Usually requires closed trades, but simulated logic can pass on equity)
                    // this.passAccount(acc.id);
                }
            });
        });
    }

    getOpenPositions(accountId) {
        return new Promise((resolve) => {
            db.all("SELECT * FROM trades WHERE account_id = ? AND status = 'open'", [accountId], (err, rows) => {
                resolve(rows || []);
            });
        });
    }

    failAccount(accountId, reason) {
        console.log(`Failing Account ${accountId}: ${reason}`);
        db.run("UPDATE accounts SET status = 'failed' WHERE id = ?", [accountId]);
        db.run("INSERT INTO violations (account_id, type, details) VALUES (?, ?, ?)", [accountId, 'RISK_FAIL', reason]);

        // Close all positions logic would go here
        db.run("UPDATE trades SET status = 'closed', close_time = CURRENT_TIMESTAMP WHERE account_id = ? AND status='open'", [accountId]);
    }
}

module.exports = new RiskManager();
