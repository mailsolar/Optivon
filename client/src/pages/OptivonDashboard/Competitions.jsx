import React from 'react';
import { Trophy, Timer, Flame, ArrowRight, Target, Zap } from 'lucide-react';

export default function Competitions() {
    const competitions = [
        {
            id: 1,
            title: "Global Sprint Alpha",
            status: "Active",
            participants: 1240,
            prize: "$5,000 + 100k Account",
            endsIn: "4d 12h",
            bg: "from-purple-500/20 to-blue-600/20",
            accent: "text-purple-400"
        },
        {
            id: 2,
            title: "Weekend Blitz",
            status: "Upcoming",
            participants: 450,
            prize: "$1,000 Cash",
            startsIn: "1d 04h",
            bg: "from-brand-lime/10 to-green-500/10",
            accent: "text-brand-lime"
        }
    ];

    return (
        <div className="flex flex-col gap-8 max-w-6xl mx-auto h-full">

            {/* HEADER */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <Trophy className="text-brand-lime w-6 h-6" />
                    <h1 className="text-3xl font-display font-black text-white uppercase tracking-tight">Competitions</h1>
                </div>
                <p className="text-gray-400 text-lg">Compete with simulated capital. Prove your dominance. Win real prizes.</p>
            </div>

            {/* FEATURED HACKATHON CARD */}
            <div className="relative rounded-2xl p-8 overflow-hidden bg-[#1F1F35] border border-brand-lime/20 group">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,255,147,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_infinite]" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-lime/10 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-lime text-brand-dark rounded-md font-bold text-xs uppercase tracking-widest mb-4">
                            <Flame size={12} fill="currentColor" /> Live Event
                        </div>
                        <h2 className="text-4xl font-display font-black text-white uppercase mb-4 italic">
                            The Optivon <span className="text-brand-lime">Hackathon</span>
                        </h2>
                        <p className="text-gray-300 max-w-xl mb-6 leading-relaxed">
                            The ultimate high-frequency trading sprint. You start with $100,000 simulated equity. Highest profit percentage after 72 hours wins huge prizes. No drawdown rules. Just pure PnL velocity.
                        </p>

                        <div className="flex gap-8 mb-8">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">First Prize</p>
                                <p className="text-2xl font-bold text-white">$10,000 Cash</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Entry Fee</p>
                                <p className="text-2xl font-bold text-brand-lime">Free</p>
                            </div>
                        </div>

                        <button className="bg-white text-brand-dark font-black px-8 py-4 rounded-xl hover:bg-brand-lime transition-colors flex items-center gap-2">
                            Enter Competition <ArrowRight size={16} strokeWidth={3} />
                        </button>
                    </div>

                    {/* Stats / Graphic Side */}
                    <div className="w-full md:w-80 bg-[#121220] rounded-xl border border-white/10 p-6 flex flex-col gap-4">
                        <div className="flex justify-between items-center pb-4 border-b border-white/5">
                            <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Live Leaderboard</span>
                            <span className="flex items-center gap-1 text-[10px] text-green-500 font-mono"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> UPDATING</span>
                        </div>

                        <div className="space-y-4">
                            {[1, 2, 3].map((rank, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${rank === 1 ? 'bg-yellow-500 text-black' : 'bg-white/10 text-gray-400'}`}>
                                            {rank}
                                        </div>
                                        <span className="text-sm font-mono text-gray-300">User_{Math.floor(Math.random() * 9000) + 1000}</span>
                                    </div>
                                    <span className="text-sm font-bold text-brand-lime">+{100 - (rank * 12)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* UPCOMING & ACTIVE LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {competitions.map((comp) => (
                    <div key={comp.id} className="group bg-[#1F1F35] rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${comp.bg} rounded-full blur-[50px] -mr-10 -mt-10 pointer-events-none opacity-50`} />

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div>
                                <span className={`inline-block px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-widest mb-3 border ${comp.status === 'Active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                    {comp.status}
                                </span>
                                <h3 className="text-xl font-bold text-white">{comp.title}</h3>
                            </div>
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                <Target size={20} className="text-gray-400 group-hover:text-white" />
                            </div>
                        </div>

                        <div className="space-y-3 mb-6 relative z-10">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Prize Pool</span>
                                <span className={`font-bold ${comp.accent}`}>{comp.prize}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Participants</span>
                                <span className="text-white font-mono">{comp.participants}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{comp.status === 'Active' ? 'Ends In' : 'Starts In'}</span>
                                <span className="text-white font-mono flex items-center gap-2">
                                    <Timer size={12} className="text-gray-500" />
                                    {comp.endsIn || comp.startsIn}
                                </span>
                            </div>
                        </div>

                        <button className="w-full py-3 bg-white/5 border border-white/5 text-gray-300 font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-white/10 hover:text-white transition-colors">
                            View Details
                        </button>
                    </div>
                ))}
            </div>

        </div>
    );
}
