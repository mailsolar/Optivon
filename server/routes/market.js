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

module.exports = router;
