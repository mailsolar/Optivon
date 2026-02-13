
import React from 'react';
import { Users, Gift, Copy, Check, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Affiliates() {
    const { user } = useAuth();
    const { addToast } = useToast();

    // Derived dummy link
    const referralLink = `https://optivon.com/ref/${user?.id || 'guest'}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        addToast('Referral link copied to clipboard', 'success');
    };

    return (
        <div className="flex flex-col gap-8 max-w-6xl mx-auto h-full">

            {/* HERO SECTION */}
            <div className="relative rounded-2xl p-8 overflow-hidden bg-brand-dark border border-white/5">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-lime/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />

                <div className="relative z-10 flex flex-col items-start gap-4 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-lime/10 border border-brand-lime/20 rounded-full">
                        <Users size={14} className="text-brand-lime" />
                        <span className="text-xs font-bold text-brand-lime uppercase tracking-widest">Partner Program</span>
                    </div>

                    <h1 className="text-4xl font-display font-black text-white uppercase leading-none">
                        Invite Traders.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-lime to-green-400">Earn up to 15%</span> Commission.
                    </h1>

                    <p className="text-gray-400 text-lg leading-relaxed">
                        Join the Optivon Partner Ecosystem. Help us find the world's best traders and earn recurring commissions on every challenge they purchase.
                    </p>

                    <div className="mt-4 flex flex-col sm:flex-row items-center gap-4 w-full max-w-lg">
                        <div className="flex-1 bg-[#121220] border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between w-full">
                            <span className="font-mono text-sm text-gray-300 truncate">{referralLink}</span>
                            <button
                                onClick={handleCopy}
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                <Copy size={16} />
                            </button>
                        </div>
                        <button className="w-full sm:w-auto bg-brand-lime text-brand-dark font-bold px-6 py-3.5 rounded-xl hover:scale-105 transition-transform">
                            Copy Link
                        </button>
                    </div>
                </div>
            </div>

            {/* METRICS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#1F1F35] p-6 rounded-2xl border border-white/5">
                    <p className="text-xs text-brand-lime font-mono font-bold uppercase tracking-widest mb-2">Total Referrals</p>
                    <h3 className="text-3xl font-display font-black text-white">0</h3>
                </div>
                <div className="bg-[#1F1F35] p-6 rounded-2xl border border-white/5">
                    <p className="text-xs text-brand-blue font-mono font-bold uppercase tracking-widest mb-2">Commission Rate</p>
                    <h3 className="text-3xl font-display font-black text-white">10%</h3>
                </div>
                <div className="bg-[#1F1F35] p-6 rounded-2xl border border-white/5">
                    <p className="text-xs text-purple-400 font-mono font-bold uppercase tracking-widest mb-2">Pending Payout</p>
                    <h3 className="text-3xl font-display font-black text-white">$0.00</h3>
                </div>
            </div>

            {/* HOW IT WORKS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#1F1F35] p-8 rounded-2xl border border-white/5">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <Gift className="text-brand-lime" />
                        Benefits & Rewards
                    </h3>

                    <div className="space-y-6">
                        {[
                            { title: 'Instant Payouts', desc: 'Withdraw your commissions instantly via Crypto or Bank Transfer once you hit $50.' },
                            { title: 'Lifetime Tracking', desc: 'Any trader you refer is linked to you forever. Earn on every purchase they make.' },
                            { title: 'Leaderboard Prizes', desc: 'Top affiliates compete for monthly cash prizes up to $5,000.' }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="mt-1 w-6 h-6 rounded-full bg-brand-lime/10 flex items-center justify-center shrink-0">
                                    <Check size={12} className="text-brand-lime" strokeWidth={3} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm mb-1">{item.title}</h4>
                                    <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="group relative rounded-2xl overflow-hidden min-h-[300px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/80 to-[#121220]" />
                    <div className="absolute bottom-0 left-0 p-8 z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full mb-4">
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Affiliate Tier 1</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Level Up Your Earnings</h3>
                        <p className="text-white/70 text-sm mb-6 max-w-sm"> Refer 50+ traders to unlock 'Elite Partner' status with 15% commissions and dedicated support.</p>

                        <button className="flex items-center gap-2 text-white font-bold text-sm hover:gap-3 transition-all">
                            View Tier Requirements <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}

