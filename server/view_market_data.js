const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'optivon.db');
const db = new sqlite3.Database(dbPath);

const output = {
    tables: [],
    rowCount: 0,
    latestRecords: [],
    dataRange: {}
};

db.serialize(() => {
    // 1. List Tables
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
        if (!err) {
            output.tables = rows.map(r => r.name);
        }
    });

    // 2. Get Row Count
    db.get("SELECT COUNT(*) as count FROM market_data", (err, row) => {
        if (!err && row) {
            output.rowCount = row.count;
        }
    });

    // 3. Get Sample Data (Latest 5 rows)
    const sql = `SELECT * FROM market_data ORDER BY timestamp DESC LIMIT 5`;

    db.all(sql, [], (err, rows) => {
        if (!err) {
            output.latestRecords = rows;
        }
    });

    // 4. Get Data Range
    db.get("SELECT MIN(date) as min_date, MAX(date) as max_date FROM market_data", (err, row) => {
        if (!err && row) {
            output.dataRange = row;
        }
    });
});

db.close(() => {
    fs.writeFileSync('market_data_dump.json', JSON.stringify(output, null, 2));
    console.log('Data written to market_data_dump.json');
});
