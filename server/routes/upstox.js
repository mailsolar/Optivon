const express = require('express');
const router = express.Router();
const upstoxService = require('../services/upstox');

// 1. Redirect to Upstox Login
router.get('/login', (req, res) => {
    const loginUrl = upstoxService.getLoginUrl();
    res.redirect(loginUrl);
});

// 2. Callback URL
router.get('/callback', async (req, res) => {
    const { code } = req.query;
    console.log('[Upstox] Callback received with code:', code);

    if (!code) return res.status(400).send('No code provided');

    try {
        console.log('[Upstox] Exchanging code for token...');
        const tokenData = await upstoxService.handleCallback(code);
        console.log('[Upstox] Token exchange successful. Redirecting to frontend...');

        // Redirect back to main application
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    } catch (error) {
        console.error('[Upstox] Callback Error:', error);
        res.status(500).send('Login Failed: ' + error.message);
    }
});

// 3. Get Intraday History
// GET /api/upstox/intraday?symbol=NSE_EQ|INE848I01012
router.get('/intraday', async (req, res) => {
    try {
        const symbol = req.query.symbol;
        const data = await upstoxService.getIntradayHistory(symbol);

        // Start Real-Time Polling for this symbol
        // The service is already initialized in index.js
        upstoxService.startPolling(req.query.symbolName || 'NIFTY');

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
