import React from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    CheckCircle2,
    Activity,
    ArrowUpRight,
    Target,
    Zap,
    Shield,
    Globe,
    ChevronRight,
    Layers,
    MoveRight
} from 'lucide-react';
import CrystalMarket from '../components/Landing/CrystalMarket';
import ChallengeSelector from '../components/Landing/ChallengeSelector';
import Footer from '../components/Global/Footer';

export default function Landing({ onAuthRequest }) {
    return (
        <div className="min-h-screen bg-background text-primary font-sans selection:bg-accent selection:text-background overflow-x-hidden">

            {/* NAV */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-8 flex justify-between items-center transition-all duration-500">
                <div className="flex flex-col">
                    <div className="font-bold text-xl tracking-[-0.04em] text-primary">OPTIVON</div>
                    <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-accent">Institutional</div>
                </div>
                <div className="flex items-center gap-8">
                    <button 
                        onClick={() => window.location.href = '/rules'}
                        className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary hover:text-primary transition-colors hidden md:block"
                    >
                        Protocol
                    </button>
                    <button
                        onClick={onAuthRequest}
                        className="px-8 py-3 bg-white text-black font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-accent hover:text-white transition-colors border border-white/10"
                    >
                        Initialize
                    </button>
                </div>
            </nav>

            {/* HERO SECTION */}
            <header className="relative min-h-screen flex flex-col justify-center px-8 md:px-24 bg-background overflow-hidden">
                {/* Background Text Overlay */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[35vw] font-bold text-white/[0.01] pointer-events-none select-none tracking-tighter">
                    CAPITAL
                </div>

                <div className="relative z-10 pt-20 max-w-[1400px] mx-auto w-full">
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-16 items-center">
                        <div className="xl:col-span-8">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-12 flex items-center gap-4"
                            >
                                <div className="h-px w-12 bg-accent opacity-50" />
                                <span className="text-accent font-bold text-[10px] uppercase tracking-[0.3em]">
                                    Proprietary Trading Framework v2.4
                                </span>
                            </motion.div>

                            <h1 className="text-[14vw] sm:text-[12vw] md:text-[9vw] lg:text-[8vw] xl:text-[7.5vw] font-display font-black leading-[0.85] tracking-tighter uppercase mb-8 text-white">
                                PRECISION<br />
                                <span className="text-accent">EXECUTION.</span>
                            </h1>

                            <div className="max-w-xl flex flex-col gap-10">
                                <p className="text-lg md:text-xl text-secondary font-medium leading-relaxed">
                                    Access institutional-grade capital and technology. 
                                    Trade NIFTY & BANKNIFTY with the industry's most aggressive risk architecture.
                                </p>
                                
                                <div className="flex flex-wrap gap-6">
                                    <button
                                        onClick={onAuthRequest}
                                        className="group flex items-center gap-4 px-12 py-5 bg-accent text-white font-bold uppercase tracking-[0.2em] text-[12px] hover:bg-white hover:text-black transition-colors"
                                    >
                                        Start Evaluation
                                        <MoveRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                    </button>
                                    <button
                                        onClick={() => window.location.href = '/rules'}
                                        className="flex items-center gap-2 px-12 py-5 border border-white/20 text-white hover:bg-white/10 transition-colors font-bold uppercase tracking-[0.2em] text-[12px]"
                                    >
                                        View Parameters
                                    </button>
                                </div>
                            </div>

                        </div>

                        <div className="xl:col-span-4 hidden xl:block relative h-[60vh]">
                            <div className="absolute inset-0 opacity-40">
                                <CrystalMarket />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* SECTION 1: ARCHITECTURE (Red Block) */}
            <section className="bg-accent text-white py-32 px-8 md:px-24">
                <div className="max-w-[1400px] mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
                        <div className="lg:col-span-7">
                            <div className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/80 mb-8">/ 01 Architecture</div>
                            <h2 className="text-6xl md:text-7xl lg:text-[6vw] xl:text-[6.5vw] font-display font-black leading-[0.9] tracking-tighter uppercase mb-12 max-w-2xl">
                                BUILT FOR<br />PERFORMANCE.
                            </h2>
                            <p className="text-xl font-medium leading-relaxed opacity-90 mb-16 max-w-xl">
                                Optimized for high-frequency execution and institutional-grade risk management. Our system is a pinnacle of stability in volatile markets.
                            </p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                                <FeatureItem title="8% Drawdown" desc="Max Trailing Drawdown" />
                                <FeatureItem title="4% Daily" desc="Hard Loss Stop" />
                                <FeatureItem title="Zero Latency" desc="Direct Market Access" />
                                <FeatureItem title="80% Split" desc="Institutional Payouts" />
                            </div>
                        </div>

                        <div className="lg:col-span-5 relative group">
                            <div className="aspect-square max-w-[500px] mx-auto bg-background rounded-premium p-12 border border-black/10 overflow-hidden shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]">
                                <div className="absolute inset-0 bg-gentle-grid opacity-20 pointer-events-none" />
                                <div className="h-full flex flex-col justify-between relative z-10">
                                    <div className="w-16 h-16 rounded-instrument bg-accent/20 flex items-center justify-center">
                                        <Layers className="text-accent w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-4xl font-display font-black text-black mb-4 uppercase tracking-tighter">OPTIVON // COMMAND</h3>
                                        <p className="text-black/80 text-sm font-medium leading-relaxed max-w-xs">
                                            A proprietary terminal designed for professional scale. Mirroring institutional order flows with 0.0 spreads.
                                        </p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="px-4 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest leading-none flex items-center">
                                            STABLE v2.4
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 2: PROTOCOLS */}
            <section className="py-32 px-8 md:px-24 border-t border-white/[0.05]">
                <div className="max-w-[1400px] mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-end mb-24">
                        <div className="lg:col-span-8">
                            <div className="text-[12px] font-bold uppercase tracking-[0.2em] text-accent mb-6">/ 02 Engine</div>
                            <h2 className="text-6xl md:text-[8vw] font-display font-black tracking-tighter uppercase leading-none text-white">
                                SELECTION.
                            </h2>
                        </div>
                        <div className="lg:col-span-4">
                            <p className="text-secondary font-medium leading-relaxed md:text-right">
                                Transcend traditional funding. Choose the capital engine that aligns with your execution strategy.
                            </p>
                        </div>
                    </div>

                    <ChallengeSelector />
                </div>
            </section>

            {/* SECTION 3: PAYOUTS */}
            <section className="bg-[#151516] py-32 px-8 md:px-24">
                <div className="max-w-[1400px] mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <PayoutCard 
                            icon={<Target />} 
                            title="Targets" 
                            value="10%" 
                            desc="Phase 1 Growth Target" 
                        />
                        <PayoutCard 
                            icon={<Zap />} 
                            title="Velocity" 
                            value="14D" 
                            desc="Bi-Weekly Payout Cycle" 
                        />
                        <PayoutCard 
                            icon={<Shield />} 
                            title="Security" 
                            value="SSL" 
                            desc="Encrypted Transactions" 
                        />
                    </div>

                    {/* CTA Section */}
                    <div className="mt-32 p-12 md:p-32 bg-accent text-white flex flex-col items-center">
                        <div className="text-[12px] font-bold uppercase tracking-[0.5em] text-white/80 mb-12">FINALIZATION</div>
                        <h2 className="text-5xl md:text-[5vw] font-display font-black tracking-tighter uppercase mb-12 max-w-4xl text-center leading-[1]">
                            THE STANDARD FOR SERIOUS CAPITAL SEEKERS.
                        </h2>
                        <button
                            onClick={onAuthRequest}
                            className="px-16 py-6 bg-white text-black font-bold uppercase tracking-[0.3em] text-[13px] hover:bg-black hover:text-white transition-colors"
                        >
                            Get Funded
                        </button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

function FeatureItem({ title, desc }) {
    return (
        <div className="border-l-4 border-black/20 pl-8 transition-colors hover:border-black group">
            <h4 className="text-3xl font-display font-black mb-2 text-white group-hover:text-black transition-colors">{title}</h4>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">{desc}</div>
        </div>
    );
}

function PayoutCard({ icon, title, value, desc }) {
    return (
        <div className="p-12 border border-white/5 rounded-premium bg-surface hover:border-accent/30 transition-all group">
            <div className="mb-8 text-accent opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
                {React.cloneElement(icon, { size: 32 })}
            </div>
            <div className="text-5xl font-bold mb-4 tracking-tighter text-primary">{value}</div>
            <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary mb-4">{title}</h5>
            <p className="text-sm text-secondary/60 leading-relaxed font-medium">
                {desc}
            </p>
        </div>
    );
}
