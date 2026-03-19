import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, LogOut, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Global/Footer';

export default function AdminLayout() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="flex h-screen bg-background text-primary font-sans overflow-hidden selection:bg-accent selection:text-background">
            {/* Admin Sidebar */}
            <aside className="w-64 bg-surface border-r border-white/5 flex flex-col">
                <div className="p-8 border-b border-white/5">
                    <div className="flex flex-col gap-2">
                        <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-secondary">Optivon Admin</div>
                        <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
                            <ShieldAlert size={20} className="text-accent" />
                            VAULT
                        </div>
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
                <header className="h-16 border-b border-white/5 flex items-center px-8 justify-between bg-surface">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-3 text-secondary hover:text-primary transition-colors group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Return to Site</span>
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Live Protocol</span>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-background">
                    <div className="p-8 pb-32">
                        <Outlet />
                    </div>
                    <Footer />
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

