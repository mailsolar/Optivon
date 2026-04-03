import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import ChallengeSelector from '../components/Landing/ChallengeSelector';
import Footer from '../components/Global/Footer';

const EASE = [0.16, 1, 0.3, 1];

export default function Landing({ onAuthRequest }) {
    const containerRef = useRef(null);
    const { scrollY, scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
    const [navHidden, setNavHidden] = useState(false);

    useEffect(() => {
        return scrollY.onChange((latest) => {
            if (latest > 100 && latest > scrollY.getPrevious()) {
                setNavHidden(true);
            } else {
                setNavHidden(false);
            }
        });
    }, [scrollY]);

    // Smooth scroll for parallax
    const smoothY = useSpring(scrollYProgress, { stiffness: 80, damping: 20, restDelta: 0.001 });

    const heroTitleY = useTransform(scrollY, [0, 800], [0, 200]);
    const archImageY = useTransform(smoothY, [0, 0.5], [0, 300]);

    return (
        <div ref={containerRef} className="bg-background text-primary font-sans selection:bg-accent selection:text-background min-h-screen relative font-smoothing-antialiased">
            
            {/* MINIMAL NAVBAR */}
            <motion.nav 
                variants={{ visible: { y: 0 }, hidden: { y: "-100%" } }}
                animate={navHidden ? "hidden" : "visible"}
                transition={{ duration: 0.6, ease: EASE }}
                className="fixed top-0 left-0 right-0 z-50 px-6 py-6 md:px-12 flex justify-between items-center bg-background/90 backdrop-blur-md border-b border-black/5"
            >
                <div className="flex flex-col cursor-pointer transition-opacity hover:opacity-70">
                    <div className="font-display text-xl tracking-tighter text-primary">Optivon.</div>
                    <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-secondary">Institutional Capital</div>
                </div>
                <div className="flex items-center gap-8">
                    <button onClick={() => window.location.href = '/rules'} className="hidden md:block text-caption text-primary hover:text-secondary transition-colors">Protocol</button>
                    <button onClick={onAuthRequest} className="px-6 py-3 bg-primary text-white text-caption hover:bg-black/80 transition-colors">
                        Initialize
                    </button>
                </div>
            </motion.nav>

            {/* 00 // HERO SCENE */}
            <section className="relative w-full min-h-[90vh] pt-32 px-6 md:px-12 flex flex-col justify-end pb-12 overflow-hidden border-b border-black/15">
                <div className="text-caption text-secondary mb-12">Proprietary Trading Framework v2.4</div>
                
                <motion.div style={{ y: heroTitleY }} className="flex flex-col z-10 w-full mb-12">
                    <h1 className="text-display-huge text-primary relative">
                        Precision
                    </h1>
                    <h1 className="text-display-huge text-primary italic text-right relative -mt-4 md:-mt-8 lg:-mt-16">
                        Execution.
                    </h1>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
                    <div className="md:col-span-8 lg:col-span-6">
                        <p className="text-sm md:text-lg leading-relaxed text-secondary pr-12 max-w-xl">
                            Access institutional-grade capital and technology. Trade NIFTY & BANKNIFTY with the industry's most refined risk architecture.
                        </p>
                    </div>
                    <div className="md:col-span-4 lg:col-span-6 flex justify-start md:justify-end gap-6 items-center">
                        <button onClick={onAuthRequest} className="text-caption hover:opacity-50 transition-opacity border-b border-primary pb-1">Start Evaluation</button>
                        <button onClick={() => window.location.href = '/rules'} className="text-caption text-secondary hover:text-primary transition-opacity border-b border-transparent hover:border-black/15 pb-1">View Parameters</button>
                    </div>
                </div>
            </section>

            {/* 01 // ARCHITECTURE */}
            <section className="relative w-full pb-32">
                
                <div className="grid grid-cols-1 md:grid-cols-12">
                    {/* Left Sticky Column */}
                    <div className="md:col-span-5 lg:col-span-4 border-r border-black/15 px-6 md:px-12 py-24 md:py-32 md:sticky md:top-0 md:h-screen flex flex-col justify-between">
                        <div>
                            <div className="text-caption text-secondary mb-16">01 Architecture</div>
                            <h2 className="font-display text-5xl lg:text-7xl leading-tight text-primary mb-8 tracking-tight">
                                Built for <br/><span className="italic text-secondary">Performance.</span>
                            </h2>
                            <p className="text-secondary text-base leading-relaxed">
                                Optimized for high-frequency execution and institutional-grade risk management. Our system is a pinnacle of stability in volatile markets.
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <span className="text-[10px] uppercase tracking-widest text-muted" style={{ writingMode: 'vertical-rl' }}>Scroll</span>
                            <div className="w-[1px] h-24 bg-black/10 mt-4" />
                        </div>
                    </div>

                    {/* Right Scrolling Column */}
                    <div className="md:col-span-7 lg:col-span-8 flex flex-col">
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2">
                            <StatBlock value="3%" label="Max Trailing Drawdown" />
                            <StatBlock value="2%" label="Hard Stop Loss" subtitle="Daily Trailing Drawdown" />
                            <StatBlock value="0" label="Zero Latency" subtitle="Direct Market Access" />
                            <StatBlock value="80/20" label="Profit Split" subtitle="Institutional Payouts" />
                        </div>

                        {/* Terminal Manifesto (FWA Editorial style substitution for "terminal graphic") */}
                        <div className="p-12 md:p-24 border-t border-black/15 flex flex-col justify-center min-h-[50vh] bg-black/5">
                            <div className="text-caption text-secondary mb-8">System Access</div>
                            <h3 className="font-display text-4xl lg:text-5xl text-primary mb-12 tracking-tight">
                                Optivon Command.
                            </h3>
                            <p className="text-lg text-secondary leading-relaxed max-w-md font-sans">
                                Mirroring institutional order flows with absolute 0.0 latency spreads — helping retail traders reach their full potential.
                            </p>
                        </div>

                    </div>
                </div>

            </section>

            {/* 02 // ENGINE */}
            <section className="relative w-full border-t border-black/15 py-32 px-6 md:px-12">
                <div className="max-w-[1400px] mx-auto">
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-32 gap-12">
                        <div className="max-w-2xl">
                            <div className="text-caption text-secondary mb-12">02 Engine</div>
                            <h2 className="text-[clamp(4rem,9vw,9rem)] font-display text-primary leading-none tracking-[-0.02em]">
                                Selection.
                            </h2>
                        </div>
                        <p className="text-lg text-secondary max-w-sm leading-relaxed mb-4">
                            Transcend traditional funding. Choose the capital engine that aligns with your execution strategy.
                        </p>
                    </div>

                    <ChallengeSelector />

                </div>
            </section>

            {/* 03 // FINALIZATION */}
            <section className="relative w-full border-t border-black/15 pt-32 pb-48 px-6 md:px-12 overflow-hidden">
                <div className="text-caption text-secondary mb-24 max-w-[1400px] mx-auto">03 Finalization</div>

                <div className="grid grid-cols-1 md:grid-cols-3 border-t border-black/15 max-w-[1400px] mx-auto mb-48">
                    <FinalPayoutCell value="8%" label="Targets" desc="Profit Target" />
                    <FinalPayoutCell value="14D" label="Velocity" desc="Bi-Weekly Payout Cycle" />
                    <FinalPayoutCell value="SSL" label="Security" desc="Encrypted Transactions" />
                </div>

                <div className="text-center max-w-4xl mx-auto flex flex-col items-center">
                    <h2 className="text-[clamp(3.5rem,7vw,8rem)] font-display text-primary leading-[0.9] tracking-[-0.02em] mb-16">
                        The Standard for <br/><span className="italic text-secondary">Serious Capital Seekers.</span>
                    </h2>
                    <button onClick={onAuthRequest} className="px-12 py-6 bg-primary text-white text-caption hover:bg-black/80 transition-colors">
                        Get Funded Now
                    </button>
                </div>
            </section>

            <Footer />

        </div>
    );
}

function StatBlock({ value, label, subtitle }) {
    return (
        <div className="p-12 md:p-16 flex flex-col justify-between border-b sm:border-r border-black/15 min-h-[40vh] bg-background hover:bg-black/[0.02] transition-colors duration-500">
            <span className="text-caption text-secondary">{label}</span>
            <div className="mt-16">
                <h3 className="font-display text-7xl md:text-[clamp(6rem,10vw,12rem)] tracking-[-0.05em] leading-none text-primary">
                    {value}
                </h3>
                {subtitle && <p className="text-sm font-sans text-secondary mt-4">{subtitle}</p>}
            </div>
        </div>
    );
}

function FinalPayoutCell({ value, label, desc }) {
    return (
        <div className="p-12 border-b md:border-b-0 md:border-r border-black/15 last:border-r-0 flex flex-col justify-between min-h-[35vh]">
            <span className="text-caption text-secondary mb-16">{label}</span>
            <div>
                <h4 className="font-display text-6xl tracking-[-0.02em] text-primary mb-4 italic">{value}</h4>
                <p className="text-sm text-secondary font-sans">{desc}</p>
            </div>
        </div>
    );
}
