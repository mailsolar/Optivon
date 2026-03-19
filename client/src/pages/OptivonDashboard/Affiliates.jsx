import React from 'react';
import { Users, Gift, Copy, Check, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Affiliates() {
    const { user } = useAuth();
    const { addToast } = useToast();

    const referralLink = `https://optivon.com/ref/${user?.id || 'guest'}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        addToast('Referral link copied to clipboard', 'success');
    };

    return (
        <div className="flex flex-col gap-10 max-w-6xl mx-auto h-full font-sans">

            {/* Hero Section */}
            <div className="relative rounded-premium p-12 overflow-hidden bg-surface border border-white/5 shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />

                <div className="relative z-10 flex flex-col items-start gap-6 max-w-2xl">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-accent/5 border border-accent/20 rounded-full">
                        <Users size={14} className="text-accent" />
                        <span className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Partner Network</span>
                    </div>

                    <h1 className="text-4xl font-bold text-primary uppercase leading-tight tracking-tight">
                        Expand the Matrix.<br />
                        <span className="text-accent">Earn 15% Residual</span> Capital.
                    </h1>

                    <p className="text-secondary font-medium text-lg leading-relaxed">
                        Join the Optivon Institutional Partner program. Scale your earnings by onboarding elite talent to our precision environment.
                    </p>

                    <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 w-full max-w-lg">
                        <div className="flex-1 bg-background/50 border border-white/10 rounded-instrument px-6 py-4 flex items-center justify-between w-full">
                            <span className="font-mono text-xs text-secondary truncate">{referralLink}</span>
                            <button
                                onClick={handleCopy}
                                className="text-muted hover:text-accent transition-colors ml-4"
                            >
                                <Copy size={16} />
                            </button>
                        </div>
                        <button 
                            onClick={handleCopy}
                            className="w-full sm:w-auto bg-accent text-background font-bold px-8 py-4 rounded-instrument uppercase tracking-[0.3em] text-[11px] shadow-soft hover:bg-primary transition-all"
                        >
                            Copy Protocol
                        </button>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard label="Total Referrals" value="0" color="accent" />
                <StatCard label="Yield Percentage" value="10%" color="accent" />
                <StatCard label="Pending Allocation" value="₹0.00" color="accent" />
            </div>

            {/* Content Blocks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-surface p-10 rounded-premium border border-white/5 shadow-2xl">
                    <h3 className="text-xl font-bold text-primary mb-8 flex items-center gap-4 uppercase tracking-tight">
                        <div className="w-10 h-10 bg-accent/10 rounded-instrument flex items-center justify-center text-accent">
                            <Gift size={20} />
                        </div>
                        Protocol Rewards
                    </h3>

                    <div className="space-y-8">
                        {[
                            { title: 'Instant Settlement', desc: 'Liquidate your commissions instantly via digital or traditional rails.' },
                            { title: 'Infinite Retention', desc: 'Once a node is linked, all future allocations generate residual yield.' },
                            { title: 'Leaderboard Access', desc: 'Compete for institutional bonuses based on network performance.' }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-6">
                                <div className="mt-1 w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                                    <Check size={12} className="text-accent" strokeWidth={3} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h4 className="text-primary font-bold text-sm uppercase tracking-widest">{item.title}</h4>
                                    <p className="text-secondary text-sm font-medium leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="group relative rounded-premium overflow-hidden min-h-[350px] shadow-2xl border border-white/5">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-surface" />
                    <div className="absolute inset-0 flex flex-col justify-end p-10 z-10 bg-gradient-to-t from-surface to-transparent">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 backdrop-blur rounded-full mb-6 w-fit border border-accent/20">
                            <span className="text-[9px] font-bold text-accent uppercase tracking-widest">Partner Level: Initiate</span>
                        </div>
                        <h3 className="text-2xl font-bold text-primary mb-3 uppercase tracking-tight">Ascend to Elite Status</h3>
                        <p className="text-secondary font-medium text-sm mb-8 max-w-sm"> Reach 50 linked nodes to unlock the Elite tier: 15% yields and dedicated management.</p>

                        <button className="flex items-center gap-3 text-accent font-bold text-[10px] uppercase tracking-[0.3em] group hover:gap-5 transition-all">
                            Level Matrix Requirements <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}

function StatCard({ label, value, color }) {
    return (
        <div className="bg-surface p-8 rounded-premium border border-white/5 shadow-2xl hover:border-accent/30 transition-all">
            <p className="text-[10px] text-muted font-bold uppercase tracking-[0.3em] mb-3">{label}</p>
            <h3 className={`text-4xl font-bold tracking-tighter text-primary`}>{value}</h3>
        </div>
    );
}
