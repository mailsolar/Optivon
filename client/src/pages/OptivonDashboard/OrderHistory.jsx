import React, { useState } from 'react';
import { FileText, ArrowRight } from 'lucide-react';
import TabSwitcher from '../../components/Dashboard/TabSwitcher';

export default function OrderHistory() {
    const [activeTab, setActiveTab] = useState('Billing');

    // Billing Data (First screenshot)
    const billingOrders = [
        { id: '740518', date: '2026-01-23', price: 28.00, program: 'MT5 - 1 Step - Phase 1 - 5k' },
        { id: '716692', date: '2026-01-14', price: 28.00, program: 'MT5 - 1 Step - Phase 1 - 5k' },
        { id: '567120', date: '2025-11-19', price: 28.00, program: 'MT5 - 1 Step - Phase 1 - 5k' },
        { id: '522841', date: '2025-10-28', price: 28.00, program: 'MT5 - 1 Step - Phase 1 - 5k' },
        { id: '158004', date: '2025-03-13', price: 26.25, program: 'MT5 - 2 Step - Phase 1 - 5k' },
    ];

    // Trades Data (Second Batch Screenshot)
    const trades = [
        { ticket: '705781', symbol: 'USDJPY.pi', side: 'Sell', sl: '154.102', tp: '153.754', openTime: '30/01/2026 09:39:41 AM', openPrice: '154.051', closeTime: '30/01/2026 09:45:33 AM' },
        { ticket: '690467', symbol: 'XAUUSD.pi', side: 'Sell', sl: '5195.98', tp: '5101.44', openTime: '30/01/2026 06:06:14 AM', openPrice: '5186.65', closeTime: '30/01/2026 06:10:07 AM' },
        { ticket: '689787', symbol: 'XAUUSD.pi', side: 'Sell', sl: '5197.21', tp: '5113.73', openTime: '30/01/2026 05:59:29 AM', openPrice: '5183.07', closeTime: '30/01/2026 06:01:52 AM' },
        { ticket: '689655', symbol: 'XAUUSD.pi', side: 'Sell', sl: '0', tp: '0', openTime: '30/01/2026 05:59:29 AM', openPrice: '5182.98', closeTime: '30/01/2026 06:00:40 AM' },
        { ticket: '688293', symbol: 'XAUUSD.pi', side: 'Sell', sl: '5232.6', tp: '5156.24', openTime: '30/01/2026 05:34:42 AM', openPrice: '5214.83', closeTime: '30/01/2026 05:37:30 AM' },
    ];

    return (
        <div className="flex flex-col h-full gap-6">

            {/* SWITCHER (Interpretation of user's mixed screenshots) */}
            <TabSwitcher
                tabs={['Billing', 'Trades']}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <div className="bg-[#1F1F35] rounded-xl shadow-sm border border-white/5 flex flex-col flex-1 min-h-0">

                {/* CONTENT */}
                {activeTab === 'Billing' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 text-xs text-gray-500 uppercase tracking-wider">
                                    <th className="px-6 py-4 font-bold">Order Number</th>
                                    <th className="px-6 py-4 font-bold">Created At</th>
                                    <th className="px-6 py-4 font-bold">Price</th>
                                    <th className="px-6 py-4 font-bold">Program</th>
                                    <th className="px-6 py-4 font-bold text-center">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {billingOrders.map((order, i) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-white">{order.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-400">{order.date}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-white">${order.price.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-400">{order.program}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-lime/10 text-brand-lime hover:bg-brand-lime hover:text-brand-dark transition-colors mx-auto">
                                                <FileText size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        {/* TRADES HEADER ACTIONS */}
                        <div className="flex items-center justify-end gap-2 p-4 border-b border-white/5">
                            <button className="px-4 py-1.5 rounded-lg border border-white/10 text-sm font-medium text-gray-400 hover:bg-white/5 bg-transparent">Open Trades</button>
                            <button className="px-4 py-1.5 rounded-lg bg-brand-lime text-brand-dark text-sm font-bold shadow-md">Closed Trades</button>
                            <button className="px-4 py-1.5 rounded-lg border border-white/10 text-sm font-medium text-gray-400 hover:bg-white/5 bg-transparent flex items-center gap-2">All <ArrowRight size={14} className="rotate-90" /></button>
                        </div>

                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 text-xs text-gray-500 uppercase tracking-wider">
                                    <th className="px-6 py-4 font-bold">Ticket #</th>
                                    <th className="px-6 py-4 font-bold">Symbol</th>
                                    <th className="px-6 py-4 font-bold text-center">Side</th>
                                    <th className="px-6 py-4 font-bold">SL</th>
                                    <th className="px-6 py-4 font-bold">TP</th>
                                    <th className="px-6 py-4 font-bold">Open Time</th>
                                    <th className="px-6 py-4 font-bold">Open Price</th>
                                    <th className="px-6 py-4 font-bold">Close Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {trades.map((trade, i) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-400">{trade.ticket}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-white">{trade.symbol}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold rounded shadow-sm">{trade.side}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{trade.sl}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{trade.tp}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="flex flex-col text-xs">
                                                <span className="font-medium text-gray-300">{trade.openTime.split(' ')[0]}</span>
                                                <span className="text-gray-500">{trade.openTime.split(' ')[1]}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-white">{trade.openPrice}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="flex flex-col text-xs">
                                                <span className="font-medium text-gray-300">{trade.closeTime.split(' ')[0]}</span>
                                                <span className="text-gray-500">{trade.closeTime.split(' ')[1]}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Footer */}
                <div className="p-4 border-t border-white/5 flex justify-between items-center text-sm text-gray-500 mt-auto">
                    <span>Showing 1 to 5 of 5 entries</span>
                    <div className="flex gap-2">
                        <button className="w-8 h-8 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-gray-400 transition">{'<'}</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded bg-brand-lime text-brand-dark font-bold shadow-md">1</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-gray-400 transition">{'>'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

