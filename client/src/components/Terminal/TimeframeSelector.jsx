import React, { useState, useEffect } from 'react';
import { Clock, Zap, Maximize2, Minimize2, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

const TIMEFRAMES = [
    { id: '1m', label: '1M', value: 1 },
    { id: '5m', label: '5M', value: 5 },
    { id: '15m', label: '15M', value: 15 },
    { id: '1h', label: '1H', value: 60 },
    { id: '4h', label: '4H', value: 240 },
    { id: '1D', label: '1D', value: 1440 },
];

export default function TimeframeSelector({ timeframe, setTimeframe, onZoomIn, onZoomOut, onReset }) {
    return (
        <div className="flex items-center gap-6 px-6 py-3 border-t border-white/[0.03] bg-background shrink-0 font-sans">
            {/* Timeframe Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
                {TIMEFRAMES.map((tf) => (
                    <button
                        key={tf.id}
                        onClick={() => setTimeframe(tf.id)}
                        className={`
                            text-[10px] font-black font-mono px-4 py-2 rounded-instrument transition-all whitespace-nowrap uppercase tracking-widest border
                            ${timeframe === tf.id
                                ? 'text-background bg-accent border-accent shadow-premium'
                                : 'text-muted border-transparent hover:text-primary hover:bg-white/[0.02] hover:border-white/5'
                            }
                        `}
                    >
                        {tf.label}
                    </button>
                ))}
            </div>

            {/* Current Time (UTC) */}
            <div className="ml-auto flex items-center gap-6">
                <CurrentTime />

                {/* Chart Controls */}
                <div className="flex items-center gap-3 hidden sm:flex">
                    <button className="w-9 h-9 flex items-center justify-center rounded-instrument bg-surface/30 border border-white/5 text-[10px] font-black text-muted hover:text-accent hover:border-accent/20 transition-all shadow-sm">
                        %
                    </button>
                    <button className="w-9 h-9 flex items-center justify-center rounded-instrument bg-surface/30 border border-white/5 text-[10px] font-black text-muted hover:text-accent hover:border-accent/20 transition-all shadow-sm font-mono uppercase">
                        log
                    </button>
                    <button 
                        onClick={onReset} 
                        className="px-4 py-2 bg-accent/5 border border-accent/20 text-accent rounded-instrument text-[9px] font-black uppercase tracking-[0.2em] hover:bg-accent/10 transition-all flex items-center gap-2"
                    >
                        <RefreshCw size={10} className="animate-spin-slow" />
                        Auto Reset
                    </button>
                </div>
            </div>
        </div>
    );
}

// Live Clock Component
function CurrentTime() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = () => {
        return time.toLocaleTimeString('en-US', {
            timeZone: 'Asia/Kolkata',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }) + ' IST';
    };

    return (
        <div className="flex items-center gap-3 px-4 py-2 bg-surface/30 rounded-instrument border border-white/5 shadow-inner">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_5px_#C50022]"></div>
            <span className="text-[10px] font-mono font-bold text-secondary tracking-tighter">
                {formatTime()}
            </span>
        </div>
    );
}
