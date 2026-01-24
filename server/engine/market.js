const EventEmitter = require('events');

class Market extends EventEmitter {
    constructor() {
        super();
        this.instruments = {
            'NIFTY': { price: 21500, volatility: 5, spreadMin: 1, spreadMax: 4 }, // Spread > 3 rejection rule
            'BANKNIFTY': { price: 46000, volatility: 10, spreadMin: 2, spreadMax: 8 } // Spread > 6 rejection rule
        };
        this.ticks = {};
        this.interval = null;
        this.isRunning = false;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log('Market Simulation Started');

        this.interval = setInterval(() => {
            this.activeLoop();
        }, 1000); // 1 tick per second
    }

    stop() {
        if (this.interval) clearInterval(this.interval);
        this.isRunning = false;
    }

    activeLoop() {
        const now = new Date();
        // Simple random walk
        for (const [symbol, data] of Object.entries(this.instruments)) {
            const change = (Math.random() - 0.5) * data.volatility;
            data.price += change;
            data.price = parseFloat(data.price.toFixed(2));

            // Calculate Spread
            const spread = data.spreadMin + Math.random() * (data.spreadMax - data.spreadMin);

            const bid = parseFloat((data.price - (spread / 2)).toFixed(2));
            const ask = parseFloat((data.price + (spread / 2)).toFixed(2));

            const tickData = {
                symbol,
                ltp: data.price,
                bid,
                ask,
                spread: parseFloat(spread.toFixed(2)),
                timestamp: now.toISOString()
            };

            this.ticks[symbol] = tickData;
            this.emit('tick', tickData);
        }
    }

    getQuote(symbol) {
        return this.ticks[symbol] || null;
    }
}

const market = new Market();
module.exports = market;
