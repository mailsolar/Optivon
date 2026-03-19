import React, { useState } from 'react';
import { CreditCard, HelpCircle, Mail, ArrowRight } from 'lucide-react';
import TabSwitcher from '../../components/Dashboard/TabSwitcher';

export default function Withdrawals() {
    const [activeFilter, setActiveFilter] = useState('All');

    return (
        <div className="flex flex-col lg:flex-row gap-10 h-full font-sans">
            <div className="flex-1 min-w-0 flex flex-col gap-10">

                {/* Stats Card */}
                <div className="bg-surface rounded-premium p-10 border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />
                    <div className="relative z-10 flex flex-col gap-2">
                        <div className="text-[10px] font-bold text-accent uppercase tracking-[0.4em]">Liquid Equity</div>
                        <h1 className="text-5xl font-bold text-primary tracking-tighter">₹0.00</h1>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-surface/50 p-2 rounded-instrument border border-white/5 inline-flex self-start">
                    {['All', 'Submitted', 'Approved', 'Rejected'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-6 py-2 rounded-instrument text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${activeFilter === filter
                                ? 'bg-accent text-background shadow-soft'
                                : 'text-muted hover:text-primary'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Empty State */}
                <div className="flex-1 bg-surface rounded-premium shadow-2xl border border-white/5 flex flex-col items-center justify-center p-20 text-center min-h-[400px]">
                    <div className="w-24 h-24 bg-accent/5 border border-accent/20 rounded-instrument flex items-center justify-center text-accent mb-10 shadow-soft">
                        <CreditCard size={40} />
                    </div>
                    <div className="flex flex-col gap-3">
                        <h3 className="text-xl font-bold text-primary uppercase tracking-tight">No Transactions Detected</h3>
                        <p className="text-secondary font-medium text-sm max-w-sm">Synchronize your trading activities to begin the performance settlement protocol.</p>
                    </div>
                </div>
            </div>

            {/* Sidebar Widget */}
            <div className="lg:w-96 flex-shrink-0">
                <div className="bg-surface rounded-premium p-10 shadow-2xl border border-white/5 h-fit flex flex-col gap-10 sticky top-10">
                    <div className="flex flex-col gap-4">
                        <div className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Direct Link</div>
                        <h3 className="text-2xl font-bold text-primary uppercase tracking-tight">Institutional Support</h3>
                        <p className="text-secondary font-medium text-sm leading-relaxed">Our protocol specialists are on standby for your administrative needs.</p>
                    </div>

                    <div className="space-y-4">
                        <button className="w-full py-5 px-6 bg-background border border-white/10 hover:border-accent/30 text-primary font-bold text-[10px] uppercase tracking-[0.3em] rounded-instrument transition-all flex items-center justify-center gap-3">
                            <HelpCircle size={16} /> Knowledge Base
                        </button>
                        <button className="w-full py-5 px-6 bg-accent text-background font-bold text-[10px] uppercase tracking-[0.3em] rounded-instrument shadow-soft hover:bg-primary transition-all flex items-center justify-center gap-3 group">
                            <Mail size={16} /> Support Node
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// We removed the dependency on the global TabSwitcher as it might have had legacy styles. 
// We implemented a local, cleaner version for the Optivon theme.
