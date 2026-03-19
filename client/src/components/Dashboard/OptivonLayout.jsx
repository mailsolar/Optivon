import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import OptivonSidebar from './OptivonSidebar';
import { Moon, Sun, User, ChevronDown, LogOut, Shield, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Footer from '../Global/Footer';

export default function OptivonLayout() {
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    console.log('[DEBUG] OptivonLayout Mounted. User:', user);

    const location = useLocation();
    const getPageTitle = () => {
        const path = location.pathname.split('/').pop();
        if (!path || path === 'dashboard') return 'Accounts Overview';
        return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="flex h-screen w-full bg-background font-sans text-primary overflow-hidden selection:bg-accent selection:text-background">
            {/* LEFT SIDEBAR */}
            <OptivonSidebar />

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background transition-colors relative">

                {/* Subtle Structural Accents */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/[0.02] rounded-full blur-[150px] pointer-events-none -mr-96 -mt-96" />

                {/* HEADER */}
                <header className="h-20 bg-background/80 backdrop-blur-xl border-b border-white/[0.02] flex items-center justify-between px-10 flex-shrink-0 z-50 relative">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-xl font-bold text-primary tracking-tight uppercase text-shadow-glow">
                            {getPageTitle()}
                        </h2>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] text-accent font-black tracking-[0.3em] uppercase">Protocol // Optivon Graphite</span>
                            <span className="w-1 h-1 bg-white/20 rounded-full" />
                            <span className="text-[10px] text-muted font-bold tracking-[0.2em] uppercase">v2.4.0-STABLE</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        {/* Status Indicator */}
                        <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 bg-accent/5 border border-accent/10 rounded-full shadow-inner">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_#C50022]" />
                            <span className="text-[9px] font-black text-accent uppercase tracking-[0.2em]">Transmission Active</span>
                        </div>

                        {/* User Profile */}
                        <div
                            className="relative"
                            onMouseEnter={() => setIsDropdownOpen(true)}
                            onMouseLeave={() => setIsDropdownOpen(false)}
                        >
                            <div className="flex items-center gap-4 pl-8 border-l border-white/[0.05] cursor-pointer group">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-primary leading-none mb-1 group-hover:text-accent transition-colors">{user?.name || 'Authorized User'}</p>
                                    <p className="text-[9px] font-black text-muted uppercase tracking-[0.2em]">Tier 01 // Node</p>
                                </div>
                                <div className={`
                                    w-11 h-11 rounded-instrument border flex items-center justify-center font-bold text-sm transition-all duration-500
                                    ${isDropdownOpen
                                        ? 'bg-accent text-background border-accent shadow-premium'
                                        : 'bg-surface border-white/5 text-accent hover:border-accent/30'}
                                `}>
                                    {user?.name ? user.name.charAt(0) : <User size={18} />}
                                </div>
                            </div>

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="absolute top-full right-0 pt-4 w-64 z-50"
                                    >
                                        <div className="bg-surface/95 backdrop-blur-2xl border border-white/5 rounded-premium shadow-premium overflow-hidden">
                                            {/* Header Section */}
                                            <div className="px-6 py-5 border-b border-white/[0.03] bg-background/30">
                                                <p className="text-[9px] text-muted font-bold uppercase tracking-widest mb-1">Identity Verified</p>
                                                <p className="text-sm font-bold text-primary truncate tracking-tight">{user?.email || 'trader@optivon.com'}</p>
                                            </div>

                                            {/* Menu Items */}
                                            <div className="p-2">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full relative group flex items-center justify-between px-6 py-3 text-xs font-bold rounded-instrument transition-all duration-300"
                                                >
                                                    <div className="absolute inset-0 bg-red-400/0 group-hover:bg-red-400/5 transition-colors" />
                                                    <div className="flex items-center gap-3 relative z-10 text-muted group-hover:text-red-400">
                                                        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                                                        <span className="uppercase tracking-widest">Terminate Session</span>
                                                    </div>
                                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-red-400 opacity-0 group-hover:opacity-100 shadow-[0_0_10px_#f87171] transition-opacity" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* SCROLLABLE CONTENT */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto relative z-0 hide-scrollbar scroll-smooth bg-background">
                    <div className="p-10 lg:p-12">
                        <Outlet />
                    </div>
                    <Footer />
                </main>
            </div>
        </div>
    );
}
