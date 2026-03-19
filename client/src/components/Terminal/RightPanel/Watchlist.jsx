import React, { useState } from 'react';
import { Search, TrendingUp, TrendingDown, Layers, Box, Globe, ArrowUpRight } from 'lucide-react';

export default function Watchlist({ quotes = {}, onSelectSymbol, selectedSymbol, searchTerm = "" }) {
    const [watchlist, setWatchlist] = useState([
        'NIFTY', 'BANKNIFTY'
    ]);

    const visibleSymbols = watchlist.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="flex flex-col h-full bg-background font-sans overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/[0.03] bg-surface/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-instrument bg-accent/5 flex items-center justify-center border border-accent/10 shadow-inner">
                            <Layers size={18} className="text-accent" />
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Asset Wishlist</h3>
                            <p className="text-[9px] text-muted font-bold uppercase tracking-widest mt-0.5">{visibleSymbols.length} Node Links Active</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 shrink-0 hide-scrollbar">
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
                                    w-full rounded-premium p-5 transition-all relative overflow-hidden group border
                                    ${isSelected
                                        ? 'bg-accent/5 border-accent/20 shadow-premium'
                                        : 'bg-surface/30 border-white/[0.03] hover:border-accent/10 hover:bg-surface/50'
                                    }
                                `}
                            >
                                {isSelected && <div className="absolute left-0 top-0 w-1 h-full bg-accent" />}
                                
                                <div className="flex items-start justify-between mb-3 relative z-10">
                                    <div className="flex-1 text-left">
                                        <div className="flex items-center gap-3">
                                            <h4 className={`text-base font-black tracking-tighter uppercase ${isSelected ? 'text-primary' : 'text-secondary group-hover:text-primary'}`}>{symbol}</h4>
                                            {isSelected && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_#C50022] animate-pulse" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Globe size={10} className="text-muted" />
                                            <p className="text-[8px] font-black text-muted uppercase tracking-[0.2em]">NSE Protocol</p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-sm font-mono font-black text-primary tracking-tighter">
                                            {quote.ltp?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                        <div className={`text-[9px] font-black flex justify-end items-center gap-1.5 mt-1 font-mono ${isPositive ? 'text-accent' : 'text-red-400'}`}>
                                            {isPositive ? <ArrowUpRight size={10} /> : <TrendingDown size={10} />}
                                            {isPositive ? '+' : ''}{quote.dayChange?.toFixed(2)}%
                                        </div>
                                    </div>
                                </div>

                                {/* Mini Chart Visualization */}
                                <div className="h-5 flex items-end gap-[2px] opacity-10 mt-2 bg-background/20 rounded-instrument p-1">
                                    {[...Array(24)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`flex-1 rounded-t-[1px] ${isPositive ? 'bg-accent' : 'bg-red-400'}`}
                                            style={{ height: `${20 + Math.random() * 80}%` }}
                                        />
                                    ))}
                                </div>
                            </button>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-10">
                        <Search size={48} className="text-muted mb-4" />
                        <span className="text-[10px] font-black text-muted uppercase tracking-[0.5em]">No Assets Isolated</span>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-8 py-5 bg-surface/50 border-t border-white/[0.03]">
                <div className="flex justify-between items-center">
                    <span className="text-[8px] font-black text-muted uppercase tracking-[0.4em]">Node Watch v5.2</span>
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_5px_#C50022]"></div>
                        <span className="text-[8px] text-accent font-black uppercase tracking-[0.2em]">Live Feed Verified</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
