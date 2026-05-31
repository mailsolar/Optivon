const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const db = require('../database');
const aiBridge = require('../ai_bridge');

// Get AI Report for an Account
router.get('/report/:accountId', authenticateToken, (req, res) => {
    const { accountId } = req.params;

    // First check if the user owns this account
    db.get('SELECT * FROM accounts WHERE id = ? AND user_id = ?', [accountId, req.user.id], (err, account) => {
        if (err || !account) return res.status(404).send({ error: 'Account not found' });

        // Fetch the report
        db.get('SELECT * FROM ai_reports WHERE account_id = ?', [accountId], (err, report) => {
            if (err) return res.status(500).send({ error: 'Database error' });
            if (!report) return res.status(404).send({ error: 'No report found', status: 'none' });

            res.send({
                ...report,
                core_metrics: report.core_metrics ? JSON.parse(report.core_metrics) : null,
                behavioral_flags: report.behavioral_flags ? JSON.parse(report.behavioral_flags) : null,
                psychology_profile: report.psychology_profile ? JSON.parse(report.psychology_profile) : null,
                coaching_output: report.coaching_output ? JSON.parse(report.coaching_output) : null
            });
        });
    });
});

// Get AI Analysis Status
router.get('/status/:accountId', authenticateToken, (req, res) => {
    const { accountId } = req.params;
    
    db.get('SELECT * FROM accounts WHERE id = ? AND user_id = ?', [accountId, req.user.id], (err, account) => {
        if (err || !account) return res.status(404).send({ error: 'Account not found' });

        db.get('SELECT status, created_at, completed_at FROM ai_reports WHERE account_id = ?', [accountId], (err, report) => {
            if (err) return res.status(500).send({ error: 'Database error' });
            if (!report) return res.send({ status: 'none' });
            
            res.send(report);
        });
    });
});

// Manual Trigger for AI Analysis (if not already processing/completed)
router.post('/analyze/:accountId', authenticateToken, (req, res) => {
    const { accountId } = req.params;

    db.get('SELECT * FROM accounts WHERE id = ? AND user_id = ?', [accountId, req.user.id], (err, account) => {
        if (err || !account) return res.status(404).send({ error: 'Account not found' });

        // Only analyze if failed or completed (not active)
        if (account.status === 'active' || account.status === 'pending') {
            return res.status(400).send({ error: 'Can only analyze inactive accounts' });
        }

        db.get('SELECT status FROM ai_reports WHERE account_id = ?', [accountId], (err, report) => {
            if (err) return res.status(500).send({ error: 'Database error' });
            
            if (report && (report.status === 'processing' || report.status === 'completed')) {
                return res.status(400).send({ error: `Analysis already ${report.status}` });
            }

            // Trigger non-blocking analysis
            aiBridge.triggerAnalysis(accountId);
            res.send({ message: 'Analysis triggered', status: 'processing' });
        });
    });
});

module.exports = router;
