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

        // Base price map to give realistic anchors
        const basePrices = {
            'NIFTY': 22000,
            'BANKNIFTY': 47000,
            'HDFCBANK': 1450,
            'RELIANCE': 2900,
            'INFY': 1600,
            'TCS': 4000
        };

        const startPrice = basePrices[symbol] || 1000; // Default fallback

        // Helper to get interval in ms
        const getIntervalMs = (tf) => {
            if (tf === '1m') return 60 * 1000;
            if (tf === '5m') return 5 * 60 * 1000;
            if (tf === '15m') return 15 * 60 * 1000;
            if (tf === '1H') return 60 * 60 * 1000;
            if (tf === '4H') return 4 * 60 * 60 * 1000;
            if (tf === '1D') return 24 * 60 * 60 * 1000;
            if (tf === '1W') return 7 * 24 * 60 * 60 * 1000;
            if (tf === '1M') return 30 * 24 * 60 * 60 * 1000;
            return 24 * 60 * 60 * 1000; // Default 1D
        };

        const intervalMs = getIntervalMs(timeframe);

        // Generate Data
        const now = Date.now();
        const data = [];
        let currentPrice = startPrice;

        // Generate 500 candles
        for (let i = 500; i >= 0; i--) {
            const time = now - (i * intervalMs);

            // Volatility logic
            const volatilityPercent = 0.002; // 0.2% per bar standard
            const change = currentPrice * volatilityPercent * (Math.random() - 0.5) * 3; // Random walk

            const open = currentPrice;
            const close = open + change;
            const high = Math.max(open, close) + (Math.random() * Math.abs(change) * 0.5);
            const low = Math.min(open, close) - (Math.random() * Math.abs(change) * 0.5);

            data.push({
                time: Math.floor(time / 1000),
                open: Number(open.toFixed(2)),
                high: Number(high.toFixed(2)),
                low: Number(low.toFixed(2)),
                close: Number(close.toFixed(2)),
                volume: Math.floor(Math.random() * 100000)
            });

            currentPrice = close;
        }

        res.json(data);
    } catch (error) {
        console.error("Market History Error:", error);
        res.status(500).json({ error: "Failed to generate history" });
    }
});

module.exports = router;
