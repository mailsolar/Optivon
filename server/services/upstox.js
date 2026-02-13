const db = require('../database');
const fs = require('fs');
const path = require('path');
const https = require('https');
const querystring = require('querystring');

class UpstoxService {
    constructor() {
        this.io = null;
        this.isAuthenticated = false;
        this.accessToken = null;
        this.pollInterval = null;

        // Load token from file if exists
        this.tokenPath = path.join(__dirname, '../upstox_token.json');
        this.loadToken();
    }

    init(io) {
        this.io = io;
        console.log('[Upstox] Service Initialized');

        if (this.accessToken) {
            console.log('[Upstox] Token loaded. Ready.');
            this.isAuthenticated = true;
        }

        if (this.io) {
            this.io.on('connection', (socket) => {
                socket.on('subscribe', (symbol) => {
                    // Start polling if not running
                    this.startPolling(symbol);
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
                }
            } catch (e) {
                console.error('[Upstox] Failed to load token', e);
            }
        }
    }

    saveToken(tokenData) {
        this.accessToken = tokenData.access_token;
        fs.writeFileSync(this.tokenPath, JSON.stringify(tokenData, null, 2));
        this.isAuthenticated = true;
        console.log('[Upstox] Token saved and authenticated.');
    }

    // 1. Get Login URL
    getLoginUrl() {
        const clientId = process.env.UPSTOX_API_KEY;
        const redirectUri = process.env.UPSTOX_REDIRECT_URI;
        const cleanClientId = clientId ? clientId.trim() : '';
        const cleanRedirectUri = redirectUri ? redirectUri.trim() : '';

        return `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${cleanClientId}&redirect_uri=${cleanRedirectUri}`;
    }

    // 2. Exchange Code for Token (Raw HTTPS)
    async handleCallback(code) {
        try {
            const clientId = process.env.UPSTOX_API_KEY;
            const clientSecret = process.env.UPSTOX_API_SECRET;
            const redirectUri = process.env.UPSTOX_REDIRECT_URI;
            const cleanClientId = clientId ? clientId.trim() : '';
            const cleanClientSecret = clientSecret ? clientSecret.trim() : '';
            const cleanRedirectUri = redirectUri ? redirectUri.trim() : '';

            console.log(`[Upstox] Auth Debug: ClientID Length: ${cleanClientId.length}, Secret Length: ${cleanClientSecret.length}, RedirectURI: ${cleanRedirectUri}`);

            const postData = querystring.stringify({
                'code': code,
                'client_id': cleanClientId,
                'client_secret': cleanClientSecret,
                'redirect_uri': cleanRedirectUri,
                'grant_type': 'authorization_code'
            });

            const options = {
                hostname: 'api.upstox.com',
                port: 443,
                path: '/v2/login/authorization/token',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json',
                    'Content-Length': postData.length
                }
            };

            return new Promise((resolve, reject) => {
                const req = https.request(options, (res) => {
                    let data = '';
                    res.on('data', (chunk) => { data += chunk; });
                    res.on('end', () => {
                        try {
                            const parsedData = JSON.parse(data);
                            if (res.statusCode >= 200 && res.statusCode < 300) {
                                console.log('[Upstox] Token API Success (Raw HTTPS).');
                                this.saveToken(parsedData);
                                resolve(parsedData);
                            } else {
                                console.error('[Upstox] Token API Error (Raw HTTPS):', data);
                                reject(new Error(JSON.stringify(parsedData)));
                            }
                        } catch (e) {
                            reject(e);
                        }
                    });
                });

                req.on('error', (e) => {
                    console.error('[Upstox] Request Error:', e);
                    reject(e);
                });

                req.write(postData);
                req.end();
            });

        } catch (error) {
            console.error("Upstox Callback Error:", error);
            throw error;
        }
    }

    // 3. Fetch Intraday History
    async getIntradayHistory(symbol) {
        if (!this.isAuthenticated) {
            console.warn("[Upstox] Not Authenticated. Returning empty array.");
            return [];
        }

        const instrumentMap = {
            'NIFTY': 'NSE_INDEX|Nifty 50',
            'BANKNIFTY': 'NSE_INDEX|Nifty Bank',
            'SENSEX': 'BSE_INDEX|SENSEX',
            'FINNIFTY': 'NSE_INDEX|Nifty Fin Service'
        };

        let instrumentToken = instrumentMap[symbol] || instrumentMap['NIFTY'];
        const encodedToken = encodeURIComponent(instrumentToken);
        const interval = '1minute';

        const options = {
            hostname: 'api.upstox.com',
            port: 443,
            path: `/v2/historical-candle/intraday/${encodedToken}/${interval}`,
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${this.accessToken}`
            }
        };

        console.log(`[Upstox] Fetching History: ${options.path}`);

        return new Promise((resolve) => {
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    try {
                        const parsedData = JSON.parse(data);
                        if (res.statusCode >= 200 && res.statusCode < 300 && parsedData.status === 'success') {
                            const candles = (parsedData.data.candles || [])
                                .map(c => ({
                                    time: new Date(c[0]).getTime() / 1000,
                                    open: c[1],
                                    high: c[2],
                                    low: c[3],
                                    close: c[4],
                                    volume: c[5]
                                }))
                                .sort((a, b) => a.time - b.time);

                            console.log(`[Upstox] History Success. ${candles.length} candles.`);

                            // Start Real Data Polling
                            this.startPolling(symbol, instrumentToken);

                            resolve(candles);
                        } else {
                            console.error('[Upstox] History API Error (Raw HTTPS):', parsedData);
                            resolve([]);
                        }
                    } catch (e) {
                        console.error('[Upstox] Parse Error:', e);
                        resolve([]);
                    }
                });
            });

            req.on('error', (e) => {
                console.error('[Upstox] Request Error:', e);
                resolve([]);
            });

            req.end();
        });
    }

    // 4. Real-Time Polling (Replace Simulation)
    startPolling(symbol, explicitToken = null) {
        if (!this.io) return;
        if (this.pollInterval) clearInterval(this.pollInterval);

        console.log(`[Upstox] Starting Real-Time Polling for ${symbol}`);

        const instrumentMap = {
            'NIFTY': 'NSE_INDEX|Nifty 50',
            'BANKNIFTY': 'NSE_INDEX|Nifty Bank',
            'SENSEX': 'BSE_INDEX|SENSEX',
            'FINNIFTY': 'NSE_INDEX|Nifty Fin Service'
        };

        let instrumentToken = explicitToken || instrumentMap[symbol] || instrumentMap['NIFTY'];
        const encodedToken = encodeURIComponent(instrumentToken); // Encode pipe as %7C

        // Note: Upstox Market Quote API uses comma separated instrument_keys
        // GET /v2/market-quote/ltp?instrument_key=NSE_INDEX|Nifty 50

        const https = require('https');

        this.pollInterval = setInterval(() => {
            if (!this.isAuthenticated) return;

            const options = {
                hostname: 'api.upstox.com',
                port: 443,
                path: `/v2/market-quote/ltp?instrument_key=${encodedToken}`,
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.accessToken}`
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        // Response format: { status: 'success', data: { 'NSE_INDEX:Nifty 50': { last_price: ..., InstrumentKey: ... } } }
                        // Note: The key in 'data' might have slight variations (colon vs pipe), but usually matches request.

                        if (parsed.status === 'success' && parsed.data) {
                            // Find the data object for this instrument
                            // Iterate keys because Upstox might return 'NSE_INDEX:Nifty 50' even if we asked 'NSE_INDEX|Nifty 50'
                            const keys = Object.keys(parsed.data);
                            if (keys.length > 0) {
                                const quote = parsed.data[keys[0]];
                                const ltp = quote.last_price;

                                const tick = {
                                    symbol: symbol,
                                    ltp: ltp,
                                    time: Math.floor(Date.now() / 1000),
                                    timestamp: new Date().toISOString()
                                };

                                // console.log(`[Upstox] Poll Update: ${symbol} @ ${ltp}`);
                                this.io.emit('stock_update', tick);
                            }
                        }
                    } catch (e) {
                        // console.error('[Upstox] Poll Parse Error', e);
                    }
                });
            });

            req.on('error', (e) => {
                console.error('[Upstox] Poll Request Error:', e.message);
            });

            req.end();

        }, 1000); // Poll every 1 second
    }
}

module.exports = new UpstoxService();
