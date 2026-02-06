const express = require('express');
const router = express.Router();
const market = require('../engine/market');

// Get current quotes
router.get('/quotes', (req, res) => {
    const nifty = market.getQuote('NIFTY');
    const banknifty = market.getQuote('BANKNIFTY');
    res.send({ NIFTY: nifty, BANKNIFTY: banknifty });
});

// SSE Stream (Optional enhancement for smoother ticks)
router.get('/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const sendTick = (tick) => {
        res.write(`data: ${JSON.stringify(tick)}\n\n`);
    };

    market.on('tick', sendTick);

    req.on('close', () => {
        market.off('tick', sendTick);
    });
});

// Mock History Endpoint
router.get('/history/:symbol', (req, res) => {
    try {
        const { symbol } = req.params;
        const { timeframe = '1D' } = req.query;

        // 1. Get Live Price as Anchor
        // This ensures the history ends EXACTLY where the live chart starts
        const liveQuote = market.getQuote(symbol);
        let currentPrice = liveQuote?.ltp;

        // Fallback Randomizer if market engine hasn't ticked yet
        if (!currentPrice) {
            const basePrices = {
                'NIFTY': 22000,
                'BANKNIFTY': 47000,
                'HDFCBANK': 1450,
                'RELIANCE': 2900
            };
            const base = basePrices[symbol] || 1000;
            // Add jitter so it's not always 22000
            currentPrice = base + (Math.random() * 1000 - 500);
        }

        // Helper to get interval in ms
        const getIntervalMs = (tf) => {
            if (tf === '1m') return 60 * 1000;
            if (tf === '5m') return 5 * 60 * 1000;
            if (tf === '15m') return 15 * 60 * 1000;
            if (tf === '1H') return 60 * 60 * 1000;
            if (tf === '4H') return 4 * 60 * 60 * 1000;
            if (tf === '1D') return 24 * 60 * 60 * 1000;
            return 24 * 60 * 60 * 1000;
        };

        const intervalMs = getIntervalMs(timeframe);
        const data = [];
        const now = Date.now();

        // 2. Generate Backwards from Current Price
        // We simulate "Reverse Time" to ensure the graph meets the current price point
        let runningPrice = currentPrice;

        for (let i = 0; i < 500; i++) {
            const time = now - (i * intervalMs);

            // Volatility
            const change = runningPrice * 0.002 * (Math.random() - 0.5) * 5;

            // In reverse, we subtract change to find "yesterday's" close
            // Actually: Close(T) = Close(T-1) + Change
            // So: Close(T-1) = Close(T) - Change
            const prevClose = runningPrice - change;

            // Build Candle for T
            // Open(T) approx Close(T-1)
            const open = prevClose;
            const close = runningPrice;
            const high = Math.max(open, close) + (Math.random() * Math.abs(change));
            const low = Math.min(open, close) - (Math.random() * Math.abs(change));

            data.unshift({
                time: Math.floor(time / 1000),
                open: Number(open.toFixed(2)),
                high: Number(high.toFixed(2)),
                low: Number(low.toFixed(2)),
                close: Number(close.toFixed(2)),
                volume: Math.floor(Math.random() * 10000)
            });

            runningPrice = prevClose; // Step back
        }

        res.json(data);
    } catch (error) {
        console.error("Market History Error:", error);
        res.status(500).json({ error: "Failed to generate history" });
    }
});

module.exports = router;
