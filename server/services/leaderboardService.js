const db = require('../database');

class LeaderboardService {
    // Generates the weekly leaderboard by aggregating PnL for active accounts over the past 7 days
    generateWeeklyLeaderboard() {
        console.log('[Leaderboard] Generating weekly leaderboard...');
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        const weekStartStr = weekStart.toISOString();

        // Calculate returns for the week per account
        const query = `
            SELECT t.account_id, a.user_id, SUM(t.pnl) as total_pnl, a.size
            FROM trades t
            JOIN accounts a ON t.account_id = a.id
            WHERE t.close_time >= ? AND t.status = 'closed'
            GROUP BY t.account_id
            ORDER BY total_pnl DESC
            LIMIT 100
        `;

        db.all(query, [weekStartStr], (err, rows) => {
            if (err) {
                console.error('[Leaderboard] Error generating leaderboard:', err.message);
                return;
            }

            // Insert into leaderboards table
            rows.forEach(row => {
                const returnPct = (row.total_pnl / row.size) * 100;
                db.run(`INSERT INTO leaderboards (account_id, user_id, week_start, return_pct, is_public)
                        VALUES (?, ?, ?, ?, 1)`,
                    [row.account_id, row.user_id, weekStartStr, returnPct],
                    (err) => {
                        if (err) console.error('[Leaderboard] Error inserting row:', err.message);
                    }
                );
            });
            console.log('[Leaderboard] Weekly leaderboard generated.');
        });
    }

    startCronJob() {
        // Run every Sunday at midnight (Simplified to 7-day interval for simulation)
        setInterval(() => this.generateWeeklyLeaderboard(), 7 * 24 * 60 * 60 * 1000);
    }
}

module.exports = new LeaderboardService();
