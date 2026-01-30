import React, { useState, useEffect } from 'react';

export default function PositionOverlay({ position, currentPrice }) {
    const [pnl, setPnl] = useState(0);
    const [prevPnl, setPrevPnl] = useState(0);
    const [flash, setFlash] = useState(null); // 'profit' or 'loss'

    useEffect(() => {
        const entry = parseFloat(position.entry_price || position.price || position.entryPrice || 0);
        const multiplier = position.symbol === 'BANKNIFTY' ? 15 : (position.symbol === 'NIFTY' ? 50 : 1);
        const qty = parseInt(position.lots || 1) * multiplier;

        if (entry && currentPrice) {
            const diff = position.side === 'buy' ? currentPrice - entry : entry - currentPrice;
            const newPnl = diff * qty;

            if (newPnl > pnl) setFlash('profit');
            else if (newPnl < pnl) setFlash('loss');

            setPrevPnl(pnl);
            setPnl(newPnl);

            const timer = setTimeout(() => setFlash(null), 300);
            return () => clearTimeout(timer);
        }
    }, [currentPrice, position]);

    const isProfit = pnl >= 0;
    const side = position.side === 'buy' ? 'BUY' : 'SELL';

    return (
        <div className="absolute left-0 right-0 flex items-center group pointer-events-none -translate-y-1/2 z-20">
            {/* Entry Line - Professional Blue Dashed */}
            <div className="flex-1 border-t-2 border-dashed border-[#2962ff]/40 shadow-[0_0_10px_rgba(41,98,255,0.2)]"></div>

            {/* Position Information Badge */}
            <div className="flex items-center gap-2 pointer-events-auto">
                <div className={`flex items-center gap-4 px-4 py-2.5 rounded-l-2xl shadow-2xl backdrop-blur-xl bg-[#1a1e2e]/95 border-l-4 border-[#2962ff] transition-all duration-300 ${flash === 'profit' ? 'ring-2 ring-[#00c853]/50' : flash === 'loss' ? 'ring-2 ring-[#ff1744]/50' : ''
                    }`}>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-[9px] font-black tracking-[2px] uppercase ${position.side === 'buy' ? 'text-[#00c853]' : 'text-[#ff1744]'}`}>
                                {side}
                            </span>
                            <div className="w-1 h-1 rounded-full bg-white/10"></div>
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{position.lots} Lots</span>
                        </div>
                        <span className="text-xs font-mono font-black text-white/40">
                            Entry @ {(parseFloat(position.entry_price || position.price || 0)).toFixed(2)}
                        </span>
                    </div>

                    <div className="w-px h-8 bg-white/10"></div>

                    <div className="flex flex-col items-end min-w-[80px]">
                        <span className={`text-[13px] font-mono font-black transition-colors duration-200 ${isProfit ? 'text-[#00c853]' : 'text-[#ff1744]'}`}>
                            {isProfit ? '+' : ''}{pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest leading-none mt-1">Live Profit</span>
                    </div>
                </div>

                {/* Price Label on Axis */}
                <div className="bg-[#2962ff] px-3 py-2.5 text-[11px] font-mono font-black text-white rounded-r-2xl shadow-xl border-l border-white/10">
                    {(parseFloat(position.entry_price || position.price || 0)).toFixed(2)}
                </div>
            </div>

            {/* Padding for Chart Axis */}
            <div className="w-16"></div>
        </div>
    );
}
