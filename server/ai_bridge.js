const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const db = require('./database');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''; 
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

class AIBridge {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
        this.REQUEST_DELAY_MS = 5000; // 5 seconds between requests (12 requests/min, safely under 15 RPM free tier)
    }

    // Add task to queue
    triggerAnalysis(accountId) {
        console.log(`[AI] Queueing analysis for account ${accountId}`);
        db.run(`INSERT OR REPLACE INTO ai_reports (account_id, status) VALUES (?, 'processing')`, [accountId]);
        
        this.queue.push(accountId);
        this.processQueue();
    }

    async processQueue() {
        if (this.isProcessing || this.queue.length === 0) return;
        this.isProcessing = true;

        const accountId = this.queue.shift();

        try {
            await this.analyzeAccount(accountId);
        } catch (error) {
            console.error(`[AI] Error processing queue for account ${accountId}:`, error);
        }

        // Wait before next request to stay within free tier limits
        setTimeout(() => {
            this.isProcessing = false;
            this.processQueue();
        }, this.REQUEST_DELAY_MS);
    }

    compressTrades(trades) {
        if (!trades || trades.length === 0) return { coreMetrics: {}, topWorstTrades: [], compressedSequence: [] };

        let totalWin = 0, totalLoss = 0, wins = 0, losses = 0;
        let worstTrades = [];
        const sequence = [];

        trades.forEach(t => {
            if (t.pnl > 0) {
                totalWin += t.pnl;
                wins++;
                sequence.push(`W:+${t.pnl.toFixed(0)}`);
            } else {
                totalLoss += Math.abs(t.pnl);
                losses++;
                sequence.push(`L:${t.pnl.toFixed(0)}`);
                worstTrades.push(t);
            }
        });

        // Sort to find the 5 worst trades
        worstTrades.sort((a, b) => a.pnl - b.pnl);
        const topWorstTrades = worstTrades.slice(0, 5).map(t => ({
            symbol: t.symbol,
            side: t.side,
            loss: t.pnl.toFixed(2),
            lots: t.lots,
            hold_time_mins: Math.round((new Date(t.close_time) - new Date(t.open_time)) / 60000) || 0
        }));

        const coreMetrics = {
            total_trades: trades.length,
            win_rate: ((wins / trades.length) * 100).toFixed(1) + '%',
            average_win: wins > 0 ? (totalWin / wins).toFixed(2) : 0,
            average_loss: losses > 0 ? (totalLoss / losses).toFixed(2) : 0,
        };

        return { coreMetrics, topWorstTrades, compressedSequence: sequence };
    }

    async analyzeAccount(accountId) {
        console.log(`[AI] Executing analysis for account ${accountId}`);

        if (!GEMINI_API_KEY) {
            console.warn(`[AI] GEMINI_API_KEY is missing. Mocking completion.`);
            db.run(`UPDATE ai_reports SET status = 'failed', failure_reason = 'API Key missing' WHERE account_id = ?`, [accountId]);
            return;
        }

        const trades = await new Promise((resolve, reject) => {
            db.all(`SELECT * FROM trades WHERE account_id = ? AND status = 'closed' ORDER BY close_time ASC`, [accountId], (err, rows) => {
                if (err) reject(err); else resolve(rows);
            });
        });

        const account = await new Promise((resolve, reject) => {
            db.get(`SELECT * FROM accounts WHERE id = ?`, [accountId], (err, row) => {
                if (err) reject(err); else resolve(row);
            });
        });

        if (!account || trades.length === 0) {
            db.run(`UPDATE ai_reports SET status = 'failed', failure_reason = 'No closed trades found' WHERE account_id = ?`, [accountId]);
            return;
        }

        const { coreMetrics, topWorstTrades, compressedSequence } = this.compressTrades(trades);

        const prompt = `
Analyze the failed trading challenge for account size ₹${account.size}.
Core Metrics: ${JSON.stringify(coreMetrics)}
Top 5 Worst Trades: ${JSON.stringify(topWorstTrades)}
Sequence of Outcomes: ${JSON.stringify(compressedSequence)}

Return ONLY a strict JSON object (no markdown formatting, no code blocks) matching exactly this schema:
{
  "analytics": {
    "core_metrics": {"win_rate": "string", "risk_reward_ratio": "string", "overall_assessment": "string"},
    "behavioral_issues": [
      {"behavior": "Revenge Trading / Overleveraging / etc", "severity": "High/Medium/Low", "count": 1}
    ],
    "psychology": {"strengths": ["string"], "weaknesses": ["string"]}
  },
  "coaching": {
    "summary": "string",
    "actionable_steps": ["string"]
  }
}`;

        try {
            const res = await fetch(GEMINI_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.2, responseMimeType: "application/json" }
                })
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Gemini API Error: ${res.status} ${errText}`);
            }

            const data = await res.json();
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (!textResponse) throw new Error('Empty response from AI');

            const parsed = JSON.parse(textResponse);

            db.run(`
                UPDATE ai_reports 
                SET status = 'completed', 
                    core_metrics = ?, 
                    behavioral_flags = ?, 
                    psychology_profile = ?, 
                    coaching_output = ?,
                    completed_at = CURRENT_TIMESTAMP
                WHERE account_id = ?`,
                [
                    JSON.stringify(parsed.analytics?.core_metrics || coreMetrics),
                    JSON.stringify(parsed.analytics?.behavioral_issues || []),
                    JSON.stringify(parsed.analytics?.psychology || {}),
                    JSON.stringify(parsed.coaching || {}),
                    accountId
                ]
            );

            console.log(`[AI] Analysis completed & saved for account ${accountId}`);
        } catch (e) {
            console.error(`[AI] Analysis failed for account ${accountId}:`, e.message);
            db.run(`UPDATE ai_reports SET status = 'failed', failure_reason = ? WHERE account_id = ?`, [e.message, accountId]);
        }
    }
}

module.exports = new AIBridge();
