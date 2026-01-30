const express = require('express');
const router = express.Router();
const algoEngine = require('../engine/algoEngine');
const { authenticateToken } = require('../middleware/auth');

// Get all bots for user
router.get('/bots', authenticateToken, (req, res) => {
    try {
        const bots = algoEngine.getUserBots(req.user.id);
        res.json(bots || []);
    } catch (e) {
        console.error("Get Bots Error:", e);
        res.json([]); // Return empty for safety
    }
});

// Start a new bot
router.post('/start', authenticateToken, (req, res) => {
    const { accountId, symbol, strategy, risk } = req.body;
    if (!accountId || !symbol || !strategy) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    try {
        const bot = algoEngine.startBotAPI(req.user.id, { accountId, symbol, strategy, risk });
        res.json(bot);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Stop a bot
router.post('/stop', authenticateToken, (req, res) => {
    const { botId } = req.body;
    const success = algoEngine.stopBotAPI(req.user.id, botId);
    if (success) {
        res.json({ message: 'Bot stopped' });
    } else {
        res.status(404).json({ error: 'Bot not found or unauthorized' });
    }
});

module.exports = router;
