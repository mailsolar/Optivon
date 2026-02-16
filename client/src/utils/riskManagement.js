export class RiskManager {
    constructor(initialBalance, dailyDrawdownPercent = 5, maxDrawdownPercent = 10) {
        this.initialBalance = initialBalance;
        this.dailyDrawdownLimitPercent = dailyDrawdownPercent;
        this.maxDrawdownLimitPercent = maxDrawdownPercent;
        this.dailyStartBalance = initialBalance;
        this.highWaterMark = initialBalance;
    }

    updateLimits(dailyPercent, maxPercent) {
        if (dailyPercent) this.dailyDrawdownLimitPercent = dailyPercent;
        if (maxPercent) this.maxDrawdownLimitPercent = maxPercent;
    }

    checkDrawdown(currentBalance) {
        // Calculate Drawdown based on Initial Balance (Fixed Type)
        // If current balance is > initial, drawdown is 0.
        // If current balance < initial, drawdown is the difference.

        const initialBalance = this.initialBalance;
        let diff = currentBalance - initialBalance;

        // If profit, no drawdown
        let drawdownPercent = 0;

        if (diff < 0) {
            // Loss
            drawdownPercent = (Math.abs(diff) / initialBalance) * 100;
        }

        // Daily Drawdown logic - simplified to overall for now to match user expectation
        // If current balance < dailyStart
        const dailyDiff = currentBalance - this.dailyStartBalance;
        let dailyDrawdownPercent = 0;
        if (dailyDiff < 0) {
            dailyDrawdownPercent = (Math.abs(dailyDiff) / this.dailyStartBalance) * 100;
        }

        // Daily Drawdown Check
        if (dailyDrawdownPercent >= this.dailyDrawdownLimitPercent) {
            return {
                violated: true,
                type: 'DAILY_DRAWDOWN',
                message: `Personal Daily Limit Exceeded: -${dailyDrawdownPercent.toFixed(2)}% (Limit: ${this.dailyDrawdownLimitPercent}%)`,
                lockAccount: true
            };
        }

        // Maximum Drawdown Check
        if (drawdownPercent >= this.maxDrawdownLimitPercent) {
            return {
                violated: true,
                type: 'MAX_DRAWDOWN',
                message: `Personal Max Drawdown Exceeded: -${drawdownPercent.toFixed(2)}% (Limit: ${this.maxDrawdownLimitPercent}%)`,
                lockAccount: true
            };
        }

        // Update High Water Mark if we are profitable
        if (currentBalance > this.highWaterMark) {
            this.highWaterMark = currentBalance;
        }

        return {
            violated: false,
            dailyLossPercent: dailyDrawdownPercent.toFixed(2),
            maxLossPercent: drawdownPercent.toFixed(2),
            limitWarning: dailyDrawdownPercent >= 1.5 || drawdownPercent >= 3.5
        };
    }

    resetDailyDrawdown() {
        // In a real prop firm, this usually resets to the current balance or specific rules
        // For simplicity, we reset the daily starting point to current balance
        this.dailyStartBalance = this.highWaterMark;
    }
}

