import React, { useState } from 'react';
import { FileText, ArrowRight, Download, Search, Filter } from 'lucide-react';
import TabSwitcher from '../../components/Dashboard/TabSwitcher';

export default function OrderHistory() {
    const [activeTab, setActiveTab] = useState('Billing');

    const billingOrders = [
        { id: '740518', date: '2026-01-23', price: 28.00, program: 'MT5 - 1 Step - Phase 1 - 5k' },
        { id: '716692', date: '2026-01-14', price: 28.00, program: 'MT5 - 1 Step - Phase 1 - 5k' },
        { id: '567120', date: '2025-11-19', price: 28.00, program: 'MT5 - 1 Step - Phase 1 - 5k' },
        { id: '522841', date: '2025-10-28', price: 28.00, program: 'MT5 - 1 Step - Phase 1 - 5k' },
        { id: '158004', date: '2025-03-13', price: 26.25, program: 'MT5 - 2 Step - Phase 1 - 5k' },
    ];

    const trades = [
        { ticket: '705781', symbol: 'USDJPY.pi', side: 'Sell', sl: '154.102', tp: '153.754', openTime: '30/01/2026 09:39:41 AM', openPrice: '154.051', closeTime: '30/01/2026 09:45:33 AM' },
        { ticket: '690467', symbol: 'XAUUSD.pi', side: 'Sell', sl: '5195.98', tp: '5101.44', openTime: '30/01/2026 06:06:14 AM', openPrice: '5186.65', closeTime: '30/01/2026 06:10:07 AM' },
        { ticket: '689787', symbol: 'XAUUSD.pi', side: 'Sell', sl: '5197.21', tp: '5113.73', openTime: '30/01/2026 05:59:29 AM', openPrice: '5183.07', closeTime: '30/01/2026 06:01:52 AM' },
        { ticket: '689655', symbol: 'XAUUSD.pi', side: 'Sell', sl: '0', tp: '0', openTime: '30/01/2026 05:59:29 AM', openPrice: '5182.98', closeTime: '30/01/2026 06:00:40 AM' },
        { ticket: '688293', symbol: 'XAUUSD.pi', side: 'Sell', sl: '5232.6', tp: '5156.24', openTime: '30/01/2026 05:34:42 AM', openPrice: '5214.83', closeTime: '30/01/2026 05:37:30 AM' },
    ];

    return (
        <div className="flex flex-col gap-10 max-w-6xl mx-auto font-sans">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-2">
                    <div className="text-[10px] font-bold text-accent uppercase tracking-[0.4em]">Audit Logs</div>
                    <h1 className="text-3xl font-bold text-primary uppercase tracking-tight text-shadow-glow">Transaction Ledger</h1>
                    <p className="text-secondary font-medium text-sm">Full transparency of your billing and trade executions.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex p-1 bg-surface border border-white/5 rounded-instrument">
                        <button 
                            onClick={() => setActiveTab('Billing')}
                            className={`px-6 py-2 rounded-instrument text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'Billing' ? 'bg-accent text-background shadow-soft' : 'text-muted hover:text-primary'}`}
                        >
                            Billing
                        </button>
                        <button 
                            onClick={() => setActiveTab('Trades')}
                            className={`px-6 py-2 rounded-instrument text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'Trades' ? 'bg-accent text-background shadow-soft' : 'text-muted hover:text-primary'}`}
                        >
                            Trades
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-surface rounded-premium border border-white/5 shadow-2xl flex flex-col overflow-hidden">
                
                {/* Search / Filter Bar */}
                <div className="px-10 py-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-surface/50">
                    <div className="relative w-full md:w-96 group">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Filter by ticket or date..." 
                            className="w-full bg-background/50 border border-white/5 rounded-instrument py-2.5 pl-12 pr-4 text-xs font-bold text-primary placeholder:text-muted focus:outline-none focus:border-accent/30 transition-all uppercase tracking-widest"
                        />
                    </div>
                    <div className="flex gap-4">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-background border border-white/5 rounded-instrument text-[10px] font-bold text-muted uppercase tracking-widest hover:text-primary hover:border-white/10 transition-all">
                            <Filter size={14} /> Filter
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-background border border-white/5 rounded-instrument text-[10px] font-bold text-muted uppercase tracking-widest hover:text-primary hover:border-white/10 transition-all">
                            <Download size={14} /> Export
                        </button>
                    </div>
                </div>

                {/* CONTENT */}
                {activeTab === 'Billing' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] text-muted uppercase tracking-[0.3em] bg-background/20 font-black">
                                    <th className="px-10 py-6">Order ID</th>
                                    <th className="px-10 py-6">Timestamp</th>
                                    <th className="px-10 py-6">Allocation</th>
                                    <th className="px-10 py-6 text-right">Value (INR)</th>
                                    <th className="px-10 py-6 text-center">Protocol</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {billingOrders.map((order, i) => (
                                    <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
                                        <td className="px-10 py-8 text-sm font-bold text-primary uppercase tracking-tight">#{order.id}</td>
                                        <td className="px-10 py-8 text-xs font-bold text-muted uppercase tracking-widest">{order.date}</td>
                                        <td className="px-10 py-8 text-xs font-black text-secondary uppercase tracking-widest">{order.program}</td>
                                        <td className="px-10 py-8 text-right font-black text-primary font-mono text-lg tracking-tighter">₹{order.price.toFixed(2)}</td>
                                        <td className="px-10 py-8 text-center">
                                            <button className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/5 border border-accent/10 text-accent hover:bg-accent hover:text-background transition-all mx-auto shadow-sm">
                                                <FileText size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] text-muted uppercase tracking-[0.3em] bg-background/20 font-black">
                                    <th className="px-10 py-6">Ticket</th>
                                    <th className="px-10 py-6">Instrument</th>
                                    <th className="px-10 py-6 text-center">Vector</th>
                                    <th className="px-10 py-6">SL / TP</th>
                                    <th className="px-10 py-6">Sync Time</th>
                                    <th className="px-10 py-6 text-right">Base Price</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {trades.map((trade, i) => (
                                    <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
                                        <td className="px-10 py-8 text-xs font-bold text-muted uppercase tracking-widest">{trade.ticket}</td>
                                        <td className="px-10 py-8 text-sm font-bold text-primary uppercase tracking-tight">{trade.symbol}</td>
                                        <td className="px-10 py-8 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-current shadow-sm ${trade.side === 'Buy' ? 'bg-emerald-400/5 text-emerald-400 border-emerald-400/20' : 'bg-red-400/5 text-red-400 border-red-400/20'}`}>
                                                {trade.side}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">S: {trade.sl}</span>
                                                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">T: {trade.tp}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-widest">
                                                <span className="text-primary">{trade.openTime.split(' ')[0]}</span>
                                                <span className="text-muted">{trade.openTime.split(' ')[1]} {trade.openTime.split(' ')[2]}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right font-black text-primary font-mono text-lg tracking-tighter">{trade.openPrice}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Footer */}
                <div className="px-10 py-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-surface/50">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Displaying Sector 01-05 / Total Nodes: 05</span>
                    <div className="flex items-center gap-3">
                        <button className="w-10 h-10 flex items-center justify-center rounded-instrument bg-background border border-white/5 text-muted hover:text-primary hover:border-white/10 transition-all font-bold">{'<'}</button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-instrument bg-accent text-background font-black shadow-soft text-xs">1</button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-instrument bg-background border border-white/5 text-muted hover:text-primary hover:border-white/10 transition-all font-bold">{'>'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
