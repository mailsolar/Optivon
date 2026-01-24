const db = require('./database');

db.serialize(() => {
    db.run("ALTER TABLE accounts ADD COLUMN daily_start_balance REAL", (err) => {
        if (err) console.log('Column might already verify', err.message);
        else console.log('Added daily_start_balance column');
    });
});
