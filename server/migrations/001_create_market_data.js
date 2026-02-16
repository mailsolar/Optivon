const db = require('../database');

/**
 * Migration to add market_data table for historical NIFTY/BANKNIFTY data
 * 
 * Specifications:
 * - 375 candles per day (9:15 AM - 3:30 PM IST)
 * - ~900 days of historical data
 * - Supports NIFTY and BANKNIFTY
 */

function createMarketDataTable() {
    return new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE IF NOT EXISTS market_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,           -- 'NIFTY' or 'BANKNIFTY'
                date DATE NOT NULL,             -- Trading date (YYYY-MM-DD)
                time TIME NOT NULL,             -- Candle time (HH:MM:SS)
                timestamp INTEGER NOT NULL,     -- UNIX timestamp for easy sorting
                open REAL NOT NULL,             -- Opening price
                high REAL NOT NULL,             -- High price
                low REAL NOT NULL,              -- Low price
                close REAL NOT NULL,            -- Closing price
                volume INTEGER DEFAULT 0,       -- Trading volume
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('Error creating market_data table:', err);
                reject(err);
            } else {
                console.log('✓ market_data table created');
                resolve();
            }
        });
    });
}

function createIndexes() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Index for fast day retrieval
            db.run(`
                CREATE INDEX IF NOT EXISTS idx_market_symbol_date_time 
                ON market_data(symbol, date, time)
            `, (err) => {
                if (err) console.error('Error creating index 1:', err);
                else console.log('✓ Index created: symbol_date_time');
            });

            // Index for random day selection
            db.run(`
                CREATE INDEX IF NOT EXISTS idx_market_symbol_date 
                ON market_data(symbol, date)
            `, (err) => {
                if (err) console.error('Error creating index 2:', err);
                else console.log('✓ Index created: symbol_date');
            });

            // Index for timestamp queries
            db.run(`
                CREATE INDEX IF NOT EXISTS idx_market_timestamp 
                ON market_data(timestamp)
            `, (err) => {
                if (err) {
                    console.error('Error creating index 3:', err);
                    reject(err);
                } else {
                    console.log('✓ Index created: timestamp');
                    resolve();
                }
            });
        });
    });
}

async function runMigration() {
    try {
        console.log('🚀 Starting market data migration...\n');

        await createMarketDataTable();
        await createIndexes();

        console.log('\n✅ Migration completed successfully!');
        console.log('\nNext steps:');
        console.log('1. Run: node server/utils/importMarketData.js');
        console.log('2. Populate with historical data');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    runMigration();
}

module.exports = { createMarketDataTable, createIndexes };
