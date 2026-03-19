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

    if (loading) return <div className="p-20 text-center text-muted font-bold text-[10px] uppercase tracking-widest animate-pulse">Syncing Metrics...</div>;
    if (!data) return <div className="p-20 text-center text-muted font-medium text-sm">Account Link Severed</div>;

    const { account, chartData, dailySummary } = data;

    // Objectives Calculation
    const profitTarget = account.size * 0.10;
    const currentProfit = (account.equity - account.size);
    const profitProgress = Math.min(Math.max((currentProfit / profitTarget) * 100, 0), 100);

    const dailyStart = account.daily_start_balance || account.balance;
    const dailyLossLimit = dailyStart * 0.05;
    const currentDailyLoss = dailyStart - account.equity;
    const dailyResult = currentDailyLoss > 0 ? -currentDailyLoss : 0; 
    const dailyProgress = Math.min(Math.max((currentDailyLoss / dailyLossLimit) * 100, 0), 100);

    const maxLossLimit = account.size * 0.10;
    const currentMaxLoss = account.size - account.equity;
    const maxLossProgress = Math.min(Math.max((currentMaxLoss / maxLossLimit) * 100, 0), 100);

    return (
        <div className="flex flex-col gap-10 h-full font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate(-1)} className="p-4 bg-surface border border-white/5 rounded-full hover:border-accent/50 transition-all group">
                        <ArrowLeft size={20} className="text-secondary group-hover:text-accent transition-colors" />
                    </button>
                    <div>
                        <div className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] mb-1">Performance Matrix</div>
                        <h1 className="text-3xl font-bold text-primary uppercase tracking-tight flex items-center gap-4">
                            Node #{account.id.toString().padStart(6, '0')}
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border
                                ${account.status === 'active' ? 'bg-accent/5 text-accent border-accent/20' : 'bg-red-400/5 text-red-400 border-red-400/20'}`}>
                                {account.status}
                            </span>
                        </h1>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-3 px-6 py-3 bg-surface border border-white/5 text-primary rounded-instrument font-bold text-[10px] uppercase tracking-[0.2em] hover:border-accent/30 transition-all"><Share2 size={16} className="text-accent" /> Share Matrix</button>
                    <button className="flex items-center gap-3 px-6 py-3 bg-accent text-background rounded-instrument font-bold text-[10px] uppercase tracking-[0.2em] shadow-soft hover:bg-primary transition-all"><Key size={16} /> Access Keys</button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">

                {/* Left: Charts & History */}
                <div className="xl:col-span-8 flex flex-col gap-10 min-w-0">

                    {/* Chart Card */}
                    <div className="bg-surface p-10 rounded-premium border border-white/5 shadow-2xl h-[450px] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />
                        <div className="flex justify-between items-center mb-10 relative z-10">
                            <h3 className="text-[10px] font-bold text-muted uppercase tracking-[0.4em]">Equity Projection</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-accent" />
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Live Feed</span>
                            </div>
                        </div>
                        <div className="h-[300px] w-full relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#C50022" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#C50022" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#646466', fontWeight: 700 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#646466', fontWeight: 700 }} domain={['auto', 'auto']} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1C1C1E', borderRadius: '12px', border: '1px border-white/10', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', padding: '12px' }}
                                        itemStyle={{ color: '#C5A059', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase' }}
                                        labelStyle={{ color: '#F5F5F7', marginBottom: '4px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}
                                    />
                                    <Area type="monotone" dataKey="equity" stroke="#C5A059" fillOpacity={1} fill="url(#colorEquity)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Table Card */}
                    <div className="bg-surface rounded-premium border border-white/5 shadow-2xl overflow-hidden flex flex-col">
                        <div className="px-10 py-8 border-b border-white/5 bg-surface/50 backdrop-blur-md">
                            <h3 className="text-[10px] font-bold text-muted uppercase tracking-[0.4em]">Temporal Summary</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] text-muted uppercase tracking-[0.3em] bg-background/20">
                                        <th className="px-10 py-6 font-bold">Log Date</th>
                                        <th className="px-10 py-6 font-bold text-center">Batch Vol</th>
                                        <th className="px-10 py-6 text-right font-bold">Net Result</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.03]">
                                    {dailySummary.length === 0 ? (
                                        <tr><td colSpan="3" className="px-10 py-10 text-center text-muted font-medium text-sm">No synchronized data available.</td></tr>
                                    ) : (
                                        dailySummary.map((Row, i) => (
                                            <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                                                <td className="px-10 py-6 text-sm font-bold text-primary uppercase tracking-tight">{Row.date}</td>
                                                <td className="px-10 py-6 text-center text-secondary font-mono text-xs">{Row.trades} Units</td>
                                                <td className={`px-10 py-6 text-right font-bold font-mono text-lg tracking-tighter ${Row.result >= 0 ? 'text-accent' : 'text-red-400'}`}>
                                                    {Row.result >= 0 ? '+' : ''}{Row.result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                {/* Right: Objectives */}
                <div className="xl:col-span-4 flex flex-col gap-10">

                    {/* Info Card */}
                    <div className="bg-surface p-10 rounded-premium border border-white/5 shadow-2xl space-y-8">
                        <div className="flex flex-col gap-1">
                            <div className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Module Configuration</div>
                        </div>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center py-4 border-b border-white/5">
                                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Protocol Type</span>
                                <span className="text-[10px] font-bold bg-accent/5 text-accent px-3 py-1 rounded-full border border-accent/20 uppercase tracking-widest">{account.type}</span>
                            </div>
                            <div className="flex justify-between items-center py-4 border-b border-white/5">
                                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Base Allocation</span>
                                <span className="text-xl font-bold text-primary tracking-tighter">₹{account.size.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-4 border-b border-white/5">
                                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Current Equity</span>
                                <span className="text-xl font-bold text-primary tracking-tighter">₹{account.equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between items-center py-4">
                                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Sync Inception</span>
                                <span className="text-sm font-bold text-primary uppercase tracking-tight">{new Date(account.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Objectives Card */}
                    <div className="bg-surface p-10 rounded-premium border border-accent/30 shadow-2xl space-y-10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-accent" />
                        
                        <div className="flex flex-col gap-1">
                            <div className="text-[10px] font-bold text-accent uppercase tracking-[0.4em]">Validation Status</div>
                            <h3 className="text-xl font-bold text-primary uppercase tracking-tight">Active Objectives</h3>
                        </div>

                        {/* Profit Target */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Growth Threshold</span>
                                    <span className="text-2xl font-bold text-primary tracking-tighter">₹{profitTarget.toLocaleString()}</span>
                                </div>
                                <div className="text-right">
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest border ${currentProfit >= profitTarget ? 'bg-accent text-background border-accent' : 'bg-white/5 text-muted border-white/10'}`}>
                                        {currentProfit >= profitTarget ? 'Cleared' : 'Syncing'}
                                    </span>
                                    <div className="text-[10px] font-bold text-accent mt-1 uppercase tracking-widest">+{Math.min((currentProfit / profitTarget) * 100, 100).toFixed(1)}%</div>
                                </div>
                            </div>
                            <div className="h-1.5 bg-background rounded-full overflow-hidden border border-white/5">
                                <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${profitProgress}%` }} />
                            </div>
                        </div>

                        {/* Daily Loss */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Daily Safety Limit</span>
                                    <span className="text-2xl font-bold text-primary tracking-tighter">₹{dailyLossLimit.toLocaleString()}</span>
                                </div>
                                <div className="text-right">
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest border ${currentDailyLoss > dailyLossLimit ? 'bg-red-400 text-background border-red-400' : 'bg-accent/10 text-accent border-accent/20'}`}>
                                        {currentDailyLoss > dailyLossLimit ? 'Breach' : 'Secure'}
                                    </span>
                                    <div className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-widest">-{dailyProgress.toFixed(1)}%</div>
                                </div>
                            </div>
                            <div className="h-1.5 bg-background rounded-full overflow-hidden border border-white/5">
                                <div className={`h-full transition-all duration-1000 ${currentDailyLoss > dailyLossLimit ? 'bg-red-500' : 'bg-red-400/30'}`} style={{ width: `${dailyProgress}%` }} />
                            </div>
                        </div>

                        {/* Max Loss */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Absolute Safety Floor</span>
                                    <span className="text-2xl font-bold text-primary tracking-tighter">₹{maxLossLimit.toLocaleString()}</span>
                                </div>
                                <div className="text-right">
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest border ${currentMaxLoss > maxLossLimit ? 'bg-red-400 text-background border-red-400' : 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'}`}>
                                        {currentMaxLoss > maxLossLimit ? 'Breach' : 'Nominal'}
                                    </span>
                                    <div className="text-[10px] font-bold text-muted mt-1 uppercase tracking-widest">{maxLossProgress.toFixed(1)}% Usage</div>
                                </div>
                            </div>
                            <div className="h-1.5 bg-background rounded-full overflow-hidden border border-white/5">
                                <div className={`h-full transition-all duration-1000 ${currentMaxLoss > maxLossLimit ? 'bg-red-500' : 'bg-white/10'}`} style={{ width: `${maxLossProgress}%` }} />
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
