const WebSocket = require('ws');
const replayEngine = require('./replayEngine');

/**
 * WebSocket Server for Optivon Market Data Streaming
 * 
 * Handles real-time market data delivery to frontend charts
 */

class MarketWebSocketServer {
    constructor(server) {
        this.wss = new WebSocket.Server({ server, path: '/market' });
        this.clients = new Map(); // ws -> { sessionId, symbol, accountId }

        this.setupServer();
        console.log('📡 Market WebSocket Server initialized on /market');
    }

    setupServer() {
        this.wss.on('connection', (ws, req) => {
            console.log('🔌 New WebSocket connection');

            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    this.handleMessage(ws, data);
                } catch (error) {
                    console.error('Invalid message format:', error);
                    ws.send(JSON.stringify({ error: 'Invalid message format' }));
                }
            });

            ws.on('close', () => {
                this.handleDisconnect(ws);
            });

            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
            });

            // Send welcome message
            ws.send(JSON.stringify({
                type: 'connected',
                message: 'Connected to Optivon Market Data Server'
            }));
        });
    }

    handleMessage(ws, data) {
        const { type, payload } = data;

        switch (type) {
            case 'subscribe':
                this.handleSubscribe(ws, payload);
                break;

            case 'pause':
                this.handlePause(ws);
                break;

            case 'resume':
                this.handleResume(ws);
                break;

            case 'speed':
                this.handleSpeed(ws, payload);
                break;

            case 'unsubscribe':
                this.handleUnsubscribe(ws);
                break;

            default:
                ws.send(JSON.stringify({ error: 'Unknown message type' }));
        }
    }

    async handleSubscribe(ws, payload) {
        const { symbol, accountId, speed = 1, specificDate = null } = payload;

        if (!symbol || !accountId) {
            ws.send(JSON.stringify({ error: 'Missing symbol or accountId' }));
            return;
        }

        // Generate STABLE session ID (Per Account + Symbol)
        const sessionId = `${accountId}_${symbol}`;

        try {
            // Check if session already exists
            const existingSession = replayEngine.getSessionStatus(sessionId);
            let sessionDetails;

            if (existingSession) {
                console.log(`🔄 Resuming existing session: ${sessionId}`);

                // 1. Attach this client's callback to the existing session
                replayEngine.updateCallback(sessionId, (candleData) => this.broadcastCandle(ws, candleData));

                // 2. Send subscription confirmation
                ws.send(JSON.stringify({
                    type: 'subscribed',
                    sessionId,
                    symbol,
                    totalCandles: existingSession.totalCandles,
                    speed: existingSession.speed,
                    isResumed: true
                }));

                // 3. FAST FORWARD: Send all historical candles from this session
                const history = replayEngine.getHistory(sessionId);
                console.log(`⏩ Sending ${history.length} historical candles to ${sessionId}`);

                // Send history as a single packet for performance
                ws.send(JSON.stringify({
                    type: 'history',
                    sessionId,
                    data: history
                }));

            } else {
                console.log(`✨ Starting NEW session: ${sessionId}`);

                // Start NEW replay session
                const sessionInfo = await replayEngine.startSession(
                    sessionId,
                    symbol,
                    (candleData) => this.broadcastCandle(ws, candleData),
                    { speed, specificDate }
                );

                // Confirm subscription
                ws.send(JSON.stringify({
                    type: 'subscribed',
                    sessionId,
                    symbol,
                    totalCandles: sessionInfo.totalCandles,
                    speed: sessionInfo.speed
                }));
            }

            // Store client info
            this.clients.set(ws, { sessionId, symbol, accountId });

        } catch (error) {
            console.error('Subscription error:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: error.message
            }));
        }
    }

    handlePause(ws) {
        const client = this.clients.get(ws);
        if (client) {
            replayEngine.pauseSession(client.sessionId);
            ws.send(JSON.stringify({ type: 'paused' }));
        }
    }

    handleResume(ws) {
        const client = this.clients.get(ws);
        if (client) {
            replayEngine.resumeSession(client.sessionId);
            ws.send(JSON.stringify({ type: 'resumed' }));
        }
    }

    handleSpeed(ws, payload) {
        const { speed } = payload;
        const client = this.clients.get(ws);

        if (client && speed) {
            replayEngine.setSpeed(client.sessionId, speed);
            ws.send(JSON.stringify({ type: 'speed_changed', speed }));
        }
    }

    handleUnsubscribe(ws) {
        const client = this.clients.get(ws);
        if (client) {
            // DO NOT STOP SESSION - Let it run for persistence
            // Just detach the callback by setting it to null (handled by updateCallback check)
            replayEngine.updateCallback(client.sessionId, null);

            this.clients.delete(ws);
            ws.send(JSON.stringify({ type: 'unsubscribed' }));
            console.log(`🔌 Client unsubscribed (session: ${client.sessionId} preserved)`);
        }
    }

    handleDisconnect(ws) {
        const client = this.clients.get(ws);
        if (client) {
            // DO NOT STOP SESSION - Preserve for reconnection
            replayEngine.updateCallback(client.sessionId, null);

            this.clients.delete(ws);
            console.log(`❌ Client disconnected (session: ${client.sessionId} preserved)`);
        }
    }

    broadcastCandle(ws, candleData) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(candleData));
        }
    }

    // Cleanup on server shutdown
    cleanup() {
        console.log('🧹 Cleaning up WebSocket server...');
        for (const ws of this.clients.keys()) {
            this.handleUnsubscribe(ws);
            ws.close();
        }
        replayEngine.cleanup();
    }
}

module.exports = MarketWebSocketServer;
