import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Plus, Minus, Info, Bell, Zap, X, AlertCircle, Clock, Settings, Shield, Target, CheckCircle2 } from 'lucide-react';
import Positions from './RightPanel/Positions';
import Orders from './RightPanel/Orders';
import { useAlerts } from '../../context/AlertContext';
import { useToast } from '../../context/ToastContext';
import { validateOrder, calculateSLTP } from '../../utils/validation';

import OneClickOrderToggle from './OneClickOrder';

export default function UnifiedRightPanel({
    user,
    quotes,
    account,
    positions,
    selectedSymbol,
    onSelectSymbol,
    searchTerm,
    onClosePosition,
    onOrder,
    isOpen,
    onOpenSettings
}) {
    const [activeTab, setActiveTab] = useState('trade');
    const { addAlert, alerts } = useAlerts();
    const { addToast } = useToast();

    // Clock state
    const [currentTime, setCurrentTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Order State
    const [orderType, setOrderType] = useState('market');
    const [side, setSide] = useState('buy');
    const [lots, setLots] = useState(1);
    const [limitPrice, setLimitPrice] = useState(0);

    // One Click State
    const [oneClickEnabled, setOneClickEnabled] = useState(() => localStorage.getItem('oneClickOrder') === 'true');
    const [orderExecuting, setOrderExecuting] = useState(false);

    useEffect(() => {
        localStorage.setItem('oneClickOrder', oneClickEnabled);
    }, [oneClickEnabled]);

    // SL/TP logic
    const [slEnabled, setSlEnabled] = useState(false);
    const [slPrice, setSlPrice] = useState('');
    const [tpEnabled, setTpEnabled] = useState(false);
    const [tpPrice, setTpPrice] = useState('');

    useEffect(() => {
        if (quotes[selectedSymbol]) {
            setLimitPrice(quotes[selectedSymbol].ltp || 0);
        }
    }, [selectedSymbol, quotes]);

    const quote = quotes[selectedSymbol] || { ltp: 0, bid: 0, ask: 0, dayChange: 0 };
    const currentPrice = quote.ltp || 0;
    const lotSize = selectedSymbol.includes('NIFTY') ? (selectedSymbol === 'BANKNIFTY' ? 15 : 50) : 1;
    const totalQty = lots * lotSize;

    // Real-time P&L calculation for SL/TP
    const calculatePnL = (targetPrice, isSl) => {
        const price = parseFloat(targetPrice);
        if (!price || isNaN(price) || price <= 0) return 0;

        const entry = currentPrice;
        let diff;

        if (side === 'buy') {
            diff = price - entry;
        } else {
            diff = entry - price;
        }

        return diff * totalQty;
    };


    const setPresetSL = (percentage) => {
        if (!currentPrice) return;
        const { stopLoss } = calculateSLTP(side, currentPrice, percentage, 0);
        if (stopLoss) {
            setSlPrice(stopLoss);
            setSlEnabled(true);
        }
    };

    const setPresetTP = (percentage) => {
        if (!currentPrice) return;
        const { takeProfit } = calculateSLTP(side, currentPrice, 0, percentage);
        if (takeProfit) {
            setTpPrice(takeProfit);
            setTpEnabled(true);
        }
    };

    const handlePlaceOrder = async (overrideSide = null) => {
        const finalSide = overrideSide || side;
        let finalSl = null, finalTp = null;
        if (slEnabled && slPrice) finalSl = parseFloat(slPrice);
        if (tpEnabled && tpPrice) finalTp = parseFloat(tpPrice);

        // VALIDATION STEP
        if (orderType === 'market' || orderType === 'limit') {
            // For limit orders, validation might differ slightly (limit price vs current price)
            // But for now, validate against execution price
            const executionPrice = orderType === 'limit' ? limitPrice : currentPrice;

            const validation = validateOrder(finalSide, executionPrice, finalSl, finalTp);

            if (!validation.isValid) {
                validation.errors.forEach(err => addToast(err, 'error'));
                return; // STOP EXECUTION
            }
        }

        setOrderExecuting(true);
        try {
            await onOrder(selectedSymbol, finalSide, lots, orderType, null, orderType === 'limit' ? limitPrice : 0, finalSl, finalTp);
            if (oneClickEnabled) {
                addToast(`${finalSide.toUpperCase()} order sent`, 'success');
            }
        } finally {
            setOrderExecuting(false);
        }
    };

    // ... render


    if (!isOpen) return null;

    return (
        <div className="flex flex-col h-full bg-[#0a0e27] border-l border-white/5 relative overflow-hidden select-none">

            {/* TAB HEADER */}
            <div className="flex bg-[#070b1a] border-b border-white/5 h-12 shrink-0">
                {['trade', 'positions', 'orders'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 flex items-center justify-center text-[10px] font-black uppercase tracking-[1px] relative transition-all ${activeTab === tab ? 'text-blue-400 bg-white/[0.02]' : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 shadow-[0_0_15px_rgba(41,98,255,1)]"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 overflow-hidden relative flex flex-col min-h-0">
                {activeTab === 'trade' && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col p-5 space-y-6">

                        {/* Market Overview Header */}
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Active Symbol</span>
                                <h2 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">{selectedSymbol}</h2>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${quote.dayChange >= 0 ? 'bg-[#00c853]' : 'bg-[#ff1744]'} animate-pulse`}></div>
                                    <span className="text-[10px] text-white/30 font-black tracking-widest uppercase">Protocol RT Feed</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] rounded-xl border border-white/5">
                                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                                    <span className="text-[11px] font-mono font-black text-white/70">{currentTime.toLocaleTimeString([], { hour12: false })} IST</span>
                                </div>
                                <OneClickOrderToggle enabled={oneClickEnabled} onToggle={setOneClickEnabled} />
                            </div>
                        </div>

                        {/* Account Health Matrix */}
                        <div className="flex flex-col gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl relative overflow-hidden group">
                            <div className="flex justify-between items-center relative z-10">
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Portfolio Balance</span>
                                    <span className="text-sm font-mono font-black text-white">
                                        ${(parseFloat(account?.balance) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex flex-col items-end border-l border-white/5 pl-4">
                                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Liquid Equity</span>
                                    <span className={`text-sm font-mono font-black ${account?.equity >= account?.balance ? 'text-[#00c853]' : 'text-[#ff1744]'}`}>
                                        ${(parseFloat(account?.equity) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                            <div className="h-1 bg-white/5 rounded-full overflow-hidden relative z-10">
                                <div
                                    className={`h-full transition-all duration-1000 ${account?.equity >= account?.balance ? 'bg-[#00c853] shadow-[0_0_8px_rgba(0,200,83,0.5)]' : 'bg-[#ff1744] shadow-[0_0_8px_rgba(255,23,68,0.5)]'}`}
                                    style={{ width: `${Math.min(100, (account?.equity / account?.balance) * 100)}%` }}
                                ></div>
                            </div>

                            <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-[2px] relative z-10">
                                <span className="text-white/20">Protocol Link Optimized</span>
                                <span className="text-blue-400/50">Node Sync: 100%</span>
                            </div>
                            <Shield className="absolute -right-4 -bottom-4 w-20 h-20 text-white/[0.02] group-hover:text-white/[0.04] transition-all" />
                        </div>

                        {/* Order Configuration */}
                        <div className="space-y-5">
                            {/* Quantity Control */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        Execution Lots
                                        <div className="w-1 h-1 rounded-full bg-gray-700"></div>
                                        <span className="text-blue-500/50">{lotSize}x</span>
                                    </label>
                                    <button onClick={() => setLots(1)} className="text-[9px] font-black text-gray-600 hover:text-white uppercase transition-colors">Reset</button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 flex items-center bg-[#1a1e2e] rounded-2xl border border-white/5 overflow-hidden group focus-within:border-blue-500/50 transition-all shadow-inner">
                                        <button onClick={() => setLots(Math.max(1, lots - 1))} className="px-4 py-4 text-gray-500 hover:text-white hover:bg-white/5 transition-all"><Minus className="w-4 h-4" /></button>
                                        <input
                                            type="number"
                                            value={lots}
                                            onChange={(e) => setLots(Math.max(1, parseInt(e.target.value) || 0))}
                                            className="w-full bg-transparent text-center font-mono font-black text-xl text-white outline-none"
                                        />
                                        <button onClick={() => setLots(lots + 1)} className="px-4 py-4 text-gray-500 hover:text-white hover:bg-white/5 transition-all"><Plus className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>

                            {/* Conditional Rendering for One-Click vs Standard */}
                            {!oneClickEnabled && (
                                <div className="space-y-5 animate-in slide-in-from-top-2 duration-300">
                                    {/* Order Side and Type Selection */}
                                    <div className="grid grid-cols-2 gap-2 bg-[#070b1a] p-1.5 rounded-2xl border border-white/5">
                                        <button onClick={() => setOrderType('market')} className={`py-3 text-[10px] font-black tracking-[2px] rounded-xl transition-all ${orderType === 'market' ? 'bg-[#1a1e2e] text-white shadow-lg' : 'text-gray-600 hover:text-gray-400'}`}>MARKET</button>
                                        <button onClick={() => setOrderType('limit')} className={`py-3 text-[10px] font-black tracking-[2px] rounded-xl transition-all ${orderType === 'limit' ? 'bg-[#1a1e2e] text-white shadow-lg' : 'text-gray-600 hover:text-gray-400'}`}>LIMIT</button>
                                    </div>

                                    {/* Side Selector (Visual Only since button determines action) */}
                                    {/* Actually we need to toggle side for SL/TP PnL estimation to be correct before clicking */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => setSide('buy')} className={`py-2 text-[9px] font-black uppercase tracking-widest rounded-lg border transition-all ${side === 'buy' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-transparent border-transparent text-gray-600 hover:bg-white/5'}`}>Long</button>
                                        <button onClick={() => setSide('sell')} className={`py-2 text-[9px] font-black uppercase tracking-widest rounded-lg border transition-all ${side === 'sell' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-transparent border-transparent text-gray-600 hover:bg-white/5'}`}>Short</button>
                                    </div>

                                    {orderType === 'limit' && (
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest px-1">Trigger Price</span>
                                            <input
                                                type="number"
                                                value={limitPrice}
                                                onChange={(e) => setLimitPrice(parseFloat(e.target.value))}
                                                className="w-full bg-[#1a1e2e] border border-white/5 rounded-2xl py-4 px-6 text-center font-mono text-lg font-black text-blue-400 outline-none focus:border-blue-500 transition-all shadow-inner"
                                            />
                                        </div>
                                    )}

                                    {/* SL/TP Matrix Fixed with logic */}
                                    <div className="space-y-3">
                                        {/* STOP LOSS */}
                                        <div className={`
                                            rounded-2xl border transition-all overflow-hidden
                                            ${slEnabled ? 'bg-[#ff1744]/5 border-[#ff1744]/30' : 'bg-white/[0.02] border-white/5'}
                                        `}>
                                            <div className="flex items-center justify-between p-4">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={slEnabled}
                                                        onChange={(e) => setSlEnabled(e.target.checked)}
                                                        className="w-4 h-4 accent-[#ff1744] cursor-pointer"
                                                    />
                                                    <span className={`text-[9px] font-black uppercase tracking-widest ${slEnabled ? 'text-[#ff1744]' : 'text-gray-500'}`}>
                                                        Stop Loss
                                                    </span>
                                                </div>
                                                {slEnabled && slPrice && (
                                                    <span className="text-[9px] font-mono font-bold text-[#ff1744]">
                                                        Est: ${calculatePnL(slPrice, true).toFixed(2)}
                                                    </span>
                                                )}
                                            </div>

                                            {slEnabled && (
                                                <div className="px-4 pb-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                                                    <input
                                                        type="number"
                                                        placeholder="Price..."
                                                        value={slPrice}
                                                        onChange={(e) => setSlPrice(e.target.value)}
                                                        className="w-full bg-black/40 p-3 text-xs font-mono font-bold text-[#ff1744] outline-none rounded-xl border border-white/5 focus:border-[#ff1744]/50 text-right"
                                                    />
                                                    <div className="flex gap-2">
                                                        {[1, 2, 5].map(pct => (
                                                            <button
                                                                key={pct}
                                                                onClick={() => setPresetSL(pct)}
                                                                className="flex-1 py-2 bg-white/5 hover:bg-[#ff1744]/20 rounded-lg text-[9px] font-bold text-[#ff1744] transition-colors border border-transparent hover:border-[#ff1744]/30"
                                                            >
                                                                {pct}%
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* TAKE PROFIT */}
                                        <div className={`
                                            rounded-2xl border transition-all overflow-hidden
                                            ${tpEnabled ? 'bg-[#00c853]/5 border-[#00c853]/30' : 'bg-white/[0.02] border-white/5'}
                                        `}>
                                            <div className="flex items-center justify-between p-4">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={tpEnabled}
                                                        onChange={(e) => setTpEnabled(e.target.checked)}
                                                        className="w-4 h-4 accent-[#00c853] cursor-pointer"
                                                    />
                                                    <span className={`text-[9px] font-black uppercase tracking-widest ${tpEnabled ? 'text-[#00c853]' : 'text-gray-500'}`}>
                                                        Take Profit
                                                    </span>
                                                </div>
                                                {tpEnabled && tpPrice && (
                                                    <span className="text-[9px] font-mono font-bold text-[#00c853]">
                                                        Est: +${calculatePnL(tpPrice, false).toFixed(2)}
                                                    </span>
                                                )}
                                            </div>

                                            {tpEnabled && (
                                                <div className="px-4 pb-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                                                    <input
                                                        type="number"
                                                        placeholder="Price..."
                                                        value={tpPrice}
                                                        onChange={(e) => setTpPrice(e.target.value)}
                                                        className="w-full bg-black/40 p-3 text-xs font-mono font-bold text-[#00c853] outline-none rounded-xl border border-white/5 focus:border-[#00c853]/50 text-right"
                                                    />
                                                    <div className="flex gap-2">
                                                        {[1, 2, 5].map(pct => (
                                                            <button
                                                                key={pct}
                                                                onClick={() => setPresetTP(pct)}
                                                                className="flex-1 py-2 bg-white/5 hover:bg-[#00c853]/20 rounded-lg text-[9px] font-bold text-[#00c853] transition-colors border border-transparent hover:border-[#00c853]/30"
                                                            >
                                                                {pct}%
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* FINAL ACTION SECTION */}
                        <div className="mt-auto pt-6 pb-10 shrink-0">
                            {oneClickEnabled ? (
                                <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in duration-300">
                                    <button
                                        disabled={orderExecuting}
                                        onClick={() => handlePlaceOrder('sell')}
                                        className="relative group bg-[#ff1744] hover:bg-[#ff1744]/90 disabled:opacity-50 text-white py-6 rounded-2xl flex flex-col items-center shadow-2xl shadow-red-900/20 transition-all active:scale-95 overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-2 opacity-10"><TrendingDown className="w-12 h-12" /></div>
                                        <span className="text-[9px] font-black tracking-[3px] uppercase mb-1 drop-shadow-md">DIRECT SELL</span>
                                        <span className="text-sm font-mono font-black">{quote.bid?.toFixed(2) || currentPrice.toFixed(2)}</span>
                                        <span className="text-[8px] font-black opacity-40 mt-1">{lots} LOT • {selectedSymbol.includes('NIFTY') ? '50U' : '15U'}</span>
                                        {orderExecuting && <div className="absolute inset-0 bg-black/20 flex items-center justify-center"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div></div>}
                                    </button>
                                    <button
                                        disabled={orderExecuting}
                                        onClick={() => handlePlaceOrder('buy')}
                                        className="relative group bg-[#00c853] hover:bg-[#00c853]/90 disabled:opacity-50 text-white py-6 rounded-2xl flex flex-col items-center shadow-2xl shadow-green-900/20 transition-all active:scale-95 overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-2 opacity-10"><TrendingUp className="w-12 h-12" /></div>
                                        <span className="text-[9px] font-black tracking-[3px] uppercase mb-1 drop-shadow-md">DIRECT BUY</span>
                                        <span className="text-sm font-mono font-black">{quote.ask?.toFixed(2) || currentPrice.toFixed(2)}</span>
                                        <span className="text-[8px] font-black opacity-40 mt-1">{lots} LOT • {selectedSymbol.includes('NIFTY') ? '50U' : '15U'}</span>
                                        {orderExecuting && <div className="absolute inset-0 bg-black/20 flex items-center justify-center"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div></div>}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    disabled={orderExecuting}
                                    onClick={() => handlePlaceOrder()}
                                    className={`w-full py-6 rounded-[24px] font-black text-sm uppercase tracking-[5px] shadow-2xl transition-all active:scale-90 relative overflow-hidden group ${side === 'buy' ? 'bg-[#00c853] hover:bg-[#00c853]/90 text-white' : 'bg-[#ff1744] hover:bg-[#ff1744]/90 text-white'
                                        } ${orderExecuting ? 'opacity-50' : ''}`}
                                >
                                    {orderExecuting ? (
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>ROUTING...</span>
                                        </div>
                                    ) : (
                                        <>
                                            Execute {side === 'buy' ? 'Long' : 'Short'}
                                            <div className="absolute top-0 right-10 bottom-0 w-20 bg-white/10 -skew-x-[30deg] -translate-x-full group-hover:translate-x-[400px] transition-transform duration-1000 ease-in-out pointer-events-none"></div>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'positions' && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0a0e27]">
                        <Positions positions={positions} quotes={quotes} onClosePosition={onClosePosition} />
                    </div>
                )}
                {activeTab === 'orders' && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0a0e27]">
                        <Orders accountId={account?.id} />
                    </div>
                )}
            </div>

            {/* PANEL FOOTER */}
            <div className="shrink-0 h-10 border-t border-white/5 flex items-center justify-between px-5 bg-[#070b1a]">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00c853] shadow-[0_0_8px_rgba(0,200,83,0.5)]"></div>
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-[2px]">Pipeline Stable</span>
                </div>
                <button onClick={onOpenSettings} className="p-1 px-2 text-gray-700 hover:text-white hover:bg-white/5 rounded-md transition-all flex items-center gap-2">
                    <Settings className="w-3.5 h-3.5" />
                    <span className="text-[8px] font-black uppercase tracking-widest hidden xl:block">Config</span>
                </button>
            </div>
        </div >
    );
}

const TrendingUp = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const TrendingDown = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" /></svg>;