const db = require('../database');
// const market = require('./market'); // Removed
const upstoxService = require('../services/upstox');

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

        // Rule 2: Scheduled Auto-Squareoff (3:25 PM)
        await this.checkMarketHours();

        // Rule: Funded Payout Checks
        await this.checkPayouts();

        // Schedule next check
        if (this.isRunning) {
            setTimeout(() => this.monitorRisk(), this.checkInterval);
        }
    }

    getActiveAccounts() {
        return new Promise((resolve) => {
            // FIX: Include 'funded' accounts in monitoring!
            db.all("SELECT * FROM accounts WHERE status IN ('active', 'funded')", [], (err, rows) => {
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
            // const quote = market.getQuote(pos.symbol);
            // Replaced with simplified logic or async fetch if critical.
            // Risk check is critical.
            // For now, let's assume PnL is 0 if we can't get price, to prevent crash.
            // OR use the last known price from a global store?
            // Let's use a placeholder.
            // Ideally we need to fetch price.
            // Since this is a loop, awaiting inside might be slow.
            // Let's just catch the error and continue.

            // To properly calculate PnL, we need the price.
            // Let's assume the frontend/socket handles the visual PnL and we accept a small delay in Risk checks?
            // NO, Risk check must be server side.

            // Let's rely on OrderManager.monitorEquity() to update the DB equity?
            // RiskManager calculates equity via `positions` + `balance`.
            // OrderManager ALSO calculates equity.
            // This is redundant.
            // OrderManager updates `accounts.equity` in DB. 
            // So RiskManager can just read `account.equity` from DB (which it already query via `account` object passed in?)
            // `checkAccountHealth(account)` receives `account`.
            // Does `account.equity` come from DB accurately?
            // `monitorRisk` calls `getActiveAccounts` which does `SELECT * FROM accounts`.
            // If `OrderManager.monitorEquity` runs frequently, `account.equity` should be up to date!
            // So we don't need to recalculate floating PnL here if OrderManager does it!

            // Checking `checkAccountHealth`:
            // It calculates `floatingPnL` and adds to `balance`.
            // If `account.equity` is already updated by OrderManager, we can skip this loop?
            // Let's check `OrderManager.monitorEquity`. Yes, it updates `equity`.
            // So we can use `account.equity` directly?
            // BUT `checkAccountHealth` uses `account.balance` + `floatingPnL`.
            // `account.balance` matches Realized Balance.
            // `account.equity` matches Realized + Floating.

            // So I can Comment out this recalculation loop and just use `currentEquity = account.equity`?
            // Yes, that eliminates the dependency on `market.js` here!

            // However, `account` passed to this function might be stale if fetched before OrderManager update?
            // `monitorRisk` fetches accounts at start of loop.
            // `OrderManager` runs its own loop.
            // It should be close enough.

        });

        // Use the Equity field from DB which OrderManager updates
        const currentEquity = account.equity; // account.balance + floatingPnL;


        // 2. Max Drawdown Check
        // Challenge (Active): 8%
        // Funded: 10%
        let maxDDPercent = 0.08;
        if (account.status === 'funded') {
            maxDDPercent = 0.10;
        }

        const maxDrawdownLimit = account.size * maxDDPercent;
        const breachLevelMax = account.size - maxDrawdownLimit;

        if (currentEquity <= breachLevelMax) {
            await this.failAccount(account, 'MAX_DRAWDOWN', `Equity ${currentEquity.toFixed(2)} below limit ${breachLevelMax} (${maxDDPercent * 100}%)`);
            return;
        }

        // 3. Daily Drawdown Check (4% of Day Start Equity)
        // Daily Start Balance is reset at 00:00 UTC (or handled by a separate cron)
        const dailyStart = account.daily_start_balance || account.balance;
        const dailyLossLimit = dailyStart * 0.04; // 4% Rule
        const breachLevelDaily = dailyStart - dailyLossLimit;

        if (currentEquity <= breachLevelDaily) {
            await this.failAccount(account, 'DAILY_DRAWDOWN', `Equity ${currentEquity.toFixed(2)} below daily limit ${breachLevelDaily.toFixed(2)} (4%)`);
            return;
        }

        // 4. Anti-Cheating: Unrealistic Profit Spike
        // If account grows > 50% in a single day -> SUSPICIOUS / GLITCH / MANIPULATION
        const profitSpikeLimit = dailyStart * 1.50; // 50% Gain
        if (currentEquity >= profitSpikeLimit) {
            await this.failAccount(account, 'PROFIT_MANIPULATION', `Unrealistic Profit Spike. Equity ${currentEquity.toFixed(2)} > Limit ${profitSpikeLimit.toFixed(2)} (50% Gain)`);
            return;
        }

        // 5. Check Objectives (Profit Target & Trading Days)
        if (account.status === 'active') {
            await this.checkObjectives(account, currentEquity);
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

    async checkObjectives(account, currentEquity) {
        // Calculate Profit %
        const profit = currentEquity - account.size;
        const profitPct = profit / account.size;

        // Determine Target
        let target = 0.10; // Default 1-Step
        if (account.type === '2-Step') {
            if (account.phase === 1) target = 0.08;
            else if (account.phase === 2) target = 0.05;
        } else {
            // 1-Step
            target = 0.10;
        }

        if (profitPct >= target) {
            // New Rule: No Min Trading Days, but MIN 2 TRADES placed.
            const totalTrades = await this.getTotalTrades(account.id);
            if (totalTrades >= 2) {
                await this.passAccount(account);
            }
        }
    }

    getTotalTrades(accountId) {
        return new Promise((resolve) => {
            db.get("SELECT COUNT(*) as count FROM trades WHERE account_id = ?", [accountId], (err, row) => {
                resolve(row ? row.count : 0);
            });
        });
    }

    async passAccount(account) {
        console.log(`[RISK] Account ${account.id} PASSED Phase ${account.phase}`);

        let newStatus = 'active';
        let newPhase = account.phase;
        let details = '';

        if (account.type === '2-Step' && account.phase === 1) {
            newPhase = 2;
            details = 'Passed Phase 1. Upgraded to Phase 2.';
            // Reset Balance for Phase 2? 
            // Usually balance resets to size, but we keep history. 
            // For simplicity, we just update phase. User might need to "Reset" manually or we handle it here.
            // Let's reset balance to size for fair Phase 2 start.
            db.run("UPDATE accounts SET phase = ?, balance = ?, equity = ?, daily_start_balance = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?",
                [2, account.size, account.size, account.size, account.id]);
        } else {
            // 1-Step Passed OR 2-Step Phase 2 Passed -> FUNDED
            newStatus = 'funded';
            newPhase = 'funded'; // Or keep numeric? Let's use status 'funded'
            details = 'Account Funded!';

            db.run("UPDATE accounts SET status = 'funded' WHERE id = ?", [account.id]);
        }

        // Log Event (using violations table for now or a new notifications table)
        db.run("INSERT INTO violations (account_id, type, details, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)",
            [account.id, 'OBJECTIVE_MET', details]);
    }
    async checkMarketHours() {
        // ... (existing logic) ...
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istTime = new Date(now.getTime() + istOffset);
        const hours = istTime.getUTCHours();
        const minutes = istTime.getUTCMinutes();

        // 15:25 = 3 PM 25 Min
        if (hours === 15 && minutes >= 25) {
            // Close All Open Positions
            console.log("[RISK] Market Closed (15:25). Auto-Squareoff Triggered.");
            // Only update open trades
            await new Promise(resolve => {
                db.run(`UPDATE trades SET status = 'closed', close_time = CURRENT_TIMESTAMP, notes = 'AUTO_SQUAREOFF' WHERE status = 'open'`, [], (err) => resolve());
            });
        }
    }

    async checkPayouts() {
        // Check only Funded accounts
        const fundedAccounts = await new Promise(resolve => {
            db.all("SELECT * FROM accounts WHERE status = 'funded'", [], (err, rows) => resolve(rows || []));
        });

        for (const account of fundedAccounts) {
            // 1. Check Profit
            if (account.balance <= account.size) continue; // No Profit

            // 2. Check Timing
            // First payout: 14 days after first trade. Subsequent: 14 days after last payout.

            // Get 'Reference Date'
            let refDate = null;
            if (account.last_payout_date) {
                refDate = new Date(account.last_payout_date);
            } else {
                // Get First Trade Date
                const firstTrade = await new Promise(resolve => {
                    db.get("SELECT MIN(open_time) as date FROM trades WHERE account_id = ?", [account.id], (err, row) => resolve(row));
                });
                if (firstTrade && firstTrade.date) {
                    refDate = new Date(firstTrade.date);
                }
            }

            if (!refDate) continue; // No trades yet

            const now = new Date();
            const diffTime = Math.abs(now - refDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays >= 14) {
                await this.processPayout(account);
            }
        }
    }

    async processPayout(account) {
        const totalProfit = account.balance - account.size;
        if (totalProfit <= 0) return;

        const traderShare = totalProfit * 0.80;
        const firmShare = totalProfit * 0.20;

        console.log(`[PAYOUT] Processing Payout for Account ${account.id}. Profit: ${totalProfit.toFixed(2)}`);

        // 1. Record Payout
        db.run(`INSERT INTO payouts (account_id, amount, trader_share, firm_share, status, request_date) 
                VALUES (?, ?, ?, ?, 'processed', CURRENT_TIMESTAMP)`,
            [account.id, totalProfit, traderShare, firmShare]);

        // 2. Reset Balance to Account Size (Withdraw Profit)
        // Also update last_payout_date
        db.run("UPDATE accounts SET balance = ?, equity = ?, last_payout_date = CURRENT_TIMESTAMP WHERE id = ?",
            [account.size, account.size, account.id]);
    }
}

module.exports = new RiskManager();
