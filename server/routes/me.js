// Get Current User
router.get('/me', authenticateToken, (req, res) => {
    // Return fuller detail if needed, or just confirmation
    res.send({ user: req.user });
});
