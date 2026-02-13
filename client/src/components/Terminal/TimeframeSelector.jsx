import React, { useState, useEffect } from 'react';

const TIMEFRAMES = [
    { id: '1m', label: '1m', value: 1 },
    { id: '5m', label: '5m', value: 5 },
    { id: '15m', label: '15m', value: 15 },
    { id: '1h', label: '1h', value: 60 },
    { id: '4h', label: '4h', value: 240 },
    { id: '1D', label: '1D', value: 1440 },
    { id: '1W', label: '1W', value: 10080 },
    { id: '1M', label: '1M', value: 43200 },
    { id: '3M', label: '3M', value: 129600 },
    { id: '1Y', label: '1Y', value: 525600 },
    { id: 'MAX', label: 'MAX', value: -1 },
];

export default function TimeframeSelector({ timeframe, setTimeframe, onZoomIn, onZoomOut, onReset }) {
    return (
        <div className="flex items-center gap-4 px-4 py-2 border-t border-white/5 bg-[#0a0e27] shrink-0">
            {/* Timeframe Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {TIMEFRAMES.map((tf) => (
                    <button
                        key={tf.id}
                        onClick={() => setTimeframe(tf.id)}
                        className={`
              text-[10px] font-bold font-mono px-3 py-1.5 rounded transition-all whitespace-nowrap
              ${timeframe === tf.id
                                ? 'text-white bg-[#2962FF] shadow-lg shadow-blue-900/20'
                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                            }
            `}
                    >
                        {tf.label}
                    </button>
                ))}
            </div>

            {/* Current Time (UTC) */}
            <div className="ml-auto flex items-center gap-4">
                <CurrentTime />

                {/* Chart Controls */}
                <div className="flex items-center gap-2 hidden sm:flex">
                    <button className="text-[10px] font-mono font-bold text-gray-500 hover:text-white px-2 py-1 rounded hover:bg-white/5">
                        %
                    </button>
                    <button className="text-[10px] font-mono font-bold text-gray-500 hover:text-white px-2 py-1 rounded hover:bg-white/5">
                        log
                    </button>
                    <button onClick={onReset} className="text-[10px] font-mono font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 hover:bg-blue-500/20 transition-colors">
                        auto
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
        const hours = time.getUTCHours().toString().padStart(2, '0');
        const minutes = time.getUTCMinutes().toString().padStart(2, '0');
        const seconds = time.getUTCSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds} UTC+0`;
    };

    return (
        <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.03] rounded-lg border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00c853] animate-pulse"></div>
            <span className="text-[10px] font-mono font-bold text-gray-400">
                {formatTime()}
            </span>
        </div>
    );
}

