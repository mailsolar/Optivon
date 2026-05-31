const db = require('../database');

db.serialize(() => {
    console.log("Running migration 002...");

    // Alter users table
    db.run("ALTER TABLE users ADD COLUMN next_eligible_purchase_date DATETIME;", (err) => {
        if (err) console.error("Error altering users:", err.message);
        else console.log("Added next_eligible_purchase_date to users.");
    });

    // Alter accounts table (status change doesn't require column addition, just data update if needed, but we do need new columns)
    db.run("ALTER TABLE accounts ADD COLUMN evaluation_fee_paid INTEGER DEFAULT 0;", (err) => {
        if (err) console.error("Error altering accounts evaluation_fee_paid:", err.message);
        else console.log("Added evaluation_fee_paid to accounts.");
    });

    db.run("ALTER TABLE accounts ADD COLUMN full_fee_paid INTEGER DEFAULT 0;", (err) => {
        if (err) console.error("Error altering accounts full_fee_paid:", err.message);
        else console.log("Added full_fee_paid to accounts.");
    });

    // Create new tables
    db.run(`CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        type TEXT, -- 'free', 'paid'
        status TEXT DEFAULT 'enrolled', -- 'enrolled', 'completed'
        enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`, (err) => {
        if (err) console.error("Error creating courses:", err.message);
        else console.log("Created courses table.");
    });

    db.run(`CREATE TABLE IF NOT EXISTS exam_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        score REAL,
        passed INTEGER DEFAULT 0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`, (err) => {
        if (err) console.error("Error creating exam_attempts:", err.message);
        else console.log("Created exam_attempts table.");
    });

    db.run(`CREATE TABLE IF NOT EXISTS leaderboards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER,
        user_id INTEGER,
        week_start DATETIME,
        return_pct REAL,
        is_public INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(account_id) REFERENCES accounts(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`, (err) => {
        if (err) console.error("Error creating leaderboards:", err.message);
        else console.log("Created leaderboards table.");
    });

    console.log("Migration 002 complete.");
});
