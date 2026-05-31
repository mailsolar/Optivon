const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const db = require('../database');

// Enroll in a course (Free or Paid)
router.post('/enroll', authenticateToken, (req, res) => {
    const { type } = req.body; // 'free' or 'paid'
    
    if (type !== 'free' && type !== 'paid') {
        return res.status(400).send({ error: 'Invalid course type' });
    }

    db.run("INSERT INTO courses (user_id, type, status) VALUES (?, ?, 'enrolled')", [req.user.id, type], (err) => {
        if (err) return res.status(500).send({ error: 'Enrollment failed' });
        res.status(201).send({ message: `Successfully enrolled in ${type} course` });
    });
});

// Get User's Courses
router.get('/courses', authenticateToken, (req, res) => {
    db.all("SELECT * FROM courses WHERE user_id = ?", [req.user.id], (err, rows) => {
        if (err) return res.status(500).send({ error: 'Database error' });
        res.send(rows);
    });
});

// Submit Learning Verification Exam
router.post('/exam/submit', authenticateToken, (req, res) => {
    const { score, passed } = req.body;

    if (score === undefined || passed === undefined) {
        return res.status(400).send({ error: 'Missing score or passed status' });
    }

    db.run("INSERT INTO exam_attempts (user_id, score, passed) VALUES (?, ?, ?)", [req.user.id, score, passed ? 1 : 0], function (err) {
        if (err) return res.status(500).send({ error: 'Failed to record exam attempt' });

        if (passed) {
            // Update the next_eligible_purchase_date to 1 month from now instead of 6 months
            const resetDate = new Date();
            resetDate.setMonth(resetDate.getMonth() + 1);

            db.run("UPDATE users SET next_eligible_purchase_date = ? WHERE id = ?", [resetDate.toISOString(), req.user.id], (err) => {
                if (err) return res.status(500).send({ error: 'Failed to update reset timer' });
                res.send({ message: 'Exam passed! Your reset timer has been reduced to 1 month. You can now repurchase an account for ₹500.' });
            });
        } else {
            res.send({ message: 'Exam failed. Please review the course materials and try again.' });
        }
    });
});

module.exports = router;
