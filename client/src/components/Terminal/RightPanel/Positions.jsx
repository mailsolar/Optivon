
import React from 'react';

export default function Positions({ positions, quotes, onClosePosition }) {
    if (!positions || positions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 text-xs">
                <div className="mb-2 opacity-50 text-4xl">📂</div>
                <p>No open positions</p>
            </div>
        );
    }

    let totalPnL = 0;

    return (
        <div className="flex flex-col h-full bg-[#1e1e24] text-sm">
            <div className="flex-1 overflow-y-auto">
                {positions.map(pos => {
                    const quote = quotes[pos.symbol];
                    const curr = quote ? (pos.side === 'buy' ? quote.bid : quote.ask) : pos.entry_price;
                    const multiplier = pos.symbol === 'NIFTY' ? 50 : 15;
                    const pnl = (pos.side === 'buy' ? curr - pos.entry_price : pos.entry_price - curr) * pos.lots * multiplier;
                    totalPnL += pnl;

                    return (
                        <div key={pos.id} className="p-3 border-b border-white/5 hover:bg-white/5">
                            <div className="flex justify-between mb-1">
                                <span className="font-semibold text-gray-200">{pos.symbol}</span>
                                <span className={`font-mono font-medium ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span className={pos.side === 'buy' ? 'text-blue-400' : 'text-orange-400'}>
                                    {pos.side.toUpperCase()} {pos.lots} L
                                </span>
                                <div className="flex items-center gap-2">
                                    <span>@ {pos.entry_price.toFixed(2)}</span>
                                    <button
                                        onClick={() => onClosePosition && onClosePosition(pos)}
                                        className="bg-white/10 hover:bg-white/20 text-xs px-1.5 py-0.5 rounded text-gray-400 hover:text-white transition-colors"
                                        title="Close Position"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Net P&L Footer */}
            <div className="p-4 bg-[#2a2a30] border-t border-white/10">
                <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs uppercase font-bold">Total P&L</span>
                    <span className={`text-lg font-bold font-mono ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    );
}
