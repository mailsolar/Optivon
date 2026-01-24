
import React, { useEffect, useState, useRef } from 'react';
import TerminalHeader from './TerminalHeader';
import TerminalSidebar from './TerminalSidebar';
import TerminalChart from './TerminalChart';
import { useToast } from '../../context/ToastContext';

export default function TerminalLayout({ user, quotes, account, onTrade }) {
    const [selectedSymbol, setSelectedSymbol] = useState('NIFTY');
    const [chartData, setChartData] = useState([]);
    const [positions, setPositions] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const seriesRef = useRef(null);
    const { addToast } = useToast();

    // Simulate History on Symbol Change
    useEffect(() => {
        const generateData = () => {
            let data = [];
            let time = new Date('2024-01-01').getTime() / 1000;
            let price = selectedSymbol === 'NIFTY' ? 21500 : (selectedSymbol === 'BANKNIFTY' ? 46000 : 1000);
            const volatility = selectedSymbol === 'NIFTY' ? 50 : 150;

            for (let i = 0; i < 200; i++) {
                let change = (Math.random() - 0.5) * volatility;
                let open = price;
                let close = price + change;
                let high = Math.max(open, close) + Math.random() * (volatility / 2);
                let low = Math.min(open, close) - Math.random() * (volatility / 2);
                data.push({ time: time + i * 300, open, high, low, close });
                price = close;
            }
            return data;
        };
        setChartData(generateData());
    }, [selectedSymbol]);

    // Live Ticks Update
    useEffect(() => {
        if (!quotes) return;
        const tick = quotes[selectedSymbol];
        if (tick && seriesRef.current) {
            const time = Math.floor(new Date(tick.timestamp).getTime() / 1000);
            if (isNaN(time)) return; // Prevent crash on invalid date

            try {
                seriesRef.current.update({
                    time: time,
                    open: tick.ltp,
                    high: tick.ltp,
                    low: tick.ltp,
                    close: tick.ltp
                });
            } catch (err) {
                console.warn("Chart update error:", err);
            }
        }
    }, [quotes, selectedSymbol]);

    // Fetch Positions
    const fetchPositions = async () => {
        if (!account) return;
        try {
            const res = await fetch(`http://localhost:5000/api/trade/positions/${account.id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (res.ok) setPositions(data);
        } catch (e) {
            console.error("Failed to fetch positions", e);
        }
    };

    useEffect(() => {
        fetchPositions();
        const interval = setInterval(fetchPositions, 2000);
        return () => clearInterval(interval);
    }, [account]);

    const handleChartReady = (chart, series) => {
        seriesRef.current = series;
    };

    const handleOrder = async (sym, side, qty, type, strike) => {
        try {
            let tradeSymbol = sym;
            if (strike) {
                tradeSymbol = `${sym} ${strike} ${type === 'call' ? 'CE' : 'PE'}`;
            }

            if (!account) return addToast('No Active Account', 'error');

            const res = await fetch('http://localhost:5000/api/trade/place', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    accountId: account.id,
                    symbol: tradeSymbol,
                    side: side,
                    lots: parseInt(qty || 1),
                    type: 'market'
                })
            });
            const data = await res.json();
            if (!res.ok) addToast(data.error, 'error');
            else {
                addToast(`${side.toUpperCase()} Order Placed for ${tradeSymbol}`, 'success');
                fetchPositions(); // Refresh immediately
                if (onTrade) onTrade();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleClosePosition = async (pos) => {
        // Find opposite side
        const side = pos.side === 'buy' ? 'sell' : 'buy';
        await handleOrder(pos.symbol, side, pos.lots);
    };

    return (
        <div className="flex flex-col h-screen bg-[#000000] text-gray-300 overflow-hidden">
            <TerminalHeader quotes={quotes} onSearch={setSearchTerm} />

            <div className="flex-1 flex overflow-hidden">
                {/* Center Chart Area */}
                <div className="flex-1 relative flex flex-col border-r border-white/5">
                    <TerminalChart
                        symbol={selectedSymbol}
                        data={chartData}
                        onChartReady={handleChartReady}
                    />

                    {/* Floating Buy/Sell Panel */}
                    <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 bg-[#1e1e24] p-3 rounded shadow-xl border border-white/5">
                        <div className="flex justify-between items-center text-xs mb-2">
                            <span className="font-bold text-white">{selectedSymbol}</span>
                            <span className="text-blue-400">{quotes[selectedSymbol]?.ltp?.toFixed(2)}</span>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleOrder(selectedSymbol, 'buy')} className="px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded shadow-lg transition-transform active:scale-95">BUY</button>
                            <button onClick={() => handleOrder(selectedSymbol, 'sell')} className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded shadow-lg transition-transform active:scale-95">SELL</button>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <TerminalSidebar
                    quotes={quotes}
                    positions={positions}
                    selectedSymbol={selectedSymbol}
                    onSelectSymbol={setSelectedSymbol}
                    spotPrice={quotes[selectedSymbol]?.ltp}
                    onOrder={handleOrder}
                    searchTerm={searchTerm}
                    onClosePosition={handleClosePosition}
                />
            </div>
        </div>
    );
}
