import React from 'react';
import { Trophy, Timer, Flame, ArrowRight, Target, Zap, Users, Award } from 'lucide-react';

export default function Competitions() {
    const competitions = [
        {
            id: 1,
            title: "Global Sprint Alpha",
            status: "Active",
            participants: 1240,
            prize: "₹5,00,000 + Funding",
            endsIn: "4d 12h",
            bg: "bg-accent/5",
            accent: "text-accent"
        },
        {
            id: 2,
            title: "Weekend Blitz",
            status: "Upcoming",
            participants: 450,
            prize: "₹1,00,000 Cash",
            startsIn: "1d 04h",
            bg: "bg-white/5",
            accent: "text-primary"
        }
    ];

    return (
        <div className="flex flex-col gap-10 max-w-6xl mx-auto font-sans">
            
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="text-[10px] font-bold text-accent uppercase tracking-[0.4em]">Arena Phase</div>
                <h1 className="text-3xl font-bold text-primary uppercase tracking-tight text-shadow-glow flex items-center gap-4">
                    <Trophy className="text-accent" size={32} />
                    Competitive Protocols
                </h1>
                <p className="text-secondary font-medium text-sm">Validate your edge against the global collective. Secured prizes await.</p>
            </div>

            {/* FEATURED HACKATHON CARD */}
            <div className="relative rounded-premium p-12 overflow-hidden bg-surface border border-accent/20 shadow-2xl group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(197,160,89,0.05),transparent)] pointer-events-none" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none" />

                <div className="relative z-10 flex flex-col xl:flex-row justify-between gap-12">
                    <div className="flex-1 space-y-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent text-background rounded-instrument font-black text-[9px] uppercase tracking-widest mb-6 shadow-soft">
                                <Flame size={12} fill="currentColor" /> Live Transmission
                            </div>
                            <h2 className="text-5xl font-black text-primary uppercase mb-4 tracking-tighter leading-none">
                                The Optivon <span className="text-accent italic">Hackathon</span>
                            </h2>
                            <p className="text-secondary font-medium text-lg max-w-2xl leading-relaxed">
                                The ultimate high-frequency trading sprint. Initialize with <span className="text-primary font-bold">₹1,00,00,000</span> simulated allocation. Peak yield velocity over 72 hours secures the prime directive.
                            </p>
                        </div>

                        <div className="flex gap-12">
                            <div>
                                <p className="text-[10px] text-muted uppercase tracking-[0.3em] font-bold mb-2">Prime Reward</p>
                                <p className="text-3xl font-bold text-primary tracking-tighter">₹10,00,000 CASH</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-muted uppercase tracking-[0.3em] font-bold mb-2">Access Cost</p>
                                <p className="text-3xl font-bold text-accent tracking-tighter">NULL</p>
                            </div>
                        </div>

                        <button className="bg-primary text-background font-black px-10 py-5 rounded-instrument hover:bg-accent transition-all flex items-center gap-3 uppercase text-xs tracking-widest shadow-premium group/btn">
                            Initialize Protocol <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* Stats / Graphic Side */}
                    <div className="w-full xl:w-96 bg-background/50 backdrop-blur-md rounded-premium border border-white/5 p-8 flex flex-col gap-6 shadow-inner">
                        <div className="flex justify-between items-center pb-6 border-b border-white/5">
                            <span className="text-[10px] text-muted uppercase tracking-[0.3em] font-bold">Live Standings</span>
                            <span className="flex items-center gap-2 text-[9px] text-accent font-black uppercase tracking-widest"><span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse shadow-[0_0_10px_#C50022]" /> Syncing</span>
                        </div>

                        <div className="space-y-6">
                            {[1, 2, 3].map((rank, i) => (
                                <div key={i} className="flex items-center justify-between group/rank">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-instrument flex items-center justify-center text-xs font-black border ${rank === 1 ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-white/5 border-white/10 text-muted'}`}>
                                            {rank}
                                        </div>
                                        <span className="text-xs font-bold text-secondary uppercase tracking-widest font-mono">Node_{Math.floor(Math.random() * 9000) + 1000}</span>
                                    </div>
                                    <span className={`text-sm font-black tracking-tighter ${rank === 1 ? 'text-accent' : 'text-primary'}`}>+{100 - (rank * 12)}.4%</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto pt-6 border-t border-white/5">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted">
                                <span>Pulse Nodes</span>
                                <span className="text-primary font-mono">1,240 Linked</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* UPCOMING & ACTIVE LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {competitions.map((comp) => (
                    <div key={comp.id} className="group bg-surface rounded-premium p-8 border border-white/5 hover:border-accent/30 transition-all relative overflow-hidden shadow-xl">
                        <div className={`absolute top-0 right-0 w-48 h-48 ${comp.bg} rounded-full blur-[60px] -mr-16 -mt-16 pointer-events-none opacity-40`} />

                        <div className="flex justify-between items-start mb-10 relative z-10">
                            <div>
                                <span className={`inline-block px-3 py-1 rounded-instrument text-[9px] uppercase font-black tracking-widest mb-4 border ${comp.status === 'Active' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-white/5 text-muted border-white/10'}`}>
                                    {comp.status}
                                </span>
                                <h3 className="text-2xl font-bold text-primary uppercase tracking-tight">{comp.title}</h3>
                            </div>
                            <div className="w-12 h-12 bg-background border border-white/5 rounded-premium flex items-center justify-center group-hover:bg-accent group-hover:text-background transition-all shadow-soft">
                                <Target size={24} className="group-hover:text-current" />
                            </div>
                        </div>

                        <div className="space-y-4 mb-10 relative z-10">
                            <div className="flex justify-between items-center py-2 border-b border-white/[0.03]">
                                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Prize Allocation</span>
                                <span className={`text-sm font-black tracking-tighter ${comp.accent}`}>{comp.prize}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/[0.03]">
                                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Active Nodes</span>
                                <span className="text-sm font-black text-primary font-mono tracking-tighter">{comp.participants}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{comp.status === 'Active' ? 'Time Remaining' : 'Initializing In'}</span>
                                <span className="text-sm font-black text-primary font-mono flex items-center gap-2 tracking-tighter">
                                    <Timer size={14} className="text-muted" />
                                    {comp.endsIn || comp.startsIn}
                                </span>
                            </div>
                        </div>

                        <button className="w-full py-4 bg-background border border-white/5 text-muted font-black text-[10px] uppercase tracking-[0.2em] rounded-instrument hover:bg-accent/10 hover:text-accent hover:border-accent/30 transition-all">
                            Access Protocol Specs
                        </button>
                    </div>
                ))}
            </div>

        </div>
    );
}
