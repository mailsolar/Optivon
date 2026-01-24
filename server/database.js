const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'optivon.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
        initializeTables();
    }
});

function initializeTables() {
    db.serialize(() => {
        // Users
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE,
            password_hash TEXT,
            ip_address TEXT,
            is_admin INTEGER DEFAULT 0,
            two_fa_secret TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Accounts (Updates for Matrix/Challenge Logic)
        db.run(`CREATE TABLE IF NOT EXISTS accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            type TEXT, -- '1-Step', '2-Step'
            phase INTEGER DEFAULT 1,
            size INTEGER, -- 50000, 100000 etc
            balance REAL,
            equity REAL,
            daily_start_balance REAL,
            status TEXT DEFAULT 'pending', -- pending, active, expired, failed, passed
            session_start DATETIME, -- timestamp when launched
            session_expires DATETIME, -- timestamp when session ends
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

        // Trades
        db.run(`CREATE TABLE IF NOT EXISTS trades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            account_id INTEGER,
            symbol TEXT,
            side TEXT,
            lots INTEGER,
            entry_price REAL,
            exit_price REAL,
            status TEXT, -- open, closed
            volume REAL, -- simulated volume impact
            open_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            close_time DATETIME,
            pnl REAL,
            FOREIGN KEY(account_id) REFERENCES accounts(id)
        )`);

        // Violations
        db.run(`CREATE TABLE IF NOT EXISTS violations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            account_id INTEGER,
            type TEXT, -- DailyDD, MaxDD, LotLimit
            details TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(account_id) REFERENCES accounts(id)
        )`);
    });
}

module.exports = db;
