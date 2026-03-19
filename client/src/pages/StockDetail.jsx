import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createChart, ColorType } from 'lightweight-charts';
import { ArrowLeft, Globe, Activity, ShieldCheck, Zap } from 'lucide-react';

const StockDetail = () => {
    const { symbol } = useParams();
    const navigate = useNavigate();
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#646466',
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.02)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.02)' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 500,
            rightPriceScale: {
                borderVisible: false,
                scaleMargins: {
                    top: 0.2,
                    bottom: 0.2,
                },
            },
            timeScale: {
                borderVisible: false,
            },
        });

        chartRef.current = chart;

        const candleSeries = chart.addCandlestickSeries({
            upColor: '#C50022',
            downColor: '#A6A6A6',
            borderVisible: false,
            wickUpColor: '#C50022',
            wickDownColor: '#A6A6A6',
        });

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

        const handleResize = (entries) => {
            if (entries.length === 0 || !chart) return;
            const newRect = entries[0].contentRect;
            chart.applyOptions({ width: newRect.width, height: newRect.height });
        };

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(chartContainerRef.current);

        return () => {
            resizeObserver.disconnect();
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
        };
    }, [symbol]);

    return (
        <div className="min-h-screen bg-background text-primary p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-surface rounded-premium p-10 border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col gap-4">
                        <button 
                            onClick={() => navigate(-1)} 
                            className="flex items-center gap-3 text-[10px] font-bold text-muted hover:text-accent uppercase tracking-[0.3em] transition-all group"
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Terminal
                        </button>
                        <div className="flex flex-col gap-1">
                            <h1 className="text-5xl font-bold tracking-tighter uppercase">{symbol}</h1>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-bold text-accent uppercase tracking-widest bg-accent/5 px-3 py-1 rounded-full border border-accent/20">Institutional Asset</span>
                                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Global Sector / Alpha Core</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 text-right mt-6 md:mt-0">
                        <div className="text-6xl font-bold tracking-tighter text-primary">
                            24,532.05
                        </div>
                        <div className="text-sm font-bold text-accent flex items-center justify-end gap-3 mt-2 uppercase tracking-widest">
                            <Activity size={16} /> +1.24% (+342.10)
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* Primary Chart Area */}
                    <div className="lg:col-span-8 bg-surface rounded-premium p-10 border border-white/5 shadow-2xl flex flex-col h-[700px]">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-[10px] font-bold text-muted uppercase tracking-[0.4em]">Chronological Performance</h3>
                            <div className="flex gap-4 p-1 bg-background rounded-instrument border border-white/5">
                                {['1H', '4H', '1D', '1W'].map(tf => (
                                    <button key={tf} className={`px-6 py-2 rounded-instrument text-[10px] font-bold uppercase tracking-widest transition-all ${tf === '1D' ? 'bg-accent text-background shadow-soft' : 'text-muted hover:text-primary'}`}>
                                        {tf}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div ref={chartContainerRef} className="flex-1 w-full" />
                    </div>

                    {/* Secondary Metrics */}
                    <div className="lg:col-span-4 flex flex-col gap-10">
                        
                        {/* Fundamentals */}
                        <div className="bg-surface p-10 rounded-premium border border-white/5 shadow-2xl">
                            <h3 className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] mb-8">Base Metrics</h3>
                            <div className="space-y-6">
                                <MetricLine label="Market Cap" value="1.2T" />
                                <MetricLine label="P/E Ratio" value="32.4" />
                                <MetricLine label="Volume (24h)" value="45.2M" />
                                <MetricLine label="Yield" value="0.05%" />
                            </div>
                        </div>

                        {/* Network Intel */}
                        <div className="bg-surface p-10 rounded-premium border border-white/5 shadow-2xl flex-1">
                            <h3 className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] mb-8">Node Intel</h3>
                            <div className="space-y-6">
                                {[
                                    { tag: "REGULATION", text: "Global compliance mandates for Alpha clusters." },
                                    { tag: "INCEPTION", text: "Optivon Core Phase 3 successfully synchronized." },
                                    { tag: "VOLATILITY", text: "High-frequency spike detected in sector 9." }
                                ].map((news, i) => (
                                    <div key={i} className="group cursor-pointer">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Zap size={10} className="text-accent" />
                                            <span className="text-[9px] font-bold text-muted uppercase tracking-widest">{news.tag}</span>
                                        </div>
                                        <p className="text-sm font-bold text-primary leading-snug group-hover:text-accent transition-colors">
                                            {news.text}
                                        </p>
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

function MetricLine({ label, value }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-white/[0.03]">
            <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{label}</span>
            <span className="text-sm font-bold text-primary tracking-tight">{value}</span>
        </div>
    );
}

export default StockDetail;
