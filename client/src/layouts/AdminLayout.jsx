import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="flex h-screen bg-[#0a0a0f] text-white font-sans overflow-hidden">
            {/* Admin Sidebar */}
            <aside className="w-64 bg-[#12121a] border-r border-white/5 flex flex-col">
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-2 text-brand-lime font-display font-black text-xl tracking-wider">
                        <ShieldAlert size={24} />
                        ADMIN
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <AdminNavLink to="/admin" icon={<LayoutDashboard size={18} />} label="Dashboard" />
                    <AdminNavLink to="/admin/risk" icon={<ShieldAlert size={18} />} label="Risk Monitor" />
                    <AdminNavLink to="/admin/users" icon={<Users size={18} />} label="User Management" />
                    <AdminNavLink to="/admin/settings" icon={<Settings size={18} />} label="System Settings" />
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                    >
                        <LogOut size={18} />
                        <span className="font-bold text-sm">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 border-b border-white/5 flex items-center px-8 justify-between bg-[#12121a]">
                    <h1 className="font-bold text-gray-400">Restricted Area</h1>
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-2 bg-brand-lime rounded-full animate-pulse" />
                        <span className="text-xs font-mono text-brand-lime">SYSTEM ONLINE</span>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 bg-brand-dark">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

function AdminNavLink({ to, icon, label }) {
    return (
        <Link
            to={to}
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
        >
            {icon}
            <span className="font-bold text-sm">{label}</span>
        </Link>
    );
}
