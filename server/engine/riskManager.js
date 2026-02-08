const db = require('../database');
const market = require('./market');

class RiskManager {
    constructor() {
        this.isRunning = false;
        this.checkInterval = 1000; // 1 second
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log("Risk Manager Started");
        this.monitorRisk();
    }

    stop() {
        this.isRunning = false;
    }

    async monitorRisk() {
        if (!this.isRunning) return;

        try {
            // Get all active accounts
            const accounts = await this.getActiveAccounts();

            for (const acc of accounts) {
                await this.checkAccountHealth(acc);
            }

        } catch (err) {
            console.error("Risk Monitor Error:", err);
        }

        // Schedule next check
        if (this.isRunning) {
            setTimeout(() => this.monitorRisk(), this.checkInterval);
        }
    }

    getActiveAccounts() {
        return new Promise((resolve) => {
            db.all("SELECT * FROM accounts WHERE status = 'active'", [], (err, rows) => {
                if (err) resolve([]);
                else resolve(rows || []);
            });
        });
    }

    async checkAccountHealth(account) {
        // 1. Calculate Current Equity (Balance + Floating PnL)
        const positions = await this.getOpenPositions(account.id);
        let floatingPnL = 0;

        positions.forEach(pos => {
            const quote = market.getQuote(pos.symbol);
            if (quote) {
                const currentPrice = pos.side === 'buy' ? quote.bid : quote.ask;
                const diff = pos.side === 'buy' ? currentPrice - pos.entry_price : pos.entry_price - currentPrice;
                const contractSize = pos.symbol === 'NIFTY' ? 50 : 15;
                floatingPnL += diff * pos.lots * contractSize;
            }
        });

        const currentEquity = account.balance + floatingPnL;

        // 2. Max Drawdown Check (10% of Initial Size)
        // Static Max Drawdown: Equity must not fall below Initial - 10%
        // E.g. $100k -> Max Loss allowed is $10k -> Breach if Equity < $90k
        const maxDrawdownLimit = account.size * 0.10;
        const breachLevelMax = account.size - maxDrawdownLimit;

        if (currentEquity <= breachLevelMax) {
            await this.failAccount(account, 'MAX_DRAWDOWN', `Equity ${currentEquity.toFixed(2)} below limit ${breachLevelMax}`);
            return;
        }

        // 3. Daily Drawdown Check (5% of Day Start Equity)
        // Daily Start Balance is reset at 00:00 UTC (or handled by a separate cron)
        // For now, we assume 'daily_start_balance' in DB is accurate for the current day.
        // E.g. Start Day $100k -> Max Daily Loss $5k -> Breach if Equity < $95k
        // If account grew to $104k yesterday, Start Day $104k -> Limit $5.2k -> Breach < $98.8k

        // Use daily_start_balance if set, else fallback to balance (e.g. for new accounts)
        const dailyStart = account.daily_start_balance || account.balance;
        const dailyLossLimit = dailyStart * 0.05;
        const breachLevelDaily = dailyStart - dailyLossLimit;

        if (currentEquity <= breachLevelDaily) {
            await this.failAccount(account, 'DAILY_DRAWDOWN', `Equity ${currentEquity.toFixed(2)} below daily limit ${breachLevelDaily.toFixed(2)}`);
            return;
        }

        // Update Equity in DB for Frontend (optional optimisation: only if changed significantly)
        this.updateEquity(account.id, currentEquity);
    }

    getOpenPositions(accountId) {
        return new Promise((resolve) => {
            db.all("SELECT * FROM trades WHERE account_id = ? AND status = 'open'", [accountId], (err, rows) => {
                resolve(rows || []);
            });
        });
    }

    updateEquity(accountId, equity) {
        db.run("UPDATE accounts SET equity = ? WHERE id = ?", [equity, accountId]);
    }

    async failAccount(account, type, reason) {
        console.log(`[RISK] Failing Account ${account.id}: ${type} - ${reason}`);

        // 1. Close all Open Positions
        await new Promise(resolve => {
            const closeTime = new Date().toISOString();
            // We should ideally calculate final PnL for record keeping, but primarily we just close them.
            // A simple batch update:
            db.run(`UPDATE trades 
                    SET status = 'closed', 
                        close_time = ?, 
                        notes = 'RISK_LIQUIDATION' 
                    WHERE account_id = ? AND status = 'open'`,
                [closeTime, account.id], (err) => resolve());
        });

        // 2. Mark Account as Failed
        db.run("UPDATE accounts SET status = 'failed' WHERE id = ?", [account.id]);

        // 3. Log Violation
        db.run("INSERT INTO violations (account_id, type, details, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)",
            [account.id, type, reason]);
    }
}

module.exports = new RiskManager();
