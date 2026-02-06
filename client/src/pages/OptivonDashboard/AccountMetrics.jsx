import React from 'react';
import { ArrowLeft, Share2, Key } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

export default function AccountMetrics() {
    const navigate = useNavigate();
    const { id } = useParams();

    // Mock Data for Chart
    const chartData = [
        { date: '23-01-2026', equity: 4926, balance: 4926 },
        { date: '24-01-2026', equity: 4923, balance: 4923 },
        { date: '25-01-2026', equity: 4923, balance: 4923 },
        { date: '26-01-2026', equity: 5000, balance: 5000 },
        { date: '27-01-2026', equity: 4809, balance: 4809 },
        { date: '28-01-2026', equity: 4966, balance: 4966 },
        { date: '29-01-2026', equity: 5127, balance: 5127 },
        { date: '30-01-2026', equity: 4926, balance: 4926 },
    ];

    const dailySummary = [
        { date: '30-01-2026', balance: 4926.53, equity: 4926.53, result: -201.01 },
        { date: '29-01-2026', balance: 5127.54, equity: 5127.54, result: 161.51 },
        { date: '28-01-2026', balance: 4966.03, equity: 4966.03, result: 156.74 },
        { date: '27-01-2026', balance: 4809.29, equity: 4809.29, result: -191.30 },
    ];

    return (
        <div className="flex flex-col gap-6 h-full">
            {/* HEADER WITH BACK BUTTON */}
            <div className="flex items-center gap-4 mb-2">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
                    <ArrowLeft size={20} className="text-gray-500" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-optivon-primary">Account #{id || '5005622'} <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded ml-2 uppercase font-bold">Breached</span></h1>
                </div>
                <div className="ml-auto flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-optivon-primary text-white rounded-lg hover:bg-optivon-primary-hover transition"><Share2 size={16} /> Share</button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-optivon-primary text-white rounded-lg hover:bg-optivon-primary-hover transition"><Key size={16} /> Credentials</button>
                </div>
            </div>

            <div className="flex gap-6 h-full">

                {/* LEFT COLUMN: Charts & Stats */}
                <div className="flex-1 flex flex-col gap-6 min-w-0">

                    {/* EQUITY CHART */}
                    <div className="bg-white dark:bg-optivon-surface p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 h-80">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                            <span className="text-optivon-primary">📈</span> Account Equity
                        </h3>
                        <ResponsiveContainer width="100%" height="90%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} domain={['auto', 'auto']} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Area type="monotone" dataKey="equity" stroke="#8884d8" fillOpacity={1} fill="url(#colorEquity)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* DAILY SUMMARY TABLE */}
                    <div className="bg-white dark:bg-optivon-surface p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex-1">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                            <span className="text-optivon-primary">📅</span> Daily Summary
                        </h3>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-800 text-xs text-gray-500 uppercase">
                                    <th className="py-3 font-medium">Date</th>
                                    <th className="py-3 font-medium">Balance</th>
                                    <th className="py-3 font-medium">Equity</th>
                                    <th className="py-3 font-medium">Result</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {dailySummary.map((Row, i) => (
                                    <tr key={i} className="text-sm">
                                        <td className="py-3 text-gray-600 dark:text-gray-300 font-medium">{Row.date}</td>
                                        <td className="py-3 text-gray-900 dark:text-white">${Row.balance.toFixed(2)}</td>
                                        <td className="py-3 text-gray-900 dark:text-white">${Row.equity.toFixed(2)}</td>
                                        <td className={`py-3 font-bold ${Row.result >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            ${Row.result.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>

                {/* RIGHT COLUMN: Objectives & Info */}
                <div className="w-96 flex flex-col gap-6">

                    {/* ACCOUNT INFO */}
                    <div className="bg-white dark:bg-optivon-surface p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800">
                            <span className="text-sm text-gray-500">Program</span>
                            <span className="text-sm font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded">MT5 - 1 Step - Phase 1 - 5k</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800">
                            <span className="text-sm text-gray-500">Account Size</span>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">$4,926.53</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800">
                            <span className="text-sm text-gray-500">Platform</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">MetaTrader5</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-gray-500">Start Date</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">23/01/2026</span>
                        </div>
                    </div>

                    {/* PROGRAM OBJECTIVES (Purple Card) */}
                    <div className="bg-optivon-primary text-white p-6 rounded-xl shadow-lg shadow-purple-500/20 space-y-6">
                        <h3 className="font-bold flex items-center gap-2 text-lg">
                            🎯 Program Objectives
                        </h3>

                        {/* Profit Target */}
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="opacity-90">Profit Target</span>
                                <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">Ongoing</span>
                            </div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xl font-bold">$500</span>
                                <span className="text-xs opacity-75">$0 (0.00%)</span>
                            </div>
                            <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                                <div className="h-full bg-optivon-accent w-0" />
                            </div>
                        </div>

                        {/* Daily Loss */}
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="opacity-90">Daily Loss</span>
                                <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold shadow-sm">Breached</span>
                            </div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xl font-bold">$200</span>
                                <span className="text-xs opacity-75">-$201.01 (100.5%)</span>
                            </div>
                            <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                                <div className="h-full bg-red-400 w-full" />
                            </div>
                            <p className="text-xs mt-1 opacity-70">Daily Loss Limit: $4,927.54</p>
                        </div>

                        {/* Max Loss */}
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="opacity-90">Max Loss</span>
                                <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">Ongoing</span>
                            </div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xl font-bold">$300</span>
                                <span className="text-xs opacity-75">$73.47 (24.5%)</span>
                            </div>
                            <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-400 w-1/4" />
                            </div>
                            <p className="text-xs mt-1 opacity-70">Max Loss Limit: $4,700</p>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
