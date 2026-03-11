const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const http = require('http');
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const tradeRoutes = require('./routes/trade');
app.use('/api/trade', tradeRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

const algoRoutes = require('./routes/algo');
app.use('/api/algo', algoRoutes);

const upstoxRoutes = require('./routes/upstox');
app.use('/api/upstox', upstoxRoutes);

// ─── Socket.IO ────────────────────────────────────────────────────────────────
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:5000', /\.ngrok-free\.app$/, /\.trycloudflare\.com$/],
        methods: ['GET', 'POST'],
        credentials: true
    },
    path: '/socket.io',
    // Allow both polling and websocket — let client negotiate
    // This is more reliable than forcing websocket-only on server side
    transports: ['polling', 'websocket'],
    allowUpgrades: true,
    pingTimeout: 60000,
    pingInterval: 25000,
});

// Initialize Upstox Service with IO
const upstoxService = require('./services/upstox');
upstoxService.init(io);
// ──────────────────────────────────────────────────────────────────────────────

const riskManager = require('./engine/riskManager');
riskManager.start();

// Market WebSocket Server (separate path /market — no conflict with Socket.IO)
const MarketWebSocketServer = require('./engine/marketWebSocket');
const marketWS = new MarketWebSocketServer(); // No server passed (noServer mode)

// Manual Upgrade Handling to separate Socket.IO and Market WS
server.on('upgrade', (request, socket, head) => {
    const { pathname } = require('url').parse(request.url);

    if (pathname === '/market') {
        marketWS.handleUpgrade(request, socket, head);
    } else {
        // Let Socket.IO handle it (it attaches its own listener)
        // Do nothing here
    }
});

console.log('✅ Market Data WebSocket Server initialized');

app.get('/api/health', (req, res) => {
    res.send({ message: 'Optivon API Running', status: 'Active' });
});

// Serve Release Build (if exists)
const path = require('path');
const buildPath = path.join(__dirname, '../client/dist');
app.use(express.static(buildPath));

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ Socket.IO listening on port ${PORT}`);
});