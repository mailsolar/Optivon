import React from 'react';

export default function DashboardLayout({ user, onLogout, children }) {
    return (
        <div className="min-h-screen bg-brand-dark text-white font-sans flex overflow-hidden selection:bg-brand-lime selection:text-brand-dark">
            {/* Main Content */}
            <main className="flex-1 relative overflow-y-auto bg-brand-dark overflow-hidden">
                {/* Satoshi Grid Background (Subtle) */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                <div className="relative z-10 h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
