const db = require('../database');

/**
 * Sample Market Data Generator
 * 
 * Generates realistic-looking NIFTY/BANKNIFTY candles for testing
 * This is TEMPORARY - will be replaced with real historical data
 * 
 * Usage: node server/utils/generateSampleData.js
 */

function generateRealisticCandle(prevClose, volatility = 0.002) {
    // Random walk with slight trend
    const trend = (Math.random() - 0.48) * volatility;
    const open = prevClose * (1 + trend);

    // High/Low with realistic spread
    const range = prevClose * volatility * (0.5 + Math.random());
    const high = open + range * Math.random();
    const low = open - range * Math.random();

    // Close within high/low
    const close = low + (high - low) * Math.random();

    // Volume with some variation
    const baseVolume = 100000;
    const volume = Math.floor(baseVolume * (0.5 + Math.random() * 1.5));

    return {
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(Math.max(open, high, close).toFixed(2)),
        low: parseFloat(Math.min(open, low, close).toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume
    };
}

function generateTradingDay(symbol, date, startPrice) {
    const candles = [];
    const startHour = 9;
    const startMinute = 15;
    const totalCandles = 375; // 9:15 AM to 3:30 PM

    let currentPrice = startPrice;

    for (let i = 0; i < totalCandles; i++) {
        const totalMinutes = startMinute + i;
        const hour = startHour + Math.floor(totalMinutes / 60);
        const minute = totalMinutes % 60;

        const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;

        // Create date-time for timestamp
        const dateTime = new Date(`${date}T${timeStr}+05:30`);
        const timestamp = Math.floor(dateTime.getTime() / 1000);

        // Generate candle
        const volatility = symbol === 'BANKNIFTY' ? 0.003 : 0.002;
        const candle = generateRealisticCandle(currentPrice, volatility);

        candles.push({
            symbol,
            date,
            time: timeStr,
            timestamp,
            ...candle
        });

        currentPrice = candle.close;
    }

    return candles;
}

async function insertCandles(candles) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            INSERT INTO market_data (symbol, date, time, timestamp, open, high, low, close, volume)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        db.serialize(() => {
            db.run('BEGIN TRANSACTION');

            for (const candle of candles) {
                stmt.run(
                    candle.symbol,
                    candle.date,
                    candle.time,
                    candle.timestamp,
                    candle.open,
                    candle.high,
                    candle.low,
                    candle.close,
                    candle.volume
                );
            }

            db.run('COMMIT', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        stmt.finalize();
    });
}

function getRandomTradingDate(year, month) {
    // Get a random weekday (Mon-Fri)
    const day = Math.floor(Math.random() * 28) + 1;
    const date = new Date(year, month, day);

    // Skip weekends
    if (date.getDay() === 0) date.setDate(date.getDate() + 1); // Sunday -> Monday
    if (date.getDay() === 6) date.setDate(date.getDate() + 2); // Saturday -> Monday

    return date.toISOString().split('T')[0];
}

async function generateSampleData(numDays = 30) {
    console.log(`🎲 Generating ${numDays} days of sample market data...\n`);

    const symbols = [
        { name: 'NIFTY', startPrice: 21500 },
        { name: 'BANKNIFTY', startPrice: 45000 }
    ];

    let totalCandles = 0;

    for (const symbol of symbols) {
        console.log(`📊 Generating ${symbol.name} data...`);
        let currentPrice = symbol.startPrice;

        for (let i = 0; i < numDays; i++) {
            // Generate random date in the past
            const year = 2024;
            const month = Math.floor(Math.random() * 12);
            const date = getRandomTradingDate(year, month);

            // Generate day's candles
            const candles = generateTradingDay(symbol.name, date, currentPrice);

            // Insert into database
            await insertCandles(candles);

            // Update price for next day
            currentPrice = candles[candles.length - 1].close;
            totalCandles += candles.length;

            process.stdout.write(`\r   Progress: ${i + 1}/${numDays} days`);
        }

        console.log(` ✓`);
    }

    console.log(`\n✅ Generated ${totalCandles} candles successfully!`);
    console.log(`\nNext steps:`);
    console.log(`1. Start server: npm start`);
    console.log(`2. Test WebSocket: ws://localhost:5000/market`);
}

// Run if called directly
if (require.main === module) {
    const numDays = process.argv[2] ? parseInt(process.argv[2]) : 30;

    generateSampleData(numDays)
        .then(() => {
            console.log('\n🎉 Sample data generation complete!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Error generating data:', error);
            process.exit(1);
        });
}

module.exports = { generateSampleData, generateTradingDay };
