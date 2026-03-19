import React, { useState } from 'react';
import { Play, Square, Settings, Zap, Activity, Cpu, Trash2, ArrowRight } from 'lucide-react';
import { useAlgo } from '../../../context/AlgoContext';

export default function AlgoManager({ selectedSymbol, quotes, account }) {
    const { activeBots, startBot, stopBot, availableStrategies } = useAlgo();
    // Default to first strategy if available, otherwise empty string
    const [selectedStrategy, setSelectedStrategy] = useState(availableStrategies[0]?.id || '');

    return (
        <div className="flex flex-col h-full bg-background font-sans">
            {/* Header */}
            <div className="p-6 border-b border-white/[0.03]">
                <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-accent mb-2">Neural Strategy Engine</h3>
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-primary tracking-tighter uppercase text-shadow-glow">Protocol Execution</h2>
                    <Cpu size={20} className="text-accent animate-pulse shadow-[0_0_10px_#C50022]" />
                </div>
            </div>

            {/* Active Bots List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar hide-scrollbar">
                {activeBots.length === 0 ? (
                    <div className="text-center py-20 opacity-20">
                        <Cpu size={48} className="mx-auto mb-4 text-muted" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">No Active Neurons</p>
                    </div>
                ) : (
                    activeBots.map(bot => (
                        <div key={bot.id} className="bg-surface/50 border border-accent/10 p-5 rounded-premium animate-in slide-in-from-right-4 relative group shadow-inner">
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-accent/20" />
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-1">{bot.name}</h4>
                                    <span className="text-[9px] font-mono font-bold text-accent uppercase tracking-tighter">{bot.symbol} • ACTIVE_LINK</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Activity size={12} className="text-accent animate-bounce" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-background/40 p-3 rounded-instrument border border-white/[0.02]">
                                    <span className="text-[8px] text-muted uppercase font-black tracking-widest block mb-1">Cycles</span>
                                    <span className="text-sm font-mono font-black text-primary tracking-tighter">{bot.totalTrades}</span>
                                </div>
                                <div className="bg-background/40 p-3 rounded-instrument border border-white/[0.02]">
                                    <span className="text-[8px] text-muted uppercase font-black tracking-widest block mb-1">Uptime</span>
                                    <span className="text-sm font-mono font-black text-primary tracking-tighter">
                                        {Math.floor((Date.now() - new Date(bot.startedAt).getTime()) / 60000)}m
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => stopBot(bot.id)}
                                className="w-full py-3 bg-red-400/5 hover:bg-red-400/10 text-red-400 text-[9px] font-black uppercase tracking-[0.3em] rounded-instrument transition-all border border-red-400/10 hover:border-red-400/20 flex items-center justify-center gap-2 group/btn"
                            >
                                <Square size={10} className="fill-current group-hover:scale-110 transition-transform" /> 
                                Terminate Session
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Launch New Bot Section */}
            <div className="p-8 border-t border-white/[0.03] bg-surface relative overflow-hidden group">
                <div className="absolute inset-0 bg-accent/[0.01] pointer-events-none" />
                <h4 className="text-[9px] font-black text-muted uppercase tracking-[0.4em] mb-4 relative z-10">Deploy New Node</h4>

                <div className="space-y-6 relative z-10">
                    <div className="space-y-3">
                        <label className="text-[9px] font-black text-accent uppercase tracking-widest pl-1">Configuration Pattern</label>
                        <select
                            value={selectedStrategy}
                            onChange={(e) => setSelectedStrategy(e.target.value)}
                            className="w-full bg-background/50 border border-white/[0.05] rounded-instrument px-4 py-3 text-[10px] font-bold text-primary uppercase tracking-widest outline-none focus:border-accent/40 shadow-inner appearance-none text-right"
                        >
                            {availableStrategies.map(s => (
                                <option key={s.id} value={s.id} className="bg-surface">{s.name} ({s.risk})</option>
                            ))}
                        </select>
                    </div>

                    <div className="p-4 bg-background/30 border border-white/[0.02] rounded-instrument shadow-inner">
                        <p className="text-[10px] text-secondary font-medium leading-relaxed tracking-tight italic opacity-80">
                            {availableStrategies.find(s => s.id === selectedStrategy)?.description}
                        </p>
                    </div>

                    <button
                        onClick={() => startBot(selectedStrategy, selectedSymbol, {}, account?.id)}
                        className="w-full py-5 bg-accent text-background rounded-instrument text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-premium hover:bg-primary active:scale-95 flex items-center justify-center gap-3 group/init"
                    >
                        <Play size={12} className="fill-current group-hover:scale-110 transition-transform" /> 
                        Initialize Sequence <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}
