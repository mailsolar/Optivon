
import React from 'react';

export default function DashboardLayout({ user, onLogout, children }) {
    return (
        <div className="min-h-screen bg-cyber-black text-white font-mono flex overflow-hidden selection:bg-cyber-cyan selection:text-black">
            {/* Sidebar */}
            <aside className="w-64 border-r border-cyber-cyan/20 bg-[#07070a] flex flex-col z-20 shadow-[5px_0_20px_rgba(0,0,0,0.5)]">
                <div className="p-6 border-b border-cyber-cyan/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-cyber-cyan/5 animate-pulse"></div>
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan to-cyber-purple tracking-tighter italic relative z-10 font-orb">
                        OPTIVON
                    </h1>
                    <div className="mt-2 text-[10px] font-mono text-gray-400 uppercase tracking-widest relative z-10">Terminal v2.0 <span className="text-cyber-green">●</span></div>
                </div>

                <nav className="flex-1 px-4 space-y-4 py-6">
                    <div className="p-4 border border-cyber-cyan/10 bg-cyber-cyan/5 rounded backdrop-blur-sm">
                        <div className="text-[10px] text-cyber-cyan uppercase mb-2">Operator</div>
                        <div className="text-sm font-bold text-white truncate shadow-black drop-shadow-md">{user.email}</div>
                        <div className="text-[10px] text-gray-500 mt-1 font-mono">ID: {String(user.id).substring(0, 8)}...</div>
                    </div>

                    <div className="p-4 rounded border border-white/5 bg-white/5">
                        <div className="text-[10px] text-gray-400 uppercase mb-2">Market Status</div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-cyber-green animate-pulse shadow-[0_0_10px_#00ff9f]"></div>
                            <span className="text-cyber-green text-xs font-bold">NIFTY LIVE</span>
                        </div>
                    </div>
                </nav>

                <div className="p-4 border-t border-white/10 bg-black/20">
                    <button
                        onClick={onLogout}
                        className="w-full py-2 border border-cyber-pink/50 text-cyber-pink hover:bg-cyber-pink hover:text-black rounded text-xs uppercase tracking-widest transition-all shadow-[0_0_10px_rgba(255,0,220,0.1)]"
                    >
                        Disconnect
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 relative overflow-y-auto bg-cyber-black overflow-hidden">
                {/* Cyber Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                <div className="relative z-10 h-full p-px">
                    {children}
                </div>
            </main>
        </div>
    );
}
