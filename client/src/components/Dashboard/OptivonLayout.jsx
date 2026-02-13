import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import OptivonSidebar from './OptivonSidebar';
import { Moon, Sun, User, ChevronDown, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function OptivonLayout() {
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    console.log('[DEBUG] OptivonLayout Mounted. User:', user);

    // Get current page title based on path
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
        <div className="flex h-screen w-full bg-[#121220] font-sans text-white overflow-hidden selection:bg-brand-lime selection:text-brand-dark">
            {/* LEFT SIDEBAR */}
            <OptivonSidebar />

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-brand-dark transition-colors relative">

                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

                {/* HEADER */}
                <header className="h-20 bg-brand-dark/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 flex-shrink-0 z-50 relative">
                    <div>
                        <h2 className="text-xl font-display font-bold text-white tracking-tight uppercase">
                            {getPageTitle()}
                        </h2>
                        <p className="text-xs text-brand-lime font-mono tracking-wider opacity-80">System v2.0 // Connected</p>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Status Indicator */}
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-mono text-green-500 font-bold uppercase">Markets Open</span>
                        </div>

                        {/* User Profile */}
                        <div
                            className="relative"
                            onMouseEnter={() => setIsDropdownOpen(true)}
                            onMouseLeave={() => setIsDropdownOpen(false)}
                        >
                            <div className="flex items-center gap-3 pl-6 border-l border-white/5 cursor-pointer group">
                                <div className="text-right hidden md:block transition-opacity duration-300 group-hover:opacity-80">
                                    <p className="text-sm font-bold text-white leading-tight">{user?.name || 'Trader'}</p>
                                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Tier 1</p>
                                </div>
                                <div className={`
                                    w-10 h-10 rounded-lg border flex items-center justify-center font-display font-bold text-sm transition-all duration-300
                                    ${isDropdownOpen
                                        ? 'bg-brand-lime text-brand-dark border-brand-lime shadow-[0_0_15px_rgba(204,255,0,0.3)]'
                                        : 'bg-white/5 border-white/10 text-brand-lime hover:bg-brand-lime/10'}
                                `}>
                                    {user?.name ? user.name.charAt(0) : 'T'}
                                </div>
                                <motion.div
                                    animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ChevronDown size={14} className={`transition-colors ${isDropdownOpen ? 'text-brand-lime' : 'text-gray-500'}`} />
                                </motion.div>
                            </div>

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="absolute top-full right-0 pt-4 w-56 z-50"
                                    >
                                        <div className="bg-[#1F1F35]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/5">

                                            {/* Header Section */}
                                            <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                                                <p className="text-xs text-gray-400 font-medium">Signed in as</p>
                                                <p className="text-sm font-bold text-white truncate">{user?.email || 'trader@optivon.com'}</p>
                                            </div>

                                            {/* Menu Items */}
                                            <div className="p-2">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full relative group flex items-center justify-between px-4 py-2.5 text-sm rounded-lg transition-all duration-300 overflow-hidden"
                                                >
                                                    <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/10 transition-colors" />
                                                    <div className="flex items-center gap-3 relative z-10 text-gray-400 group-hover:text-red-400">
                                                        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                                                        <span className="font-medium">Logout</span>
                                                    </div>

                                                    {/* Neon Glitch Effect on Hover */}
                                                    <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-red-500 opacity-0 group-hover:opacity-100 shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-opacity" />
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
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 relative z-0">
                    <Outlet />
                </main>

            </div>
        </div>
    );
}

