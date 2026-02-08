import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Activity, Zap, Server } from 'lucide-react';

const TICKERS = ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'VIX'];

export default function DummyTerminal() {
    const [price, setPrice] = useState(22450.00);
    const [trades, setTrades] = useState([]);
    const [pnl, setPnl] = useState(14500);

    // Simulation Loop
    useEffect(() => {
        const interval = setInterval(() => {
            const movement = (Math.random() - 0.45) * 15; // Slightly bullish bias
            setPrice(p => +(p + movement).toFixed(2));
            setPnl(p => +(p + (movement * 50)).toFixed(2)); // PnL correlated to movement

            const newTrade = {
                id: Math.random(),
                ticker: TICKERS[Math.floor(Math.random() * TICKERS.length)],
                sub: Math.floor(Math.random() * 5) === 0 ? 'SELL' : 'BUY', // Mostly buys
                price: (22000 + Math.random() * 1000).toFixed(2),
                size: Math.floor(Math.random() * 50) * 50,
                time: new Date().toLocaleTimeString('en-US', { hour12: false })
            };

            setTrades(prev => [newTrade, ...prev].slice(0, 8)); // Keep last 8 trades
        }, 800);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full bg-[#0a0a0f] text-xs font-mono p-4 flex flex-col gap-4 overflow-hidden select-none">

            {/* Header / Stats */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-brand-lime">
                        <Activity size={14} className="animate-pulse" />
                        <span className="font-bold tracking-widest">LIVE SIMULATION</span>
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="text-gray-400">LATENCY: <span className="text-white">12ms</span></div>
                </div>
                <div className="text-right">
                    <div className="text-gray-500 text-[10px] uppercase">Net P&L</div>
                    <div className={`text-xl font-bold ${pnl >= 0 ? 'text-brand-lime' : 'text-red-500'}`}>
                        {pnl >= 0 ? '+' : ''}₹{pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                </div>
            </div>

            {/* Main Content: Chart & Tape */}
            <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">

                {/* Simulated Chart Area */}
                <div className="col-span-2 bg-[#12121a] rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-center">
                    {/* Grid Lines */}
                    <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-10 pointer-events-none">
                        {[...Array(20)].map((_, i) => <div key={i} className="border-r border-b border-white" />)}
                    </div>

                    {/* Abstract Price Line */}
                    <svg className="w-full h-full p-8 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <motion.path
                            d="M0,50 Q10,60 20,40 T40,50 T60,30 T80,70 T100,50"
                            stroke="rgba(204, 255, 0, 0.5)"
                            strokeWidth="2"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1, d: ["M0,50 Q10,60 20,40 T40,50 T60,30 T80,70 T100,50", "M0,60 Q10,40 20,70 T40,30 T60,80 T80,40 T100,60"] }}
                            transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                        />
                        <motion.path
                            d="M0,50 Q10,60 20,40 T40,50 T60,30 T80,70 T100,50"
                            stroke="rgba(204, 255, 0, 0.1)"
                            strokeWidth="20"
                            fill="none"
                            className="blur-md"
                        />
                    </svg>

                    <div className="absolute top-4 left-4">
                        <div className="text-2xl font-bold text-white">{price.toFixed(2)}</div>
                        <div className="text-xs text-brand-lime flex items-center gap-1">
                            <ArrowUpRight size={10} /> +0.45%
                        </div>
                    </div>
                </div>

                {/* Simulated Order Tape */}
                <div className="col-span-1 flex flex-col gap-1 overflow-hidden">
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Order Flow</div>
                    <div className="space-y-1">
                        {trades.map((trade) => (
                            <motion.div
                                key={trade.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex justify-between items-center text-[10px] p-2 rounded bg-white/5 border border-white/5"
                            >
                                <div className="flex items-center gap-2">
                                    <span className={trade.sub === 'BUY' ? 'text-brand-lime' : 'text-red-500'}>{trade.sub}</span>
                                    <span className="text-gray-300">{trade.ticker}</span>
                                </div>
                                <div className="text-gray-400">{trade.size}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Footer / Status */}
            <div className="flex justify-between items-center pt-2 text-[10px] text-gray-600 font-mono">
                <div className="flex items-center gap-2">
                    <Server size={10} />
                    <span>CONNECTED: MUMBAI_DC_04</span>
                </div>
                <div>
                    EXECUTION: <span className="text-brand-lime">OPTIMIZED</span>
                </div>
            </div>

        </div>
    );
}
