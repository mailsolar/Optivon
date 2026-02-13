import React, { useState, useEffect } from 'react';
import { X, Bell, Trash2, TrendingUp, TrendingDown, Clock, Shield, Target, Plus, Minus } from 'lucide-react';
import { useAlerts } from '../../context/AlertContext';

export default function AlertModal({ isOpen, onClose, symbol, currentPrice, quotes }) {
    const { addAlert, alerts, removeAlert, clearTriggered } = useAlerts();
    const [targetPrice, setTargetPrice] = useState(currentPrice || 0);
    const [direction, setDirection] = useState('buy'); // buy means wait for price to go UP, sell means DOWN
    const [activeTab, setActiveTab] = useState('create');

    useEffect(() => {
        if (currentPrice) setTargetPrice(currentPrice);
    }, [currentPrice]);

    const handleCreate = () => {
        addAlert({
            symbol,
            targetPrice: parseFloat(targetPrice),
            initialPrice: currentPrice,
            direction
        });
        onClose();
    };

    if (!isOpen) return null;

    const symbolAlerts = alerts.filter(a => a.symbol === symbol);
    const quote = quotes[symbol] || {};
    const bid = quote.bid || currentPrice;
    const ask = quote.ask || currentPrice;

    return (
        <div className="absolute inset-y-0 right-0 w-80 bg-[#0a0e27] border-l border-white/10 z-[60] shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-[#070b1a]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <Bell className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Price Alerts</span>
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">{symbol} • ACTIVE NODE</span>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <X className="w-4 h-4 text-gray-500" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/5 bg-[#070b1a]/50">
                <button
                    onClick={() => setActiveTab('create')}
                    className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'create' ? 'text-blue-400 border-b-2 border-blue-500 bg-white/[0.02]' : 'text-gray-600 hover:text-gray-400'}`}
                >
                    Create Alert
                </button>
                <button
                    onClick={() => setActiveTab('manage')}
                    className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'manage' ? 'text-blue-400 border-b-2 border-blue-500 bg-white/[0.02]' : 'text-gray-600 hover:text-gray-400'}`}
                >
                    Manage ({symbolAlerts.length})
                    {symbolAlerts.some(a => a.triggered) && <div className="absolute top-2 right-4 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>}
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
                {activeTab === 'create' ? (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Selector */}
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setDirection('sell')}
                                className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${direction === 'sell' ? 'bg-[#ff1744]/10 border-[#ff1744]/30 text-white' : 'bg-white/[0.02] border-white/5 text-gray-500'}`}
                            >
                                <TrendingDown className={`w-4 h-4 ${direction === 'sell' ? 'text-[#ff1744]' : 'text-gray-700'}`} />
                                <span className="text-[8px] font-black uppercase">Wait Below</span>
                                <span className="text-[10px] font-mono font-bold opacity-50">{bid.toFixed(2)}</span>
                            </button>
                            <button
                                onClick={() => setDirection('buy')}
                                className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${direction === 'buy' ? 'bg-[#00c853]/10 border-[#00c853]/30 text-white' : 'bg-white/[0.02] border-white/5 text-gray-500'}`}
                            >
                                <TrendingUp className={`w-4 h-4 ${direction === 'buy' ? 'text-[#00c853]' : 'text-gray-700'}`} />
                                <span className="text-[8px] font-black uppercase">Wait Above</span>
                                <span className="text-[10px] font-mono font-bold opacity-50">{ask.toFixed(2)}</span>
                            </button>
                        </div>

                        {/* Price Input */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Target Price</span>
                                <span className="text-[9px] font-mono text-blue-500/50">IST SYNC</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 flex items-center bg-[#1a1e2e] rounded-2xl border border-white/5 overflow-hidden focus-within:border-blue-500/50 transition-all shadow-inner px-2">
                                    <button onClick={() => setTargetPrice(targetPrice - 1)} className="p-3 text-gray-600 hover:text-white transition-colors"><Minus className="w-4 h-4" /></button>
                                    <input
                                        type="number"
                                        value={targetPrice}
                                        onChange={(e) => setTargetPrice(parseFloat(e.target.value))}
                                        className="w-full bg-transparent text-center font-mono font-black text-xl text-white outline-none py-4"
                                    />
                                    <button onClick={() => setTargetPrice(targetPrice + 1)} className="p-3 text-gray-600 hover:text-white transition-colors"><Plus className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest text-center px-4 leading-relaxed">
                                    Alert will trigger when price crosses <span className="text-white">{targetPrice.toFixed(2)}</span>
                                </p>
                                <span className={`text-[10px] font-mono font-bold ${Math.abs(targetPrice - currentPrice) < 5 ? 'text-blue-400' : 'text-gray-700'}`}>
                                    Distance: {Math.abs(targetPrice - currentPrice).toFixed(2)} pts
                                </span>
                            </div>
                        </div>

                        {/* Options */}
                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Audio Protocol</span>
                                <div className="w-8 h-4 bg-blue-500 rounded-full flex items-center justify-end px-1 cursor-pointer"><div className="w-2.5 h-2.5 bg-white rounded-full"></div></div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Auto Decommission</span>
                                <div className="w-8 h-4 bg-gray-800 rounded-full flex items-center justify-start px-1 cursor-pointer"><div className="w-2.5 h-2.5 bg-gray-600 rounded-full"></div></div>
                            </div>
                        </div>

                        <button
                            onClick={handleCreate}
                            className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-[3px] rounded-2xl shadow-2xl shadow-blue-900/40 transition-all active:scale-95"
                        >
                            Establish Alert Node
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3 animate-in fade-in duration-300">
                        {symbolAlerts.length === 0 ? (
                            <div className="py-20 text-center space-y-4">
                                <Bell className="w-12 h-12 text-gray-800 mx-auto opacity-20" />
                                <span className="text-[10px] font-black text-gray-700 uppercase tracking-[3px] block">No Active Nodes</span>
                            </div>
                        ) : (
                            symbolAlerts.map(alert => (
                                <div key={alert.id} className={`p-4 rounded-xl border transition-all relative overflow-hidden group ${alert.triggered ? 'bg-red-500/5 border-red-500/20 opacity-60' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}>
                                    <div className="flex justify-between items-start mb-2 relative z-10">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${alert.triggered ? 'bg-red-500 animate-pulse' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'}`}></div>
                                            <span className="text-[10px] font-mono font-black text-white">{alert.targetPrice.toFixed(2)}</span>
                                        </div>
                                        <button onClick={() => removeAlert(alert.id)} className="p-1 hover:text-[#ff1744] transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                    <div className="flex items-center justify-between relative z-10">
                                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{new Date(alert.createdAt).toLocaleTimeString()}</span>
                                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${alert.triggered ? 'text-red-400 bg-red-400/10' : 'text-blue-400 bg-blue-400/10'}`}>
                                            {alert.triggered ? 'TRIGGERED' : 'WAITING'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                        {symbolAlerts.some(a => a.triggered) && (
                            <button
                                onClick={clearTriggered}
                                className="w-full py-3 mt-4 text-[9px] font-black text-gray-500 hover:text-white uppercase tracking-widest border border-dashed border-white/10 rounded-xl transition-all"
                            >
                                Clear Triggered History
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

