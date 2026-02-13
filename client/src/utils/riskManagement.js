export class RiskManager {
    constructor(initialBalance, dailyDrawdownPercent = 2, maxDrawdownPercent = 4) {
        this.initialBalance = initialBalance;
        this.dailyDrawdownLimit = initialBalance * (dailyDrawdownPercent / 100);
        this.maxDrawdownLimit = initialBalance * (maxDrawdownPercent / 100);
        this.dailyStartBalance = initialBalance;
        this.highWaterMark = initialBalance;
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
        if (dailyDrawdownPercent >= 2) {
            return {
                violated: true,
                type: 'DAILY_DRAWDOWN',
                message: `Daily Limit Exceeded: -${dailyDrawdownPercent.toFixed(2)}%`,
                lockAccount: true
            };
        }

        // Maximum Drawdown Check
        if (drawdownPercent >= 4) {
            return {
                violated: true,
                type: 'MAX_DRAWDOWN',
                message: `Max Drawdown Exceeded: -${drawdownPercent.toFixed(2)}%`,
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

