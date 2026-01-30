import React from 'react';
import { XCircle, TrendingUp, TrendingDown, Clock } from 'lucide-react';

export default function Positions({ positions, quotes, onClosePosition }) {
    if (!positions || positions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-700 bg-[#0a0e27] p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-white/[0.02] flex items-center justify-center mb-4 border border-white/5">
                    <Clock className="w-8 h-8 opacity-20" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[3px] mb-2 text-white/30">No Active Pipeline</h3>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-700">Open a trade to start protocol tracking</p>
            </div>
        );
    }

    let totalPnL = 0;

    return (
        <div className="flex flex-col h-full bg-[#0a0e27] font-sans">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Active Positions</span>
                <span className="text-[9px] font-black text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded uppercase">{positions.length} Live</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {positions.map(pos => {
                    const quote = quotes[pos.symbol];
                    const entry = parseFloat(pos.entry_price || pos.price || 0);
                    const curr = quote ? (pos.side === 'buy' ? quote.ltp : quote.ltp) : entry;

                    const multiplier = pos.symbol === 'BANKNIFTY' ? 15 : (pos.symbol === 'NIFTY' ? 50 : 1);
                    const pnl = (pos.side === 'buy' ? curr - entry : entry - curr) * pos.lots * multiplier;
                    totalPnL += pnl;

                    const isProfit = pnl >= 0;

                    return (
                        <div key={pos.id} className="p-5 border-b border-white/[0.03] group hover:bg-white/[0.02] transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-black text-white tracking-tighter uppercase">{pos.symbol}</span>
                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${pos.side === 'buy'
                                            ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
                                            : 'text-red-400 border-red-500/20 bg-red-500/10'
                                            }`}>
                                            {pos.side.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-mono font-bold text-white/40">ENTRY: {entry.toFixed(2)}</span>
                                        <div className="w-1 h-1 rounded-full bg-white/10"></div>
                                        <span className="text-[10px] font-mono font-bold text-white/40">LOTS: {pos.lots}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-sm font-mono font-black ${isProfit ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {isProfit ? '+' : ''}{pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                    <div className="text-[8px] font-black text-gray-600 uppercase tracking-widest mt-1">Real-Time P&L</div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => onClosePosition(pos)}
                                    className="flex-1 py-2.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 rounded-lg text-[9px] font-black uppercase tracking-[2px] transition-all flex items-center justify-center gap-2"
                                >
                                    <XCircle className="w-3 h-3" />
                                    Close Pipeline
                                </button>

                                <div className="flex items-center gap-3 px-3 bg-white/5 rounded-lg border border-white/5">
                                    {isProfit ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> : <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Total Footer */}
            <div className="p-6 bg-white/[0.02] border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Aggregate Exposure</span>
                    <span className={`text-xl font-mono font-black ${totalPnL >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {totalPnL >= 0 ? '+' : ''}{totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                </div>
                <div className="text-[8px] text-gray-600 font-bold uppercase tracking-[3px] text-right">Net Portfolio Value</div>
            </div>
        </div>
    );
}
