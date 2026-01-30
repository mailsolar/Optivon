import React, { useState, useEffect } from 'react';

export default function PositionOverlay({ position, currentPrice }) {
    const [pnl, setPnl] = useState(0);

    useEffect(() => {
        const entry = parseFloat(position.entry_price || position.price || position.entryPrice || 0);

        // Dynamic Multiplier - NIFTY 50, BANKNIFTY 15, others 1
        let multiplier = 1;
        if (position.symbol) {
            if (position.symbol.includes('NIFTY') && !position.symbol.includes('BANKNIFTY')) multiplier = 50;
            else if (position.symbol.includes('BANKNIFTY')) multiplier = 15;
            else multiplier = 1;
        }

        const qty = parseInt(position.lots || 1) * multiplier;

        if (entry && currentPrice) {
            const diff = position.side === 'buy' ? currentPrice - entry : entry - currentPrice;
            setPnl(diff * qty);
        }
    }, [currentPrice, position]);

    const isProfit = pnl >= 0;
    const side = position.side === 'buy' ? 'BUY' : 'SELL';
    const accentColor = position.side === 'buy' ? 'emerald-500' : 'red-500';
    const bgAccent = position.side === 'buy' ? 'bg-emerald-600' : 'bg-red-600';

    return (
        <div className="absolute left-0 right-0 flex items-center group pointer-events-none -translate-y-1/2">
            {/* Extended Visual Line */}
            <div className={`flex-1 border-t border-dashed ${position.side === 'buy' ? 'border-emerald-500/20' : 'border-red-500/20'}`}></div>

            {/* Position Information Node */}
            <div className="flex items-center gap-1.5 pointer-events-auto">
                <div className={`flex items-center gap-4 px-4 py-2 rounded-l-xl border-l-[3px] shadow-2xl backdrop-blur-lg bg-[#0a0e27]/90 ${position.side === 'buy' ? 'border-emerald-500' : 'border-red-500'
                    }`}>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-[8px] font-black tracking-widest uppercase ${position.side === 'buy' ? 'text-emerald-400' : 'text-red-400'}`}>
                                {side}
                            </span>
                            <div className="w-1 h-1 rounded-full bg-white/10"></div>
                            <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">{position.lots} Lots</span>
                        </div>
                        <span className="text-xs font-mono font-black text-white">
                            {(parseFloat(position.entry_price || position.price || 0)).toFixed(2)}
                        </span>
                    </div>

                    <div className="w-px h-8 bg-white/5"></div>

                    <div className="flex flex-col items-end">
                        <span className={`text-[11px] font-mono font-black ${isProfit ? 'text-emerald-500' : 'text-red-500'}`}>
                            {isProfit ? '+' : ''}{pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest">Pipeline P&L</span>
                    </div>
                </div>

                {/* Y-Axis Label */}
                <div className={`px-2.5 py-2 text-[10px] font-mono font-black text-white rounded-r-xl shadow-xl ${bgAccent}`}>
                    {(parseFloat(position.entry_price || position.price || 0)).toFixed(2)}
                </div>
            </div>

            {/* Axis Padding */}
            <div className="w-14"></div>
        </div>
    );
}
