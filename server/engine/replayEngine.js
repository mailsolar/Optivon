const db = require('../database');

/**
 * Replay Engine for Optivon Market Data API
 * 
 * Responsibilities:
 * - Load random historical trading days
 * - Stream 375 candles (9:15 AM - 3:30 PM)
 * - Support multiple concurrent sessions
 * - Handle speed controls (1x, 2x, 5x)
 */

class ReplayEngine {
    constructor() {
        this.sessions = new Map(); // sessionId -> session data
        this.intervals = new Map(); // sessionId -> interval timer
    }

    /**
     * Get list of available trading days for a symbol
     */
    async getAvailableDays(symbol) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT DISTINCT date FROM market_data 
                 WHERE symbol = ? 
                 ORDER BY date DESC`,
                [symbol],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows.map(r => r.date));
                }
            );
        });
    }

    /**
     * Select a random trading day
     */
    async getRandomDay(symbol) {
        const days = await this.getAvailableDays(symbol);
        if (days.length === 0) {
            throw new Error(`No historical data available for ${symbol}`);
        }
        const randomIndex = Math.floor(Math.random() * days.length);
        return days[randomIndex];
    }

    /**
     * Load all 375 candles for a specific day
     */
    async loadDayData(symbol, date) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT timestamp, open, high, low, close, volume, time
                 FROM market_data 
                 WHERE symbol = ? AND date = ?
                 ORDER BY timestamp ASC`,
                [symbol, date],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    /**
     * Start a new replay session
     * 
     * @param {string} sessionId - Unique session identifier
     * @param {string} symbol - 'NIFTY' or 'BANKNIFTY'
     * @param {function} onCandle - Callback for each candle
     * @param {object} options - { speed: 1, randomDay: true, specificDate: null }
     */
    async startSession(sessionId, symbol, onCandle, options = {}) {
        const { speed = 1, randomDay = true, specificDate = null } = options;

        // Stop existing session if any
        this.stopSession(sessionId);

        // Select trading day
        const date = specificDate || await this.getRandomDay(symbol);

        // Load all candles for the day
        const candles = await this.loadDayData(symbol, date);

        if (candles.length === 0) {
            throw new Error(`No data found for ${symbol} on ${date}`);
        }

        console.log(`🎬 Starting replay session ${sessionId}`);
        console.log(`   Symbol: ${symbol}`);
        console.log(`   Date: ${date} (hidden from trader)`);
        console.log(`   Candles: ${candles.length}`);
        console.log(`   Speed: ${speed}x`);

        // Store session data
        this.sessions.set(sessionId, {
            symbol,
            date,
            candles,
            currentIndex: 0,
            speed,
            isPaused: false,
            startTime: Date.now(),
            onCandle // Store callback
        });

        // Start streaming
        this._streamCandles(sessionId);

        return {
            sessionId,
            symbol,
            totalCandles: candles.length,
            speed
        };
    }

    /**
     * Internal method to stream candles
     */
    _streamCandles(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) return;

        const intervalMs = 1000 / session.speed; // Adjust interval based on speed

        const interval = setInterval(() => {
            if (session.isPaused) return;

            if (session.currentIndex >= session.candles.length) {
                // Session complete
                this.stopSession(sessionId);
                if (session.onCandle) session.onCandle({ type: 'session_end', sessionId });
                return;
            }

            const candle = session.candles[session.currentIndex];

            // Send candle (without revealing actual date)
            if (session.onCandle) {
                session.onCandle({
                    type: 'candle',
                    sessionId,
                    data: {
                        time: candle.timestamp,
                        open: candle.open,
                        high: candle.high,
                        low: candle.low,
                        close: candle.close,
                        volume: candle.volume
                    },
                    progress: {
                        current: session.currentIndex + 1,
                        total: session.candles.length
                    }
                });
            }

            session.currentIndex++;
        }, intervalMs);

        this.intervals.set(sessionId, interval);
    }

    /**
     * Update the callback for an existing session (used for reconnection)
     */
    updateCallback(sessionId, newCallback) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.onCandle = newCallback;
            return true;
        }
        return false;
    }

    /**
     * Get historical candles for the current session (for catch-up)
     */
    getHistory(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) return [];

        // Return all candles processed so far
        // Map them to the same format as the live stream
        return session.candles.slice(0, session.currentIndex).map(candle => ({
            time: candle.timestamp,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
            volume: candle.volume
        }));
    }

    /**
     * Pause a session
     */
    pauseSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.isPaused = true;
            console.log(`⏸ Session ${sessionId} paused`);
        }
    }

    /**
     * Resume a session
     */
    resumeSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.isPaused = false;
            console.log(`▶ Session ${sessionId} resumed`);
        }
    }

    /**
     * Change playback speed
     */
    /**
     * Change playback speed
     */
    setSpeed(sessionId, speed) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.speed = speed;
            // Restart interval with new speed
            const interval = this.intervals.get(sessionId);
            if (interval) {
                clearInterval(interval);
            }
            // Add safety check
            if (!session.isPaused) {
                this._streamCandles(sessionId);
            }
            console.log(`⚡ Session ${sessionId} speed set to ${speed}x`);
        }
    }

    /**
     * Stop and cleanup a session
     */
    stopSession(sessionId) {
        const interval = this.intervals.get(sessionId);
        if (interval) {
            clearInterval(interval);
            this.intervals.delete(sessionId);
        }
        this.sessions.delete(sessionId);
        console.log(`⏹ Session ${sessionId} stopped`);
    }

    /**
     * Get session status
     */
    getSessionStatus(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) return null;

        return {
            sessionId,
            symbol: session.symbol,
            currentCandle: session.currentIndex,
            totalCandles: session.candles.length,
            progress: ((session.currentIndex / session.candles.length) * 100).toFixed(2),
            speed: session.speed,
            isPaused: session.isPaused
        };
    }

    /**
     * Get all active sessions
     */
    getActiveSessions() {
        return Array.from(this.sessions.keys());
    }

    /**
     * Cleanup all sessions
     */
    cleanup() {
        for (const sessionId of this.sessions.keys()) {
            this.stopSession(sessionId);
        }
        console.log('🧹 All sessions cleaned up');
    }
}

// Singleton instance
const replayEngine = new ReplayEngine();

module.exports = replayEngine;
