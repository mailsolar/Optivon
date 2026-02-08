const db = require('./database');

db.serialize(() => {
    console.log("Starting Auth Migration...");

    // 1. Add columns to users table
    const columns = [
        "ALTER TABLE users ADD COLUMN two_fa_pin TEXT",
        "ALTER TABLE users ADD COLUMN two_fa_enabled INTEGER DEFAULT 0",
        "ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0"
    ];

    columns.forEach(query => {
        db.run(query, (err) => {
            if (err && !err.message.includes("duplicate column")) {
                console.error("Migration Error:", err.message);
            } else {
                console.log("Executed:", query);
            }
        });
    });

    // 2. Create OTPs table
    db.run(`CREATE TABLE IF NOT EXISTS otps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT,
        otp TEXT,
        type TEXT, -- 'registration', 'recovery'
        expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error("OTP Table Error:", err);
        else console.log("OTP Table Created/Verified");
    });
});
