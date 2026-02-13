import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, DollarSign, Activity, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
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

    if (loading) return <div className="p-10 text-center text-gray-500">Loading Dashboard...</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-black text-white mb-8">System Overview</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <StatCard label="Total Users" value={stats.totalUsers} change="+2 Today" icon={Users} color="blue" />
                <StatCard label="Active Challenges" value={stats.activeChallenges} change="Live" icon={Activity} color="lime" />
                <StatCard label="Total Revenue" value={`$${stats.revenue.toLocaleString()}`} change="Gross" icon={DollarSign} color="green" />
                <StatCard label="Failed Accounts" value={stats.failedAccounts} change="Total" icon={AlertTriangle} color="red" />
            </div>

            {/* Recent Activity */}
            <div className="bg-[#12121a] rounded-2xl border border-white/5 p-6">
                <h2 className="text-xl font-bold mb-4">Recent User Registrations</h2>
                <div className="space-y-4">
                    {stats.recentUsers && stats.recentUsers.length > 0 ? (
                        stats.recentUsers.map((user, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-2 bg-brand-lime rounded-full" />
                                    <span className="text-sm text-gray-300">
                                        New user: <span className="text-white font-mono">{user.email}</span>
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500 font-mono">
                                    {new Date(user.created_at).toLocaleString()}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-500 text-sm">No recent activity.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, change, icon: Icon, color }) {
    const colors = {
        lime: 'text-brand-lime',
        blue: 'text-brand-blue',
        red: 'text-red-500',
        green: 'text-emerald-400'
    };

    return (
        <div className="bg-[#12121a] p-6 rounded-2xl border border-white/5">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg bg-white/5 ${colors[color]}`}>
                    <Icon size={24} />
                </div>
                <span className={`text-xs font-bold ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                    {change}
                </span>
            </div>
            <div className="text-3xl font-black text-white mb-1">{value}</div>
            <div className="text-xs text-gray-500 uppercase tracking-widest">{label}</div>
        </div>
    );
}

