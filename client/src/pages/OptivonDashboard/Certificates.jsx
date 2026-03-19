import React, { useState } from 'react';
import { Award, CheckCircle, Search, Download, ShieldCheck } from 'lucide-react';
import TabSwitcher from '../../components/Dashboard/TabSwitcher';

export default function Certificates() {
    const [activeTab, setActiveTab] = useState('All');

    return (
        <div className="flex flex-col gap-10 max-w-5xl mx-auto font-sans">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-2">
                    <div className="text-[10px] font-bold text-accent uppercase tracking-[0.4em]">Validation Node</div>
                    <h1 className="text-3xl font-bold text-primary uppercase tracking-tight text-shadow-glow flex items-center gap-4">
                        <Award className="text-accent" size={32} />
                        Professional Credentials
                    </h1>
                    <p className="text-secondary font-medium text-sm">Official synchronization of your success and performance levels.</p>
                </div>
                <button className="flex items-center gap-3 bg-accent text-background px-8 py-3.5 rounded-instrument font-black text-[10px] uppercase tracking-[0.2em] shadow-premium hover:bg-primary transition-all group">
                    <ShieldCheck size={18} />
                    Generate New Node Certificate
                </button>
            </div>

            {/* Filter Bar */}
            <div className="flex p-1 bg-surface border border-white/5 rounded-instrument self-start">
                {['All', 'Funded', 'Payout'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-8 py-2.5 rounded-instrument text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-accent text-background shadow-soft' : 'text-muted hover:text-primary'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* EMPTY STATE / CONTENT AREA */}
            <div className="flex-1 bg-surface rounded-premium border border-white/5 flex flex-col items-center justify-center p-20 text-center relative overflow-hidden shadow-2xl min-h-[500px]">
                <div className="absolute top-0 left-0 w-full h-1 bg-accent/20" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.03),transparent)] pointer-events-none" />

                <div className="w-32 h-32 bg-background border border-accent/10 text-accent rounded-full flex items-center justify-center mb-10 shadow-inner relative group">
                    <div className="absolute inset-0 bg-accent/5 rounded-full blur-xl group-hover:bg-accent/10 transition-all" />
                    <CheckCircle size={56} strokeWidth={1.5} className="relative z-10" />
                </div>

                <h2 className="text-2xl font-bold text-primary mb-4 uppercase tracking-tight">Sync Status: Null</h2>
                <p className="max-w-md text-secondary font-medium text-base mb-10 leading-relaxed">
                    Personalized node credentials are generated upon successful protocol completion. Initiate a evaluation to populate your audit trail.
                </p>

                <button className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-[0.3em] hover:text-primary transition-colors border-b border-accent/20 pb-1">
                    View Archival Guidelines <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );
}

function ArrowRight({ size, className }) {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
    );
}
