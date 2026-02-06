import React from 'react';
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
    Settings
} from 'lucide-react';

export default function OptivonSidebar() {
    const navGroups = [
        {
            label: null, // Main group has no label
            items: [
                { name: 'Accounts Overview', path: '/dashboard', icon: LayoutDashboard }, // Maps to "/" or "/dashboard"
                { name: 'Withdrawals', path: '/dashboard/withdrawals', icon: CreditCard },
                { name: 'Certificates', path: '/dashboard/certificates', icon: Award },
                { name: 'Competitions', path: '/dashboard/competitions', icon: Trophy },
                { name: 'Contracts', path: '/dashboard/contracts', icon: FileText },
                { name: 'Order History', path: '/dashboard/orders', icon: History },
            ]
        },
        {
            label: 'APPS',
            items: [
                { name: 'Affiliates', path: '/dashboard/affiliates', icon: Users },
            ]
        },
        {
            label: 'OTHERS',
            items: [
                { name: 'Help Center', path: '/dashboard/help', icon: HelpCircle },
                { name: 'Settings', path: '/dashboard/settings', icon: Settings },
            ]
        }
    ];

    return (
        <div className="w-64 h-full bg-brand-dark flex flex-col text-white flex-shrink-0 border-r border-white/5">
            {/* HEADER LOGO */}
            <div className="h-20 flex items-center px-6 border-b border-white/5">
                <h1 className="text-2xl font-display font-black tracking-tighter text-white">
                    OPTIVON <span className="text-brand-lime">.</span>
                </h1>
            </div>

            {/* NAV ITEMS */}
            <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
                {navGroups.map((group, idx) => (
                    <div key={idx} className="mb-8">
                        {group.label && (
                            <h3 className="px-6 mb-3 text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">
                                {group.label}
                            </h3>
                        )}
                        <div className="space-y-1 px-4">
                            {group.items.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    end={item.path === '/dashboard'} // Exact match for root
                                    className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-300 font-medium
                    ${isActive
                                            ? 'bg-brand-lime text-brand-dark font-bold shadow-[0_0_15px_rgba(245,255,171,0.3)]'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'}
                  `}
                                >
                                    <item.icon size={18} className={({ isActive }) => isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
                                    <span>{item.name}</span>
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4">
                <div className="bg-[#1F1F35] rounded-xl p-4 border border-white/5">
                    <p className="text-xs text-gray-400 mb-2">Server Time</p>
                    <p className="font-mono text-sm text-brand-lime font-bold">14:32:01 UTC</p>
                </div>
            </div>
        </div>
    );
}
