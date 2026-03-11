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

// 3. Status check — for frontend diagnostics
router.get('/status', (req, res) => {
    console.log('[Upstox] GET /status hit');
    const svc = upstoxService;
    const secondsSinceToken = svc.tokenLoadedAt
        ? Math.floor((Date.now() - svc.tokenLoadedAt) / 1000)
        : null;

    res.json({
        authenticated: svc.isAuthenticated,
        polling: !!svc.pollInterval,
        symbol: svc.currentSymbol,
        tokenAge: secondsSinceToken ? `${secondsSinceToken}s ago` : 'unknown',
        error: svc.lastError || (!svc.isAuthenticated ? 'Auth missing. Click Login Upstox.' : null)
    });
});

// 4. Get Intraday History
router.get('/intraday', async (req, res) => {
    try {
        const symbol = req.query.symbol;
        console.log('[Upstox] GET /intraday hit for', symbol);
        const interval = req.query.interval || '1m';
        const data = await upstoxService.getIntradayHistory(symbol, interval);

        const symbolName = symbol.includes('|') ? (symbol.includes('50') ? 'NIFTY' : (symbol.includes('Bank') ? 'BANKNIFTY' : symbol)) : symbol;
        upstoxService.startPolling(symbolName);

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
