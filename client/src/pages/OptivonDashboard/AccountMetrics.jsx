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

import { useAuth } from '../../context/AuthContext';

export default function AccountMetrics() {
    const navigate = useNavigate();
    const { id } = useParams();

    const { token } = useAuth();
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetchMetrics();
    }, [id]);

    const fetchMetrics = async () => {
        try {
            const res = await fetch(`/api/trade/account/${id}/metrics`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const result = await res.json();
                setData(result);
            }
        } catch (err) {
            console.error("Failed to fetch metrics", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-secondary">Loading Metrics...</div>;
    if (!data) return <div className="p-10 text-center text-secondary">Account Not Found</div>;

    const { account, chartData, dailySummary } = data;

    // Objectives Calculation
    const profitTarget = account.size * 0.10;
    const currentProfit = (account.equity - account.size);
    const profitProgress = Math.min(Math.max((currentProfit / profitTarget) * 100, 0), 100);

    const dailyStart = account.daily_start_balance || account.balance;
    const dailyLossLimit = dailyStart * 0.05;
    const currentDailyLoss = dailyStart - account.equity;
    const dailyResult = currentDailyLoss > 0 ? -currentDailyLoss : 0; // Display as negative if loss
    const dailyProgress = Math.min(Math.max((currentDailyLoss / dailyLossLimit) * 100, 0), 100);

    const maxLossLimit = account.size * 0.10;
    const currentMaxLoss = account.size - account.equity;
    const maxLossProgress = Math.min(Math.max((currentMaxLoss / maxLossLimit) * 100, 0), 100);

    return (
        <div className="flex flex-col gap-6 h-full">
            {/* HEADER WITH BACK BUTTON */}
            <div className="flex items-center gap-4 mb-2">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition">
                    <ArrowLeft size={20} className="text-secondary" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-primary flex items-center gap-3">
                        Account #{account.id}
                        {account.status === 'failed' && <span className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded border border-red-500/20 uppercase font-bold">Breached</span>}
                        {account.status === 'active' && <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded border border-emerald-500/20 uppercase font-bold">Active</span>}
                    </h1>
                </div>
                <div className="ml-auto flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition"><Share2 size={16} /> Share</button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition"><Key size={16} /> Credentials</button>
                </div>
            </div>

            <div className="flex gap-6 h-full">

                {/* LEFT COLUMN: Charts & Stats */}
                <div className="flex-1 flex flex-col gap-6 min-w-0">

                    {/* EQUITY CHART */}
                    <div className="bg-surface p-6 rounded-xl shadow-sm border border-border h-80">
                        <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
                            <span className="text-accent">📈</span> Account Equity
                        </h3>
                        <ResponsiveContainer width="100%" height="90%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#cdfe05" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#cdfe05" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2a2a35" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} domain={['auto', 'auto']} />
                                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderRadius: '8px', border: '1px solid #2a2a35', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)', color: '#fff' }} />
                                <Area type="monotone" dataKey="equity" stroke="#cdfe05" fillOpacity={1} fill="url(#colorEquity)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* DAILY SUMMARY TABLE */}
                    <div className="bg-surface p-6 rounded-xl shadow-sm border border-border flex-1">
                        <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
                            <span className="text-accent">📅</span> Daily Summary
                        </h3>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border text-xs text-secondary uppercase">
                                    <th className="py-3 font-medium">Date</th>
                                    <th className="py-3 font-medium">Trades</th>
                                    <th className="py-3 font-medium">Result</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {dailySummary.length === 0 ? (
                                    <tr><td colSpan="3" className="py-4 text-center text-secondary text-sm">No trades yet.</td></tr>
                                ) : (
                                    dailySummary.map((Row, i) => (
                                        <tr key={i} className="text-sm">
                                            <td className="py-3 text-secondary font-medium font-mono">{Row.date}</td>
                                            <td className="py-3 text-primary font-mono">{Row.trades}</td>
                                            <td className={`py-3 font-bold font-mono ${Row.result >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                ${Row.result.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>

                {/* RIGHT COLUMN: Objectives & Info */}
                <div className="w-96 flex flex-col gap-6">

                    {/* ACCOUNT INFO */}
                    <div className="bg-surface p-6 rounded-xl shadow-sm border border-border space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-sm text-secondary">Program</span>
                            <span className="text-xs font-bold bg-blue-500/10 text-blue-500 px-2 py-1 rounded border border-blue-500/20">{account.type} - {account.phase === 1 ? 'Phase 1' : 'Funded'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-sm text-secondary">Account Size</span>
                            <span className="text-sm font-bold text-primary font-mono">${account.size.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-sm text-secondary">Equity</span>
                            <span className="text-sm font-bold text-primary font-mono">${account.equity.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-secondary">Start Date</span>
                            <span className="text-sm font-medium text-primary font-mono">{new Date(account.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    {/* PROGRAM OBJECTIVES (Purple Card) */}
                    <div className="bg-accent text-black p-6 rounded-xl shadow-lg shadow-accent/20 space-y-6">
                        <h3 className="font-bold flex items-center gap-2 text-lg">
                            🎯 Program Objectives
                        </h3>

                        {/* Profit Target */}
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="opacity-90 font-medium">Profit Target</span>
                                <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">Ongoing</span>
                            </div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xl font-black">${profitTarget.toLocaleString()}</span>
                                <span className="text-xs font-bold opacity-75">${currentProfit.toFixed(2)} ({Math.min((currentProfit / profitTarget) * 100, 100).toFixed(1)}%)</span>
                            </div>
                            <div className="h-2 bg-black/10 rounded-full overflow-hidden">
                                <div className="h-full bg-black/80" style={{ width: `${profitProgress}%` }} />
                            </div>
                        </div>

                        {/* Daily Loss */}
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="opacity-90 font-medium">Daily Loss</span>
                                {currentDailyLoss > dailyLossLimit ? (
                                    <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold shadow-sm">Breached</span>
                                ) : (
                                    <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">Active</span>
                                )}
                            </div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xl font-black">${dailyLossLimit.toLocaleString()}</span>
                                <span className="text-xs font-bold opacity-75">-${currentDailyLoss.toFixed(2)}</span>
                            </div>
                            <div className="h-2 bg-black/10 rounded-full overflow-hidden">
                                <div className={`h-full ${currentDailyLoss > dailyLossLimit ? 'bg-red-500' : 'bg-red-400'}`} style={{ width: `${dailyProgress}%` }} />
                            </div>
                            <p className="text-xs mt-1 opacity-70 font-mono">Limit: ${(dailyStart - dailyLossLimit).toLocaleString()}</p>
                        </div>

                        {/* Max Loss */}
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="opacity-90 font-medium">Max Loss</span>
                                {currentMaxLoss > maxLossLimit ? (
                                    <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold shadow-sm">Breached</span>
                                ) : (
                                    <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">Ongoing</span>
                                )}
                            </div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xl font-black">${maxLossLimit.toLocaleString()}</span>
                                <span className="text-xs font-bold opacity-75">-${currentMaxLoss.toFixed(2)}</span>
                            </div>
                            <div className="h-2 bg-black/10 rounded-full overflow-hidden">
                                <div className={`h-full ${currentMaxLoss > maxLossLimit ? 'bg-red-500' : 'bg-orange-400'}`} style={{ width: `${maxLossProgress}%` }} />
                            </div>
                            <p className="text-xs mt-1 opacity-70 font-mono">Limit: ${(account.size - maxLossLimit).toLocaleString()}</p>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

