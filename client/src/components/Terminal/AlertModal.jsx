import React, { useState, useEffect } from 'react';
import { X, Bell, Trash2, TrendingUp, TrendingDown, Clock, Shield, Target, Plus, Minus, ArrowRight } from 'lucide-react';
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
        <div className="absolute inset-y-0 right-0 w-80 bg-background border-l border-white/[0.05] z-[60] shadow-premium flex flex-col animate-in slide-in-from-right duration-300 font-sans">
            {/* Header */}
            <div className="p-6 border-b border-white/[0.03] flex items-center justify-between bg-surface/30">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-instrument bg-accent/5 flex items-center justify-center border border-accent/10 shadow-inner">
                        <Bell size={18} className="text-accent" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Price Alerts</span>
                        <span className="text-[8px] font-black text-muted uppercase tracking-widest mt-0.5">{symbol} // ACTIVE_NODE</span>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-all text-muted hover:text-primary">
                    <X size={16} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/[0.03] bg-surface/20">
                <button
                    onClick={() => setActiveTab('create')}
                    className={`flex-1 py-4 text-[9px] font-black uppercase tracking-[0.4em] transition-all relative ${activeTab === 'create' ? 'text-accent' : 'text-muted hover:text-secondary'}`}
                >
                    Create
                    {activeTab === 'create' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-accent" />}
                </button>
                <button
                    onClick={() => setActiveTab('manage')}
                    className={`flex-1 py-4 text-[9px] font-black uppercase tracking-[0.4em] transition-all relative ${activeTab === 'manage' ? 'text-accent' : 'text-muted hover:text-secondary'}`}
                >
                    Nodes ({symbolAlerts.length})
                    {activeTab === 'manage' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-accent" />}
                    {symbolAlerts.some(a => a.triggered) && <div className="absolute top-3 right-8 w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse shadow-[0_0_5px_#ff1744]"></div>}
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 hide-scrollbar">
                {activeTab === 'create' ? (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        {/* Selector */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setDirection('sell')}
                                className={`p-4 rounded-premium border transition-all flex flex-col items-center gap-2 group ${direction === 'sell' ? 'bg-red-400/5 border-red-400/20 text-primary shadow-inner' : 'bg-surface/30 border-white/[0.03] text-muted'}`}
                            >
                                <TrendingDown size={14} className={`${direction === 'sell' ? 'text-red-400' : 'text-muted opacity-30'}`} />
                                <span className="text-[8px] font-black uppercase tracking-widest">Wait Below</span>
                                <span className="text-[10px] font-mono font-bold opacity-50">{bid?.toFixed(2)}</span>
                            </button>
                            <button
                                onClick={() => setDirection('buy')}
                                className={`p-4 rounded-premium border transition-all flex flex-col items-center gap-2 group ${direction === 'buy' ? 'bg-accent/5 border-accent/20 text-primary shadow-inner' : 'bg-surface/30 border-white/[0.03] text-muted'}`}
                            >
                                <TrendingUp size={14} className={`${direction === 'buy' ? 'text-accent' : 'text-muted opacity-30'}`} />
                                <span className="text-[8px] font-black uppercase tracking-widest">Wait Above</span>
                                <span className="text-[10px] font-mono font-bold opacity-50">{ask?.toFixed(2)}</span>
                            </button>
                        </div>

                        {/* Price Input */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[9px] font-black text-muted uppercase tracking-[0.4em]">Target Price</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
                                    <span className="text-[8px] font-mono text-accent/50 uppercase">SYNC_LIVE</span>
                                </div>
                            </div>
                            
                            <div className="relative group/input">
                                <div className="absolute inset-0 bg-accent/[0.02] rounded-premium pointer-events-none group-focus-within/input:bg-accent/[0.05] transition-all" />
                                <div className="flex items-center bg-background/50 rounded-premium border border-white/[0.05] overflow-hidden focus-within:border-accent/30 transition-all shadow-inner relative z-10">
                                    <button onClick={() => setTargetPrice(targetPrice - 1)} className="p-4 text-muted hover:text-primary transition-colors"><Minus size={14} /></button>
                                    <input
                                        type="number"
                                        value={targetPrice}
                                        onChange={(e) => setTargetPrice(parseFloat(e.target.value))}
                                        className="w-full bg-transparent text-center font-mono font-black text-xl text-primary outline-none py-5 tracking-tighter"
                                    />
                                    <button onClick={() => setTargetPrice(targetPrice + 1)} className="p-4 text-muted hover:text-primary transition-colors"><Plus size={14} /></button>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-center gap-2 pt-2">
                                <p className="text-[9px] text-muted font-bold uppercase tracking-[0.1em] text-center px-6 leading-relaxed opacity-60">
                                    Protocol will trigger when price reaches <span className="text-primary font-black italic">{targetPrice.toFixed(2)}</span>
                                </p>
                                <span className={`text-[10px] font-mono font-bold ${Math.abs(targetPrice - currentPrice) < 5 ? 'text-accent' : 'text-muted'}`}>
                                    Distance: {Math.abs(targetPrice - currentPrice).toFixed(2)} pts
                                </span>
                            </div>
                        </div>

                        {/* Options */}
                        <div className="p-6 bg-surface/30 border border-white/[0.03] rounded-premium space-y-5 shadow-inner">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black text-secondary uppercase tracking-[0.3em]">Audio Signal</span>
                                <div className="w-8 h-4 bg-accent rounded-full flex items-center justify-end px-1 cursor-pointer"><div className="w-2.5 h-2.5 bg-background rounded-full transition-all shadow-premium"></div></div>
                            </div>
                            <div className="flex items-center justify-between opacity-40">
                                <span className="text-[9px] font-black text-secondary uppercase tracking-[0.3em]">Persistent Link</span>
                                <div className="w-8 h-4 bg-background border border-white/10 rounded-full flex items-center justify-start px-1 cursor-pointer"><div className="w-2.5 h-2.5 bg-muted rounded-full"></div></div>
                            </div>
                        </div>

                        <button
                            onClick={handleCreate}
                            className="w-full py-5 bg-accent text-background font-black text-[10px] uppercase tracking-[0.4em] rounded-instrument shadow-premium hover:bg-primary transition-all active:scale-95 flex items-center justify-center gap-3 group"
                        >
                            Establish Node <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        {symbolAlerts.length === 0 ? (
                            <div className="py-24 text-center space-y-6 opacity-20">
                                <Bell size={48} className="text-muted mx-auto" />
                                <span className="text-[10px] font-black text-muted uppercase tracking-[0.5em] block">No Active Nodes</span>
                            </div>
                        ) : (
                            symbolAlerts.map(alert => (
                                <div key={alert.id} className={`p-5 rounded-premium border transition-all relative overflow-hidden group ${alert.triggered ? 'bg-red-400/5 border-red-400/20 opacity-60 shadow-inner' : 'bg-surface/30 border-white/[0.03] hover:border-accent/10 shadow-sm'}`}>
                                    <div className="flex justify-between items-start mb-3 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-1.5 h-1.5 rounded-full ${alert.triggered ? 'bg-red-400 animate-pulse shadow-[0_0_5px_#ff1744]' : 'bg-accent shadow-[0_0_8px_#C50022]'}`}></div>
                                            <span className="text-base font-mono font-black text-primary tracking-tighter">{alert.targetPrice.toFixed(2)}</span>
                                        </div>
                                        <button onClick={() => removeAlert(alert.id)} className="p-1 text-muted hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                                    </div>
                                    <div className="flex items-center justify-between relative z-10">
                                        <span className="text-[9px] font-black text-muted uppercase tracking-widest font-mono opacity-60">{new Date(alert.createdAt).toLocaleTimeString()}</span>
                                        <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${alert.triggered ? 'text-red-400 border-red-400/20 bg-red-400/5' : 'text-accent border-accent/20 bg-accent/5'}`}>
                                            {alert.triggered ? 'TRIGGERED' : 'WAITING'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                        {symbolAlerts.some(a => a.triggered) && (
                            <button
                                onClick={clearTriggered}
                                className="w-full py-4 mt-6 text-[9px] font-black text-muted hover:text-primary uppercase tracking-[0.4em] border border-dashed border-white/10 rounded-premium transition-all hover:bg-white/[0.02]"
                            >
                                Clear Node History
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
