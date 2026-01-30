export class RiskManager {
    constructor(initialBalance, dailyDrawdownPercent = 2, maxDrawdownPercent = 4) {
        this.initialBalance = initialBalance;
        this.dailyDrawdownLimit = initialBalance * (dailyDrawdownPercent / 100);
        this.maxDrawdownLimit = initialBalance * (maxDrawdownPercent / 100);
        this.dailyStartBalance = initialBalance;
        this.highWaterMark = initialBalance;
    }

    checkDrawdown(currentBalance) {
        // Calculate Losses
        const dailyLoss = this.dailyStartBalance - currentBalance;
        const totalLoss = this.highWaterMark - currentBalance;

        // Calculate Percentages
        const dailyLossPercent = (dailyLoss / this.dailyStartBalance) * 100;
        const maxDrawdownPercent = (totalLoss / this.highWaterMark) * 100;

        // Daily Drawdown Check
        if (dailyLossPercent >= 2) {
            return {
                violated: true,
                type: 'DAILY_DRAWDOWN',
                message: `Daily Limit Exceeded: -${dailyLossPercent.toFixed(2)}%`,
                lockAccount: true
            };
        }

        // Maximum Drawdown Check
        if (maxDrawdownPercent >= 4) {
            return {
                violated: true,
                type: 'MAX_DRAWDOWN',
                message: `Max Drawdown Exceeded: -${maxDrawdownPercent.toFixed(2)}%`,
                lockAccount: true
            };
        }

        // Update High Water Mark if we are profitable
        if (currentBalance > this.highWaterMark) {
            this.highWaterMark = currentBalance;
        }

        return {
            violated: false,
            dailyLossPercent: dailyLossPercent.toFixed(2),
            maxLossPercent: maxDrawdownPercent.toFixed(2),
            limitWarning: dailyLossPercent >= 1.5 || maxDrawdownPercent >= 3.5
        };
    }

    resetDailyDrawdown() {
        // In a real prop firm, this usually resets to the current balance or specific rules
        // For simplicity, we reset the daily starting point to current balance
        this.dailyStartBalance = this.highWaterMark;
    }
}
