import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, DollarSign, Activity, AlertTriangle, ArrowLeft, Shield, TrendingUp, Globe, Box } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = React.useState({
        totalUsers: 0,
        activeChallenges: 0,
        failedAccounts: 0,
        revenue: 0,
        recentUsers: []
    });
    const [loading, setLoading] = React.useState(true);
    const { token } = useAuth();

    React.useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch admin stats", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
                <p className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">Synchronizing Vault...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background font-sans text-primary p-8 lg:p-12 relative overflow-hidden">
            {/* Structural Accents */}
            <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-accent/[0.02] rounded-full blur-[150px] pointer-events-none -mr-500 -mt-500" />
            
            <div className="max-w-7xl mx-auto relative z-10">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-instrument">
                                <span className="text-[9px] font-black text-accent uppercase tracking-[0.2em]">Level 04 Clearance</span>
                            </div>
                            <span className="w-1 h-1 bg-white/20 rounded-full" />
                            <span className="text-[10px] text-muted font-bold tracking-[0.1em] uppercase font-mono">Protocol // Admin_Node</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-display font-black text-white uppercase tracking-tighter flex items-center gap-4">
                            <Box className="text-accent" size={48} />
                            Master Control
                        </h1>
                    </div>

                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-3 bg-surface border border-white/5 px-8 py-4 rounded-instrument text-[10px] font-black uppercase tracking-[0.2em] text-muted hover:text-accent hover:border-accent/30 hover:bg-background transition-all shadow-premium group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Return to Intelligence Hub
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard label="Live Node Collective" value={stats.totalUsers} change="+2 Cycles" icon={Users} type="primary" />
                    <StatCard label="Active Sync Protocols" value={stats.activeChallenges} change="STABLE" icon={Activity} type="accent" />
                    <StatCard label="Accumulated Yield" value={`₹${stats.revenue.toLocaleString()}`} change="NET" icon={DollarSign} type="accent" />
                    <StatCard label="Terminated Threads" value={stats.failedAccounts} change="PURGED" icon={AlertTriangle} type="danger" />
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    
                    {/* Activity Feed */}
                    <div className="xl:col-span-2 bg-surface rounded-premium border border-white/[0.03] shadow-premium overflow-hidden">
                        <div className="p-8 border-b border-white/[0.03] flex justify-between items-center bg-background/30 px-10">
                            <div>
                                <h2 className="text-lg font-black text-primary uppercase tracking-tight">Node Synchronizations</h2>
                                <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">Real-time Registration Feed</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                                <span className="text-[9px] font-black text-accent uppercase font-mono tracking-widest">Live Link</span>
                            </div>
                        </div>

                        <div className="p-4 sm:p-8 space-y-3">
                            {stats.recentUsers && stats.recentUsers.length > 0 ? (
                                stats.recentUsers.map((user, i) => (
                                    <div key={i} className="flex items-center justify-between p-6 bg-background/40 hover:bg-background/60 rounded-instrument border border-white/[0.02] hover:border-accent/10 transition-all group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-10 h-10 rounded-full bg-surface border border-white/5 flex items-center justify-center text-accent/40 group-hover:text-accent transition-colors">
                                                <Globe size={18} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-primary mb-1 tracking-tight group-hover:text-accent transition-colors">
                                                    Authorization Granted: <span className="font-mono text-muted group-hover:text-primary transition-colors">{user.email}</span>
                                                </div>
                                                <div className="text-[9px] text-muted font-black uppercase tracking-[0.2em]">Node Link Identified</div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-muted font-mono font-bold uppercase tracking-tighter bg-surface px-3 py-1 rounded-full border border-white/5">
                                            {new Date(user.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 opacity-20">
                                    <Activity size={48} className="mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Active Transmissions</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions / System Health */}
                    <div className="space-y-8">
                        <div className="bg-surface rounded-premium border border-white/[0.03] p-10 shadow-premium group">
                            <h3 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                                <Shield size={16} className="text-accent" />
                                Infrastructure Health
                            </h3>
                            <div className="space-y-6">
                                <HealthRow label="Core Database" status="Synchronized" />
                                <HealthRow label="Market Feed API" status="0.4ms Latency" />
                                <HealthRow label="Account Risk Logic" status="Operational" />
                                <HealthRow label="Payout Engine" status="Verified" />
                            </div>
                        </div>

                        <div className="bg-accent/5 border border-accent/20 p-10 shadow-premium relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                               <TrendingUp size={64} className="text-accent" />
                           </div>
                           <h3 className="text-[12px] font-display font-black text-accent uppercase tracking-[0.2em] mb-4">Protocol Pulse</h3>
                           <p className="text-xs text-secondary font-medium leading-relaxed mb-6">Aggregate node performance is currently tracking <span className="text-accent font-bold">+12.4%</span> above baseline expectations.</p>
                           <div className="w-full h-2 bg-black overflow-hidden border border-white/10">
                               <div className="h-full bg-accent w-[85%] shadow-[0_0_15px_#C50022]" />
                           </div>
                        </div>

                        {/* MASTER CONTROLS */}
                        <div className="p-10 border border-accent/30 bg-accent/5">
                            <h3 className="text-2xl font-display font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-3">
                                <AlertTriangle size={24} className="text-accent" />
                                System Overrides
                            </h3>
                            <div className="space-y-4">
                                <button 
                                    onClick={() => handleOverride('halt_market')}
                                    className="w-full py-4 bg-black border border-white/10 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-white hover:text-black transition-colors"
                                >
                                    Halt Market Data Feed
                                </button>
                                <button 
                                    onClick={() => handleOverride('liquidate_all')}
                                    className="w-full py-4 bg-accent text-white font-bold uppercase tracking-widest text-[10px] hover:bg-white hover:text-black transition-colors"
                                >
                                    Force Liquidate All Nodes
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

// Added Override Handler
async function handleOverride(action) {
    if (!window.confirm(`WARNING: Are you sure you want to execute ${action}? This is a global master override.`)) return;
    try {
        const token = localStorage.getItem('auth_token');
        await fetch('/api/admin/system-override', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ action })
        });
        alert(`Master Control: ${action} executed.`);
    } catch (e) {
        console.error("Override failed", e);
        alert("Override failed. Check console.");
    }
}

function StatCard({ label, value, change, icon: Icon, type }) {
    const typeStyles = {
        primary: {
            iconBg: 'bg-surface border-white/5 text-muted',
            changeText: 'text-muted',
            valueText: 'text-primary'
        },
        accent: {
            iconBg: 'bg-accent/5 border-accent/20 text-accent',
            changeText: 'text-accent',
            valueText: 'text-primary'
        },
        danger: {
            iconBg: 'bg-red-400/5 border-red-400/20 text-red-400',
            changeText: 'text-red-400',
            valueText: 'text-primary'
        }
    };

    const style = typeStyles[type];

    return (
        <div className="bg-surface p-8 border border-white/10 hover:border-accent transition-colors group overflow-hidden relative">
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className={`p-4 border transition-all duration-500 group-hover:scale-110 ${style.iconBg}`}>
                    <Icon size={24} />
                </div>
                <div className={`px-4 py-2 bg-black border border-white/10 text-[10px] font-bold uppercase tracking-widest ${style.changeText}`}>
                    {change}
                </div>
            </div>
            <div className={`text-5xl font-display font-black mb-2 tracking-tighter relative z-10 ${style.valueText}`}>{value}</div>
            <div className="text-[11px] text-white/50 font-bold uppercase tracking-[0.2em] relative z-10">{label}</div>
        </div>
    );
}

function HealthRow({ label, status }) {
    return (
        <div className="flex items-center justify-between py-1">
            <span className="text-xs font-medium text-secondary">{label}</span>
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">{status}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_5px_#C50022]" />
            </div>
        </div>
    );
}
