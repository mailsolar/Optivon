const db = require('../database');
const fs = require('fs');
const path = require('path');
const https = require('https');
const querystring = require('querystring');
const WebSocket = require('ws');

// Single instance engine access
let orderManager;
try {
    orderManager = require('../engine/orderManager');
} catch (e) {
    console.warn('[Upstox] OrderManager not found yet, skipping linkage');
}

class UpstoxService {
    constructor() {
        this.io = null;
        this.isAuthenticated = false;
        this.accessToken = null;
        this.tokenLoadedAt = null;
        this.lastError = null;

        // Polling logic
        this.pollInterval = null;
        this.activeSymbols = new Set(['NIFTY', 'BANKNIFTY']); // Standard indices
        this.latestQuotes = new Map(); // Global cache
        this.isBackingOff = false;

        this.tokenPath = path.join(__dirname, '../upstox_token.json');
        this.loadToken();

        // Auto-start global poller if token exists
        if (this.accessToken) {
            this.startGlobalPoller();
        }
    }

    init(io) {
        this.io = io;
        console.log('[Upstox] Service Initialized with Socket.IO');

        if (this.io) {
            this.io.on('connection', (socket) => {
                console.log(`[Upstox] Client Joined: ${socket.id}`);

                socket.on('subscribe', (symbol) => {
                    if (symbol) {
                        const norm = symbol.toUpperCase().replace(/\s+/g, '');
                        this.activeSymbols.add(norm);
                    }
                });
            });
        }
    }

    loadToken() {
        if (fs.existsSync(this.tokenPath)) {
            try {
                const data = JSON.parse(fs.readFileSync(this.tokenPath, 'utf8'));
                if (data.access_token) {
                    this.accessToken = data.access_token;
                    this.isAuthenticated = true;
                    this.tokenLoadedAt = Date.now();
                }
            } catch (e) { console.error('[Upstox] Token Read Error', e); }
        }
    }

    saveToken(tokenData) {
        this.accessToken = tokenData.access_token;
        this.tokenLoadedAt = Date.now();
        fs.writeFileSync(this.tokenPath, JSON.stringify(tokenData, null, 2));
        this.isAuthenticated = true;
        this.startGlobalPoller(); // Ensure poller restarts with new token
    }

    getLoginUrl() {
        const clientId = process.env.UPSTOX_API_KEY;
        const redirectUri = process.env.UPSTOX_REDIRECT_URI;
        return `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
    }

    async handleCallback(code) {
        const postData = querystring.stringify({
            'code': code, 'client_id': process.env.UPSTOX_API_KEY,
            'client_secret': process.env.UPSTOX_API_SECRET,
            'redirect_uri': process.env.UPSTOX_REDIRECT_URI,
            'grant_type': 'authorization_code'
        });

        const options = {
            hostname: 'api.upstox.com', port: 443, path: '/v2/login/authorization/token',
            method: 'POST', headers: {
                'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json',
                'Content-Length': postData.length
            }
        };

        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let d = ''; res.on('data', chunk => d += chunk);
                res.on('end', () => {
                    const p = JSON.parse(d);
                    if (res.statusCode === 200) { this.saveToken(p); resolve(p); }
                    else { reject(new Error(p.errors?.[0]?.message || 'Auth Fail')); }
                });
            });
            req.on('error', reject); req.write(postData); req.end();
        });
    }

    // ─── THE GLOBAL POLLER (SINGLE INSTANCE) ─────────────────────────────────────────
    startGlobalPoller() {
        if (this.pollInterval) clearInterval(this.pollInterval);

        console.log('[Upstox] Starting SINGLE Global Polling Loop (1.0s Multi-Quote)');
        // 1.0s is safe with Multi-Quote while providing best responsiveness
        this.pollInterval = setInterval(async () => {
            if (!this.accessToken || this.activeSymbols.size === 0 || this.isBackingOff) return;

            try {
                // FETCH ALL AT ONCE (Prevents 429 and reduces latency)
                const tokens = Array.from(this.activeSymbols).map(s => this.getInstrumentToken(s));
                const urlPath = `/v2/market-quote/quotes?instrument_key=${encodeURIComponent(tokens.join(','))}`;

                const options = {
                    hostname: 'api.upstox.com', port: 443, path: urlPath,
                    method: 'GET', headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${this.accessToken}` }
                };

                const req = https.request(options, (res) => {
                    let data = ''; res.on('data', d => data += d);
                    res.on('end', () => {
                        try {
                            if (res.statusCode === 429) {
                                console.warn('[Upstox] 429 Rate Limit hit. Backing off for 15s...');
                                this.isBackingOff = true;
                                setTimeout(() => { this.isBackingOff = false; }, 15000);
                                return;
                            }

                            const parsed = JSON.parse(data);
                            if (parsed.status === 'success' && parsed.data) {
                                Object.keys(parsed.data).forEach(key => {
                                    const quote = parsed.data[key];
                                    if (quote && quote.last_price) {
                                        const symbol = this.getSymbolFromToken(key);
                                        const ltp = quote.last_price;
                                        const tick = {
                                            symbol: symbol, ltp: ltp,
                                            time: Math.floor(Date.now() / 1000),
                                            timestamp: new Date().toISOString()
                                        };
                                        if (this.io) this.io.emit('stock_update', tick);
                                        this.latestQuotes.set(symbol, ltp);
                                        if (orderManager && orderManager.processLiveTick) {
                                            orderManager.processLiveTick(symbol, ltp);
                                        }
                                    }
                                });
                            }
                        } catch (e) { }
                    });
                });
                req.on('error', () => { }); req.end();
            } catch (err) { }
        }, 1000);
    }

    getInstrumentToken(symbol) {
        const m = {
            'NIFTY': 'NSE_INDEX|Nifty 50', 'BANKNIFTY': 'NSE_INDEX|Nifty Bank',
            'SENSEX': 'BSE_INDEX|SENSEX', 'FINNIFTY': 'NSE_INDEX|Nifty Fin Service'
        };
        return m[symbol] || m['NIFTY'];
    }

    getSymbolFromToken(token) {
        if (token.includes('Nifty 50')) return 'NIFTY';
        if (token.includes('Nifty Bank')) return 'BANKNIFTY';
        if (token.includes('SENSEX')) return 'SENSEX';
        if (token.includes('Nifty Fin Service')) return 'FINNIFTY';
        return token;
    }

    async getIntradayHistory(symbol, intervalCode = '1m') {
        if (!this.isAuthenticated) return [];
        const norm = symbol.toUpperCase().replace(/\s+/g, '');
        const instToken = this.getInstrumentToken(norm);
        const intervalMap = { '1m': '1minute', '3m': '3minute', '5m': '5minute', '15m': '15minute', '1h': '60minute', '1D': 'day' };
        const apiPath = `/v2/historical-candle/intraday/${encodeURIComponent(instToken)}/${intervalMap[intervalCode] || '1minute'}`;

        return new Promise((resolve) => {
            const options = {
                hostname: 'api.upstox.com', port: 443, path: apiPath,
                method: 'GET', headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${this.accessToken}` }
            };
            const req = https.request(options, (res) => {
                let d = ''; res.on('data', chunk => d += chunk);
                res.on('end', () => {
                    try {
                        const p = JSON.parse(d);
                        if (p.status === 'success') {
                            const candles = (p.data.candles || []).map(c => ({
                                time: new Date(c[0]).getTime() / 1000,
                                open: c[1], high: c[2], low: c[3], close: c[4], volume: c[5]
                            })).sort((a, b) => a.time - b.time);
                            this.activeSymbols.add(norm);
                            resolve(candles);
                        } else resolve([]);
                    } catch (e) { resolve([]); }
                });
            });
            req.on('error', () => resolve([])); req.end();
        });
    }

    startPolling(symbol) {
        if (symbol) this.activeSymbols.add(symbol.toUpperCase());
        this.startGlobalPoller();
    }
}

module.exports = new UpstoxService();