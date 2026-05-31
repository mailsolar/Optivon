const db = require('./database');
const bcrypt = require('bcrypt');

const initUtils = {
    createTables: () => {
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password_hash TEXT,
        is_admin INTEGER DEFAULT 0,
        two_fa_secret TEXT,
        two_fa_pin TEXT, -- 6-digit PIN hash
        two_fa_enabled INTEGER DEFAULT 0,
        email_verified INTEGER DEFAULT 0,
        login_count INTEGER DEFAULT 0,
        skipped_2fa BOOLEAN DEFAULT 0,
        ip_address TEXT,
        next_eligible_purchase_date DATETIME, -- Reset timer
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

            db.run(`CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        type TEXT, -- '1-step', '2-step'
        balance REAL,
        equity REAL,
        status TEXT DEFAULT 'pending_initial_fee', -- 'pending_initial_fee', 'active', 'failed', 'passed_pending_full_fee', 'funded'
        evaluation_fee_paid INTEGER DEFAULT 0,
        full_fee_paid INTEGER DEFAULT 0,
        start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);

            db.run(`CREATE TABLE IF NOT EXISTS trades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER,
        symbol TEXT,
        side TEXT, -- 'buy', 'sell'
        lots REAL,
        entry_price REAL,
        exit_price REAL,
        pnl REAL,
        status TEXT, -- 'open', 'closed'
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(account_id) REFERENCES accounts(id)
      )`);

            db.run(`CREATE TABLE IF NOT EXISTS violations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER,
        type TEXT, -- 'daily_dd', 'max_dd', 'rules'
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(account_id) REFERENCES accounts(id)
      )`);

            db.run(`CREATE TABLE IF NOT EXISTS otps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT,
        otp TEXT,
        type TEXT, -- 'registration', 'recovery'
        expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

            db.run(`CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        type TEXT, -- 'free', 'paid'
        status TEXT DEFAULT 'enrolled', -- 'enrolled', 'completed'
        enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);

            db.run(`CREATE TABLE IF NOT EXISTS exam_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        score REAL,
        passed INTEGER DEFAULT 0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);

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
      )`);

            console.log('Tables created');
        });
    },

    seedAdmin: async () => {
        const email = 'admin@optivon.com';
        const password = 'admin123';
        try {
            const hash = await bcrypt.hash(password, 10);
            db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
                if (err) console.error(err);
                if (!row) {
                    db.run('INSERT INTO users (email, password_hash, is_admin) VALUES (?, ?, 1)', [email, hash], (err) => {
                        if (err) console.error(err);
                        else console.log('Admin user seeded');
                    });
                } else {
                    console.log('Admin user already exists');
                }
            });
        } catch (e) {
            console.error("Hashing error", e);
        }
    }
};

// Run if called directly
if (require.main === module) {
    initUtils.createTables();
    setTimeout(initUtils.seedAdmin, 500); // Wait for tables
}

module.exports = initUtils;
