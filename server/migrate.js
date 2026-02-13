const db = require('./database');

db.run("ALTER TABLE violations ADD COLUMN created_at DATETIME DEFAULT '2025-01-01 00:00:00';", (err) => {
    if (err) {
        console.error("Error adding column:", err.message);
    } else {
        console.log("Column 'created_at' added successfully.");
    }
});
