import React from 'react';
import { Users, DollarSign, Activity, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-black text-white mb-8">System Overview</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <StatCard label="Total Users" value="1,245" change="+12%" icon={Users} color="blue" />
                <StatCard label="Active Challenges" value="342" change="+5%" icon={Activity} color="lime" />
                <StatCard label="Revenue (MTD)" value="₹45.2L" change="+18%" icon={DollarSign} color="green" />
                <StatCard label="Flagged Accounts" value="12" change="-2%" icon={AlertTriangle} color="red" />
            </div>

            {/* Recent Activity Placeholder */}
            <div className="bg-[#12121a] rounded-2xl border border-white/5 p-6">
                <h2 className="text-xl font-bold mb-4">Recent System Activity</h2>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-2 h-2 bg-brand-lime rounded-full" />
                                <span className="text-sm text-gray-300">New user registration: <span className="text-white font-mono">user_{1000 + i}@optivon.com</span></span>
                            </div>
                            <span className="text-xs text-gray-500 font-mono">2 mins ago</span>
                        </div>
                    ))}
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
