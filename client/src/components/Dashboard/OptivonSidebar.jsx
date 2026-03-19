import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { NavLink } from 'react-router-dom';
import {
    CreditCard,
    LayoutDashboard,
    Award,
    Trophy,
    FileText,
    History,
    Rss,
    Users,
    Calendar,
    Monitor,
    Download,
    HelpCircle,
    Settings,
    Shield
} from 'lucide-react';

export default function OptivonSidebar() {
    const { user } = useAuth();

    const navGroups = [
        {
            label: null,
            items: [
                { name: 'Accounts Overview', path: '/dashboard', icon: LayoutDashboard },
                { name: 'Withdrawals', path: '/dashboard/withdrawals', icon: CreditCard },
                { name: 'Certificates', path: '/dashboard/certificates', icon: Award },
                { name: 'Competitions', path: '/dashboard/competitions', icon: Trophy },
                { name: 'Contracts', path: '/dashboard/contracts', icon: FileText },
                { name: 'Order History', path: '/dashboard/orders', icon: History },
            ]
        },
        {
            label: 'Network Cluster',
            items: [
                { name: 'Affiliate Portal', path: '/dashboard/affiliates', icon: Users },
            ]
        },
        {
            label: 'System Hub',
            items: [
                { name: 'Resource Node', path: '/dashboard/help', icon: HelpCircle },
                { name: 'Configuration', path: '/dashboard/settings', icon: Settings },
            ]
        }
    ];

    if (user?.email === 'deepaknairm10@gmail.com' || user?.isAdmin) {
        navGroups.push({
            label: 'Administration',
            items: [
                { name: 'Secured Vault', path: '/admin', icon: Monitor }
            ]
        });
    }

    return (
        <div className="w-64 h-full bg-surface flex flex-col text-primary flex-shrink-0 border-r border-white/5 font-sans relative z-[60]">
            {/* Logo */}
            <div className="h-20 flex items-center px-10 border-b border-white/[0.03]">
                <div className="flex flex-col gap-0.5">
                    <div className="font-bold text-xl tracking-[-0.05em] text-primary uppercase text-shadow-glow">OPTIVON</div>
                    <div className="text-[8px] font-black uppercase tracking-[0.4em] text-accent leading-none">Institutional</div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto pt-10 pb-6 hide-scrollbar">
                {navGroups.map((group, idx) => (
                    <div key={idx} className="mb-12">
                        {group.label && (
                            <h3 className="px-10 mb-5 text-[9px] font-black text-muted uppercase tracking-[0.4em]">
                                {group.label}
                            </h3>
                        )}
                        <div className="space-y-1.5 px-6">
                            {group.items.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    end={item.path === '/dashboard'}
                                    className={({ isActive }) => `
                                        flex items-center gap-4 px-5 py-3.5 rounded-instrument text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-500 group relative
                                        ${isActive
                                            ? 'bg-accent text-background shadow-premium'
                                            : 'text-secondary hover:text-primary hover:bg-white/[0.02]'}
                                    `}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <item.icon size={16} className={`transition-colors duration-500 ${isActive ? 'text-background' : 'text-accent/40 group-hover:text-accent'}`} />
                                            <span>{item.name}</span>
                                            {isActive && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-background rounded-r-full" />
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Server Status */}
            <div className="p-8">
                <div className="bg-background/30 rounded-premium p-6 border border-white/[0.03] shadow-inner relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-accent/20" />
                    <div className="text-[9px] font-black text-muted uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                        <Shield size={10} className="text-accent" />
                        Security Phase
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_#C50022]" />
                            <span className="font-mono text-[10px] text-primary font-bold">STABLE // SYNC</span>
                        </div>
                        <span className="text-[9px] font-black text-accent/60 uppercase">Node 01</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
