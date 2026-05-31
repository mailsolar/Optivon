const db = require('../database');

console.log('Running Migration 003: Security Overhaul - Login Tracking...');

db.serialize(() => {
    // 1. Add login_count
    db.run(`ALTER TABLE users ADD COLUMN login_count INTEGER DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.error('Error adding login_count:', err.message);
        } else {
            console.log('Added login_count to users table.');
        }
    });

    // 2. Add skipped_2fa
    db.run(`ALTER TABLE users ADD COLUMN skipped_2fa BOOLEAN DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.error('Error adding skipped_2fa:', err.message);
        } else {
            console.log('Added skipped_2fa to users table.');
        }
    });
});
