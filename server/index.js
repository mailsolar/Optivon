const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: 'http://localhost:5173',
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

const marketRoutes = require('./routes/market');
app.use('/api/market', marketRoutes);

const algoRoutes = require('./routes/algo');
app.use('/api/algo', algoRoutes);

const market = require('./engine/market');
market.start();

const riskManager = require('./engine/riskManager');
riskManager.start();

app.get('/', (req, res) => {
    res.send({ message: 'Optivon API Running', status: 'Active' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
