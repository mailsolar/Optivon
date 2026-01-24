
import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createChart } from 'lightweight-charts';

const StockDetail = () => {
    const { symbol } = useParams();
    const navigate = useNavigate();
    const chartContainerRef = useRef(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: 'solid', color: 'transparent' },
                textColor: '#00f3ff', // Cyber Cyan
            },
            grid: {
                vertLines: { color: 'rgba(0, 243, 255, 0.1)' },
                horzLines: { color: 'rgba(0, 243, 255, 0.1)' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 500,
        });

        const candleSeries = chart.addCandlestickSeries({
            upColor: '#00f3ff',
            downColor: '#ff00dc', // Cyber Pink
            borderVisible: false,
            wickUpColor: '#00f3ff',
            wickDownColor: '#ff00dc',
        });

        // Simulated Data Generator
        const generateData = () => {
            let data = [];
            let time = new Date('2024-01-01').getTime() / 1000;
            let price = 21500;
            for (let i = 0; i < 200; i++) {
                let change = (Math.random() - 0.5) * 100;
                let open = price;
                let close = price + change;
                let high = Math.max(open, close) + Math.random() * 50;
                let low = Math.min(open, close) - Math.random() * 50;
                data.push({ time: time + i * 86400, open, high, low, close });
                price = close;
            }
            return data;
        };

        candleSeries.setData(generateData());

        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [symbol]);

    return (
        <div className="min-h-screen bg-cyber-black text-cyber-cyan p-6 relative overflow-hidden font-mono">
            {/* Background Grid */}
            <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

            <div className="relative z-10 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center bg-black/40 backdrop-blur-md rounded-xl p-6 border border-cyber-cyan/30 shadow-[0_0_15px_rgba(0,243,255,0.2)]">
                    <div>
                        <button onClick={() => navigate(-1)} className="text-sm text-gray-400 hover:text-white mb-2">← Back to Terminal</button>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyber-cyan to-cyber-purple animate-pulse">
                            {symbol}
                        </h1>
                        <span className="text-sm text-gray-300">Technology / AI / Robotics</span>
                    </div>
                    <div className="text-right">
                        <div className="text-5xl font-bold text-cyber-cyan text-shadow-neon">
                            24,532.05
                        </div>
                        <div className="text-lg text-cyber-green flex items-center justify-end gap-2">
                            <span>▲</span> +1.24% (+342.10)
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                    {/* Main Chart */}
                    <div className="lg:col-span-3 bg-black/40 backdrop-blur-md rounded-xl p-4 border border-cyber-purple/30 shadow-[0_0_15px_rgba(189,0,255,0.15)] h-[600px] flex flex-col">
                        <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
                            <h2 className="text-xl font-semibold text-cyber-purple">Market Analysis</h2>
                            <div className="flex gap-2">
                                {['1H', '4H', '1D', '1W'].map(tf => (
                                    <button key={tf} className="px-3 py-1 bg-cyber-purple/10 border border-cyber-purple/50 rounded hover:bg-cyber-purple/30 transition shadow-[0_0_5px_rgba(189,0,255,0.3)]">
                                        {tf}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div ref={chartContainerRef} className="flex-1 w-full h-full" />
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        {/* Fundamentals */}
                        <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-cyber-pink/30 shadow-[0_0_15px_rgba(255,0,220,0.15)]">
                            <h3 className="text-lg font-semibold text-cyber-pink mb-4 border-b border-cyber-pink/30 pb-2">Fundamentals</h3>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Market Cap</span>
                                    <span className="text-white">1.2T Credits</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">P/E Ratio</span>
                                    <span className="text-white">32.4</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Vol (24h)</span>
                                    <span className="text-white">45.2M</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Yield</span>
                                    <span className="text-white">0.05%</span>
                                </div>
                            </div>
                        </div>

                        {/* Cyber News */}
                        <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-cyber-cyan/30 shadow-[0_0_15px_rgba(0,243,255,0.15)] flex-1">
                            <h3 className="text-lg font-semibold text-cyber-cyan mb-4 border-b border-cyber-cyan/30 pb-2">Cyber Network News</h3>
                            <div className="space-y-4">
                                {[
                                    "AI Regulation Talks Stall in Neo-Tokyo",
                                    "Optivon Corp Announces Q3 Quantum Leap",
                                    "Energy Credits Surge after Solar Event"
                                ].map((news, i) => (
                                    <div key={i} className="p-3 bg-white/5 rounded border-l-2 border-cyber-cyan hover:bg-white/10 transition cursor-pointer">
                                        <p className="text-xs text-gray-500 mb-1">LIVE FEED • NOW</p>
                                        <p className="text-sm font-medium text-gray-200">{news}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockDetail;
