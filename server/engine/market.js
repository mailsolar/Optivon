const EventEmitter = require('events');

class Market extends EventEmitter {
    constructor() {
        super();
        this.instruments = {
            'NIFTY': { price: 21500, volatility: 35, spreadMin: 2, spreadMax: 6 }, // High Volatility spread
            'BANKNIFTY': { price: 46000, volatility: 80, spreadMin: 5, spreadMax: 15 } // Very High Volatility
        };
        this.ticks = {};
        this.interval = null;
        this.isRunning = false;
        this.microDirection = 1; // Persistent micro-trend direction
        this.microDuration = 0;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log('High-Frequency (Evil Mode) Market Simulation Started');
        this.scheduleNextTick();
    }

    scheduleNextTick() {
        if (!this.isRunning) return;

        // Dynamic Speed: 100ms to 800ms (Very fast)
        // High panic mode = faster ticks
        const delay = Math.floor(Math.random() * 700) + 100;

        this.interval = setTimeout(() => {
            this.activeLoop();
            this.scheduleNextTick();
        }, delay);
    }

    stop() {
        if (this.interval) clearTimeout(this.interval);
        this.isRunning = false;
    }

    activeLoop() {
        try {
            const now = new Date();

            for (const [symbol, data] of Object.entries(this.instruments)) {
                // EVIL Market Micro-structure Simulation

                // 1. Trend Persistence (prevent pure random noise)
                if (this.microDuration <= 0) {
                    this.microDuration = Math.floor(Math.random() * 10) + 5; // Sustain move for 5-15 ticks
                    this.microDirection = Math.random() > 0.5 ? 1 : -1;
                    // 10% Chance of Violent Reversal (Stop Hunt)
                    if (Math.random() > 0.9) {
                        this.microDirection *= -5; // Violent spike
                    }
                } else {
                    this.microDuration--;
                }

                // 2. Volatility Regime
                let currentVol = data.volatility;
                if (Math.random() > 0.8) currentVol *= 3; // 20% chance of massive volatility spike

                const change = (Math.random() * currentVol * 0.4 * this.microDirection) + ((Math.random() - 0.5) * currentVol * 0.2);

                data.price += change;

                // 3. Whipsaw Correction (Mean Reversion to prevent infinite climb)
                if (Math.abs(change) > data.volatility) {
                    // If moved too fast, next tick likely reverts 50%
                    this.microDirection *= -0.5;
                }

                data.price = parseFloat(data.price.toFixed(2));

                // 4. Dynamic Evil Spread (Widens during volatility)
                const spreadMultiplier = Math.abs(change) > 10 ? 3 : 1;
                const spread = (data.spreadMin + Math.random() * (data.spreadMax - data.spreadMin)) * spreadMultiplier;

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
        } catch (e) {
            console.error("Market Loop Error:", e);
        }
    }

    getQuote(symbol) {
        return this.ticks[symbol] || null;
    }
}

const market = new Market();
module.exports = market;
