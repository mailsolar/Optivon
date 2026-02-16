const { v4: uuidv4 } = require('uuid');
const orderManager = require('./orderManager');
const db = require('../database');

class AlgoEngine {
    constructor() {
        this.bots = new Map(); // id -> bot
        this.history = { 'NIFTY': [], 'BANKNIFTY': [] };
        this.maxHistory = 50; // Keep roughly 50 ticks for calculation
        this.init();
    }

    init() {
        console.log("Algo Engine Initialized");
        // Market tick integration disabled - algos currently run on historical replay data
        // TODO: Wire up to Optivon Market Data WebSocket for real-time algo execution
    }

    async onTick(tick) {
        if (!tick || !tick.symbol) return;

        // Update History
        if (!this.history[tick.symbol]) this.history[tick.symbol] = [];
        this.history[tick.symbol].push(tick.ltp);
        if (this.history[tick.symbol].length > this.maxHistory) {
            this.history[tick.symbol].shift();
        }

        // Process Bots
        const activeBots = Array.from(this.bots.values()).filter(b => b.status === 'active' && b.symbol === tick.symbol);

        for (const bot of activeBots) {
            await this.processBot(bot, tick);
        }
    }

    async processBot(bot, tick) {
        // Ensure enough data
        const history = this.history[bot.symbol];
        if (history.length < 20) return;

        try {
            // Check if we have an open trade for this bot (Mocked by bot.currentTradeId)
            // Verify if that trade is still open in DB
            let currentTrade = null;
            if (bot.currentTradeId) {
                currentTrade = await this.getTrade(bot.currentTradeId);
                if (!currentTrade || currentTrade.status !== 'open') {
                    bot.currentTradeId = null; // Trade closed externally (e.g. SL/TP)
                    bot.position = null;
                }
            }

            // Strategy Logic
            if (bot.strategy === 'STRAT_RSI_MOMENTUM') {
                await this.runRSIStrategy(bot, history, tick.ltp, currentTrade);
            } else if (bot.strategy === 'STRAT_EMA_CROSS') {
                await this.runEMAStrategy(bot, history, tick.ltp, currentTrade);
            }
            // GRID STRATEGY REMOVED (Prohibited Rule)

        } catch (err) {
            console.error(`Bot ${bot.id} Error:`, err);
        }
    }

    // --- STRATEGIES ---

    async runRSIStrategy(bot, history, currentPrice, currentTrade) {
        const period = 14;
        const rsi = this.calculateRSI(history, period);
        if (!rsi) return;

        // Buy Signal: RSI < 30
        if (!bot.currentTradeId && rsi < 30) {
            await this.executeBotTrade(bot, 'buy', 1);
        }
        // Sell Signal: RSI > 70
        else if (!bot.currentTradeId && rsi > 70) {
            await this.executeBotTrade(bot, 'sell', 1);
        }
        // Exit Logic:
        else if (currentTrade) {
            if (currentTrade.side === 'buy' && rsi > 60) {
                await this.closeBotTrade(bot, currentTrade, currentPrice, 'RSI_EXIT');
            } else if (currentTrade.side === 'sell' && rsi < 40) {
                await this.closeBotTrade(bot, currentTrade, currentPrice, 'RSI_EXIT');
            }
        }
    }

    async runEMAStrategy(bot, history, currentPrice, currentTrade) {
        // Fast: 9, Slow: 21
        // Need at least 21 ticks
        if (history.length < 22) return;

        const fastEMA = this.calculateEMA(history, 9);
        const slowEMA = this.calculateEMA(history, 21);
        const prevFastEMA = this.calculateEMA(history.slice(0, -1), 9);
        const prevSlowEMA = this.calculateEMA(history.slice(0, -1), 21);

        // Crossover
        const bullCross = prevFastEMA <= prevSlowEMA && fastEMA > slowEMA;
        const bearCross = prevFastEMA >= prevSlowEMA && fastEMA < slowEMA;

        if (!bot.currentTradeId) {
            if (bullCross) await this.executeBotTrade(bot, 'buy', 1);
            if (bearCross) await this.executeBotTrade(bot, 'sell', 1);
        } else if (currentTrade) {
            // Exit on reverse crossover
            if (currentTrade.side === 'buy' && bearCross) {
                await this.closeBotTrade(bot, currentTrade, currentPrice, 'EMA_CROSS_EXIT');
            } else if (currentTrade.side === 'sell' && bullCross) {
                await this.closeBotTrade(bot, currentTrade, currentPrice, 'EMA_CROSS_EXIT');
            }
        }
        // Keep state for cross detection? 
        // We use prev tick calculation here (simple slicing)
    }



    // --- EXEUCTION ---

    async executeBotTrade(bot, side, lots) {
        try {
            // Default params based on risk level
            // Aggressive: 1 lot, Conservative: 0.5 (Assume lots passed are correct)
            // Add tight SL/TP by default
            // const quote = market.getQuote(bot.symbol);
            // if (!quote) return;
            // const price = side === 'buy' ? quote.ask : quote.bid;

            // Temporary: Fetch price or skip
            // Since we disabled the tick loop, this executeBotTrade won't be called automatically.
            // But if called manually:
            let price = 0;
            try {
                price = await orderManager.fetchPrice(bot.symbol);
            } catch (e) { }

            if (!price) return;

            // Auto SL/TP
            const slDist = price * 0.005; // 0.5% SL
            const tpDist = price * 0.01;  // 1% TP

            const sl = side === 'buy' ? price - activeSl(bot.risk) : price + activeSl(bot.risk);
            const tp = side === 'buy' ? price + activeTp(bot.risk) : price - activeTp(bot.risk);

            function activeSl(risk) { return price * (risk === 'high' ? 0.01 : 0.003); }
            function activeTp(risk) { return price * (risk === 'high' ? 0.03 : 0.006); }

            // Fetch Real Account for Size Validation
            const account = await orderManager.getAccount(bot.accountId);
            if (!account) {
                console.error(`Bot ${bot.id}: Account ${bot.accountId} not found`);
                return;
            }

            const res = await orderManager.placeOrder(bot.userId, {
                accountId: bot.accountId,
                symbol: bot.symbol,
                side: side,
                lots: lots || 1,
                type: 'market',
                accountSize: account.size,
                sl: sl,
                tp: tp
            });

            if (res.status === 'filled') {
                bot.currentTradeId = res.orderId; // Store Open Trade ID
                bot.position = side;
                bot.tradesCount = (bot.tradesCount || 0) + 1;
                console.log(`Bot ${bot.id} Executed ${side} on ${bot.symbol} @ ${res.fillPrice}`);
            }
        } catch (e) {
            console.error(`Bot Exec Error: ${e.message}`);
        }
    }

    async closeBotTrade(bot, trade, price, reason) {
        try {
            // Use OrderManager to close
            // Since there is no public executeClose, we access the methods or DB directly?
            // Ideally we replicate the close logic or use a helper. 
            // In node, we can access the prototype or just import the instance. 
            // orderManager instance has executeClose method.

            await new Promise((resolve) => {
                orderManager.executeClose(trade, price, reason);
                // We assume it's sync or fast enough. executeClose is sync-ish (db callback)
                // But we can't await it easily unless we promisify it in OrderManager.
                // For now, fire and forget.
                resolve();
            });

            bot.currentTradeId = null;
            bot.position = null;
            console.log(`Bot ${bot.id} Closed Trade ${trade.id} (${reason})`);
        } catch (e) {
            console.error(`Bot Close Error: ${e.message}`);
        }
    }

    // --- UTILS ---

    calculateRSI(prices, period) {
        if (prices.length < period + 1) return 50;
        let gains = 0, losses = 0;
        for (let i = 1; i < prices.length; i++) {
            const diff = prices[i] - prices[i - 1];
            if (diff >= 0) gains += diff;
            else losses -= diff;
        }
        // Simple Average RSI (not Wilder's smoothed for simplicity in tick data)
        const avgGain = gains / period;
        const avgLoss = losses / period;

        if (avgLoss === 0) return 100;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }

    calculateEMA(prices, period) {
        if (prices.length === 0) return 0;
        const k = 2 / (period + 1);
        let ema = prices[0];
        for (let i = 1; i < prices.length; i++) {
            ema = prices[i] * k + ema * (1 - k);
        }
        return ema;
    }

    getTrade(id) {
        return new Promise((resolve) => {
            db.get("SELECT * FROM trades WHERE id = ?", [id], (err, row) => resolve(row));
        });
    }

    // --- API HANDLERS ---

    startBotAPI(userId, { accountId, symbol, strategy, risk }) {
        const bot = this.startBot(userId, { accountId, symbol, strategy, risk });
        return bot;
    }

    stopBotAPI(userId, botId) {
        // Verify user owns bot? Simple check
        const bot = this.bots.get(botId);
        if (bot && bot.userId === userId) {
            this.stopBot(botId);
            return true;
        }
        return false;
    }

    // --- BOT MANAGEMENT ---

    startBot(userId, { accountId, symbol, strategy, risk }) {
        const id = uuidv4();
        const bot = {
            id,
            userId,
            accountId,
            symbol,
            strategy,
            risk,
            status: 'active',
            createdAt: new Date(),
            tradesCount: 0,
            currentTradeId: null,
            position: null
        };
        this.bots.set(id, bot);
        console.log(`Bot Started: ${id} for ${symbol} (${strategy})`);
        return bot;
    }

    stopBot(botId) {
        const bot = this.bots.get(botId);
        if (bot) {
            bot.status = 'stopped';
            console.log(`Bot Stopped: ${botId}`);
            return true;
        }
        return false;
    }

    getBots(userId) {
        return Array.from(this.bots.values()).filter(b => b.userId === userId);
    }

    getUserBots(userId) {
        return this.getBots(userId);
    }
}

module.exports = new AlgoEngine();
