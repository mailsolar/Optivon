import React, { useState, useEffect } from 'react';

export default function PositionOverlay({ position, currentPrice }) {
    const [pnl, setPnl] = useState(0);
    const [prevPnl, setPrevPnl] = useState(0);
    const [flash, setFlash] = useState(null); // 'profit' or 'loss'

    useEffect(() => {
        const entry = parseFloat(position.entry_price || position.price || position.entryPrice || 0);
        const multiplier = position.symbol === 'BANKNIFTY' ? 15 : (position.symbol === 'NIFTY' ? 65 : 1);
        const qty = parseInt(position.lots || 1) * multiplier;

        if (entry && currentPrice) {
            const diff = position.side === 'buy' ? currentPrice - entry : entry - currentPrice;
            let newPnl = diff * qty;

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
        <div className="absolute bottom-0 left-0 right-0 flex items-center pointer-events-none z-20">
            {/* Position Information Badge - Bottom Bar */}
            <div className="flex items-center w-full pointer-events-auto">
                <div className={`flex items-center gap-4 flex-1 px-4 py-2 shadow-2xl backdrop-blur-xl bg-background/95 border-t-2 ${position.side === 'buy' ? 'border-[#00c853]' : 'border-[#ff1744]'} transition-all duration-300 ${flash === 'profit' ? 'ring-1 ring-[#00c853]/50' : flash === 'loss' ? 'ring-1 ring-[#ff1744]/50' : ''
                    }`}>
                    <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black tracking-[2px] uppercase ${position.side === 'buy' ? 'text-[#00c853]' : 'text-[#ff1744]'}`}>
                            {side}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-white/10"></div>
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{position.lots} Lots</span>
                        <div className="w-1 h-1 rounded-full bg-white/10"></div>
                        <span className="text-[10px] font-mono font-bold text-white/40">
                            @ {(parseFloat(position.entry_price || position.price || 0)).toFixed(2)}
                        </span>
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                        <span className={`text-[13px] font-mono font-black transition-colors duration-200 ${isProfit ? 'text-[#00c853]' : 'text-[#ff1744]'}`}>
                            {isProfit ? '+' : '-'}₹{Math.abs(pnl).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{isProfit ? 'Profit' : 'Loss'}</span>
                    </div>
                </div>

                {/* Current Price Label */}
                <div className={`px-3 py-2 text-[11px] font-mono font-black text-white shadow-xl ${position.side === 'buy' ? 'bg-[#00c853]' : 'bg-[#ff1744]'}`}>
                    {(parseFloat(position.entry_price || position.price || 0)).toFixed(2)}
                </div>
            </div>
        </div>
    );
}

