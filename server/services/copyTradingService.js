const db = require('../database');

class CopyTradingService {
    // Identifies traders with consistent profitability to potentially mirror their trades
    identifyProfitableTraders() {
        console.log('[CopyTrading] Analyzing traders for consistency...');
        
        // Simple metric for now: accounts that have reached funded stage and have a win rate > 60%
        const query = `
            SELECT a.id as account_id, a.user_id, 
                   COUNT(t.id) as total_trades,
                   SUM(CASE WHEN t.pnl > 0 THEN 1 ELSE 0 END) as winning_trades
            FROM accounts a
            JOIN trades t ON a.id = t.account_id
            WHERE a.status = 'funded' AND t.status = 'closed'
            GROUP BY a.id
            HAVING total_trades >= 10
        `;

        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('[CopyTrading] Error identifying traders:', err.message);
                return;
            }

            rows.forEach(row => {
                const winRate = row.winning_trades / row.total_trades;
                if (winRate > 0.60) {
                    console.log(`[CopyTrading] Flagged Account ${row.account_id} (Win Rate: ${(winRate * 100).toFixed(1)}%) for potential mirroring.`);
                    // Here we would add them to a 'master_copy_list' table, which the order execution engine would watch.
                }
            });
        });
    }

    startCronJob() {
        // Run analysis daily
        setInterval(() => this.identifyProfitableTraders(), 24 * 60 * 60 * 1000);
    }
}

module.exports = new CopyTradingService();
