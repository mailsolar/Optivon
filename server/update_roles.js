const db = require('./database');

const adminEmail = 'deepaknairm10@gmail.com';
const userEmail = 'dhanish@gmail.com';

db.serialize(() => {
    // 1. Promote Admin
    db.run(`UPDATE users SET is_admin = 1 WHERE email = ?`, [adminEmail], function (err) {
        if (err) return console.error(err.message);
        console.log(`Updated ${adminEmail}: is_admin = 1 (Rows affected: ${this.changes})`);
    });

    // 2. Demote/Ensure Normal User
    db.run(`UPDATE users SET is_admin = 0 WHERE email = ?`, [userEmail], function (err) {
        if (err) return console.error(err.message);
        console.log(`Updated ${userEmail}: is_admin = 0 (Rows affected: ${this.changes})`);
    });
});

// Close after a short delay to ensure queries finish (since run is async but serialized)
setTimeout(() => {
    console.log('Role update complete.');
    // db.close(); // database.js might keep it open, but we just want to exit the script
    process.exit(0);
}, 1000);
