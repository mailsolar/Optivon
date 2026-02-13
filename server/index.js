const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for development
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: true, // Allow any origin (reflects request origin) for ngrok/dev support
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Make io accessible to routes
app.set('socketio', io);

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const tradeRoutes = require('./routes/trade');
app.use('/api/trade', tradeRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Market Routes removed to prevent simulation conflict
// const marketRoutes = require('./routes/market');
// app.use('/api/market', marketRoutes);

const algoRoutes = require('./routes/algo');
app.use('/api/algo', algoRoutes);

const upstoxRoutes = require('./routes/upstox');
app.use('/api/upstox', upstoxRoutes);

// Initialize Upstox Service with IO
const upstoxService = require('./services/upstox');
upstoxService.init(io);

// const market = require('./engine/market');
// market.start(); // Disable default simulation to avoid conflict with Upstox

const riskManager = require('./engine/riskManager');
riskManager.start();

app.get('/api/health', (req, res) => {
    res.send({ message: 'Optivon API Running', status: 'Active' });
});

// Serve Release Build (if exists)
const path = require('path');
const buildPath = path.join(__dirname, '../client/dist');
app.use(express.static(buildPath));

// For any other request, send back React's index.html
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

// Handle socket connections
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});
