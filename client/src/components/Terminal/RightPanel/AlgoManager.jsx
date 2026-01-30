import React, { useState } from 'react';
import { Play, Square, Settings, Zap, Activity, Cpu, Trash2 } from 'lucide-react';
import { useAlgo } from '../../../context/AlgoContext';

export default function AlgoManager({ selectedSymbol, quotes, account }) {
    const { activeBots, startBot, stopBot, availableStrategies } = useAlgo();
    // Default to first strategy if available, otherwise empty string
    const [selectedStrategy, setSelectedStrategy] = useState(availableStrategies[0]?.id || '');

    return (
        <div className="flex flex-col h-full bg-[#0a0e27]">
            {/* Header */}
            <div className="p-5 border-b border-white/5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">Quantum Strategy Engine</h3>
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-white tracking-tighter uppercase">Algo Execution</h2>
                    <Cpu className="w-5 h-5 text-blue-500 animate-pulse" />
                </div>
            </div>

            {/* Active Bots List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {activeBots.length === 0 ? (
                    <div className="text-center py-10 opacity-30">
                        <Cpu className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No Active Neurons</p>
                    </div>
                ) : (
                    activeBots.map(bot => (
                        <div key={bot.id} className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl animate-in slide-in-from-right-4 relative group">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="text-xs font-black text-white uppercase tracking-wide">{bot.name}</h4>
                                    <span className="text-[9px] font-mono text-blue-400">{bot.symbol} • Running</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Activity className="w-3 h-3 text-emerald-500 animate-bounce" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <div className="bg-black/20 p-2 rounded-lg">
                                    <span className="text-[8px] text-gray-500 uppercase block">Trades</span>
                                    <span className="text-sm font-mono font-bold text-white">{bot.totalTrades}</span>
                                </div>
                                <div className="bg-black/20 p-2 rounded-lg">
                                    <span className="text-[8px] text-gray-500 uppercase block">Runtime</span>
                                    <span className="text-sm font-mono font-bold text-white">
                                        {Math.floor((Date.now() - new Date(bot.startedAt).getTime()) / 60000)}m
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => stopBot(bot.id)}
                                className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-widest rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <Square className="w-2 h-2 fill-current" /> Terminate Process
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Launch New Bot Section */}
            <div className="p-5 border-t border-white/5 bg-[#070b1a] shrink-0">
                <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3">Deploy New Strategy</h4>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[9px] font-bold text-gray-400 uppercase">Strategy Model</label>
                        <select
                            value={selectedStrategy}
                            onChange={(e) => setSelectedStrategy(e.target.value)}
                            className="w-full bg-[#1a1e2e] border border-white/5 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-blue-500"
                        >
                            {availableStrategies.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.risk})</option>
                            ))}
                        </select>
                    </div>

                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                        <p className="text-[9px] text-gray-400 leading-relaxed">
                            {availableStrategies.find(s => s.id === selectedStrategy)?.description}
                        </p>
                    </div>

                    <button
                        onClick={() => startBot(selectedStrategy, selectedSymbol, {}, account?.id)}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[2px] transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Play className="w-3 h-3 fill-current" /> Initialize Sequence
                    </button>
                </div>
            </div>
        </div>
    );
}
