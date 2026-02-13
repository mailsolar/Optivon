import React, { useState } from 'react';
import { Search, TrendingUp, TrendingDown, Layers } from 'lucide-react';

export default function Watchlist({ quotes = {}, onSelectSymbol, selectedSymbol, searchTerm = "" }) {
    const [watchlist, setWatchlist] = useState([
        'NIFTY', 'BANKNIFTY'
    ]);

    // Use current quotes to sort or filter? For now just filter by search
    const visibleSymbols = watchlist.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="flex flex-col h-full bg-[#0a0e27]">
            {/* Header */}
            <div className="p-4 space-y-3 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                            <Layers className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-tighter">Active Wishlist</h3>
                            <p className="text-[10px] text-gray-500 font-bold">{visibleSymbols.length} Assets</p>
                        </div>
                    </div>
                    <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors border border-white/5">
                        <Search className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                {visibleSymbols.length > 0 ? (
                    visibleSymbols.map(symbol => {
                        const quote = quotes[symbol] || { ltp: 24000 + Math.random() * 50, dayChange: (Math.random() - 0.5) * 2 };
                        const isPositive = quote.dayChange >= 0;
                        const isSelected = selectedSymbol === symbol;

                        return (
                            <button
                                key={symbol}
                                onClick={() => onSelectSymbol(symbol)}
                                className={`
                                    w-full rounded-xl p-3 transition-all relative overflow-hidden group border
                                    ${isSelected
                                        ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.1)]'
                                        : 'bg-[#1a1e2e]/50 border-white/5 hover:border-white/10 hover:bg-white/5'
                                    }
                                `}
                            >
                                <div className="flex items-start justify-between mb-2 relative z-10">
                                    <div className="flex-1 text-left">
                                        <div className="flex items-center gap-2">
                                            <h4 className={`text-sm font-black tracking-tight ${isSelected ? 'text-white' : 'text-gray-300'}`}>{symbol}</h4>
                                            {isSelected && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse" />
                                            )}
                                        </div>
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-0.5">NSE GLOBAL</p>
                                    </div>

                                    <div className={`text-right ${isPositive ? 'text-[#00c853]' : 'text-[#ff1744]'}`}>
                                        <div className="text-sm font-mono font-black">
                                            {quote.ltp?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                        <div className="text-[10px] font-black flex justify-end items-center gap-0.5 mt-0.5">
                                            {isPositive ? '+' : ''}{quote.dayChange?.toFixed(2)}%
                                        </div>
                                    </div>
                                </div>

                                {/* Mini Chart Visualization (CSS Only) */}
                                <div className="h-6 flex items-end gap-[1px] opacity-20 mt-2">
                                    {[...Array(20)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`flex-1 rounded-t-sm ${isPositive ? 'bg-[#00c853]' : 'bg-[#ff1744]'}`}
                                            style={{ height: `${20 + Math.random() * 80}%` }}
                                        />
                                    ))}
                                </div>
                            </button>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                        <Search className="w-12 h-12 text-gray-700 mb-4" />
                        <span className="text-xs font-black text-gray-600 uppercase tracking-widest">No Assets Found</span>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-white/[0.01] border-t border-white/5">
                <div className="flex justify-between items-center">
                    <span className="text-[8px] font-black text-gray-700 uppercase tracking-[2px]">Wishlist v5.2</span>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse"></div>
                        <span className="text-[8px] text-cyan-500/50 font-black uppercase tracking-widest">Verified Feed</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

