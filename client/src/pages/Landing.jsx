import React from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    CheckCircle2,
    Activity,
    Terminal,
    ChevronDown,
    Zap,
    Shield,
    Globe
} from 'lucide-react';
import CrystalMarket from '../components/Landing/CrystalMarket';
import LandingChart from '../components/LandingChart';
import ChallengeSelector from '../components/Landing/ChallengeSelector';
import DummyTerminal from '../components/Landing/DummyTerminal';

// --- ANIMATION VARIANTS ---
const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
    visible: { transition: { staggerChildren: 0.1 } }
};

export default function Landing({ onAuthRequest }) {
    return (
        <div className="min-h-screen bg-brand-dark text-white font-sans selection:bg-brand-lime selection:text-brand-dark overflow-x-hidden">

            {/* NAV */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex justify-between items-center mix-blend-difference pointer-events-none text-white">
                <div className="font-display font-black text-xl tracking-[0.2em] pointer-events-auto">OPTIVON</div>
                <button
                    onClick={() => { console.log('Nav Login Clicked'); onAuthRequest(); }}
                    className="pointer-events-auto px-6 py-2 bg-white text-brand-dark rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform"
                >
                    Get Funded
                </button>
            </nav>

            {/* HERO SECTION - Deep Purple */}
            <header className="relative min-h-screen flex flex-col justify-end pb-32 px-6 md:px-12 bg-brand-dark">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                <div className="relative z-10">
                    <div className="mb-8">
                        <span className="text-brand-lime font-mono text-sm uppercase tracking-widest border border-brand-lime/20 px-3 py-1 rounded-full">
                            Since 2024 / System v2.0
                        </span>
                    </div>

                    <h1 className="text-[14vw] leading-[0.8] font-black tracking-tighter font-display uppercase mix-blend-screen">
                        Design<span className="text-brand-lime">.</span><br />
                        Trade<span className="text-brand-lime">.</span><br />
                        Scale<span className="text-brand-lime">.</span>
                    </h1>

                    <div className="max-w-xl mt-12 flex flex-col gap-8">
                        <p className="text-xl md:text-2xl text-gray-400 font-light leading-relaxed">
                            We handle the capital. You handle the execution.
                            <br />
                            A professional trading ecosystem built for NIFTY & BANKNIFTY.
                        </p>
                        <button
                            onClick={onAuthRequest}
                            className="w-fit px-8 py-4 border border-brand-lime text-brand-lime hover:bg-brand-lime hover:text-brand-dark transition-colors duration-300 rounded-lg font-bold uppercase tracking-widest text-sm"
                        >
                            Start Evaluation
                        </button>
                        <button
                            onClick={() => window.location.href = '/rules'}
                            className="w-fit px-8 py-4 ml-4 text-gray-400 hover:text-white transition-colors duration-300 font-bold uppercase tracking-widest text-sm flex items-center gap-2 group"
                        >
                            Read Protocol <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Hero Chart Overlay */}
                {/* Hero Chart Overlay - Crystal Market */}
                <div className="absolute top-20 right-[-5%] w-[65%] h-[800px] pointer-events-none hidden lg:block z-0 mix-blend-screen">
                    <CrystalMarket />
                </div>
            </header>

            {/* SECTION 1: PROTOCOL (Lime Block) */}
            <section className="bg-brand-lime text-brand-dark py-32 px-6 md:px-12 relative overflow-hidden">
                <div className="max-w-[1600px] mx-auto">
                    <div className="flex flex-col lg:flex-row gap-20">

                        <div className="flex-1">
                            <span className="block font-mono font-bold text-xs uppercase tracking-widest mb-4 opacity-70">/ 01 Protocol</span>
                            <h2 className="text-[10vw] leading-[0.85] font-black tracking-tighter font-display mb-12">
                                Rules
                            </h2>
                            <p className="text-2xl font-medium leading-relaxed max-w-2xl mb-12">
                                Our requirements are simple. We fund talent, not gamblers. Prove your edge within our risk parameters and access up to ₹50L in buying power.
                            </p>
                            <button
                                onClick={() => window.location.href = '/rules'}
                                className="mb-12 text-sm font-bold uppercase tracking-widest border-b-2 border-brand-dark hover:border-white transition-colors pb-1"
                            >
                                View Detailed Rulebook
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="border-t border-brand-dark/20 pt-6">
                                    <h3 className="font-black text-2xl mb-2">Drawdown</h3>
                                    <p className="font-mono text-sm opacity-80">Max 8% Trailing. Daily 4% Hard Stop.</p>
                                </div>
                                <div className="border-t border-brand-dark/20 pt-6">
                                    <h3 className="font-black text-2xl mb-2">Profit Target</h3>
                                    <p className="font-mono text-sm opacity-80">10% Phase 1. 5% Phase 2.</p>
                                </div>
                                <div className="border-t border-brand-dark/20 pt-6">
                                    <h3 className="font-black text-2xl mb-2">Time Limit</h3>
                                    <p className="font-mono text-sm opacity-80">None. Trade at your own pace.</p>
                                </div>
                                <div className="border-t border-brand-dark/20 pt-6">
                                    <h3 className="font-black text-2xl mb-2">News Trading</h3>
                                    <p className="font-mono text-sm opacity-80">Permitted. Volatility is opportunity.</p>
                                </div>
                            </div>
                        </div>

                        {/* Interactive/Visual Element for Rules */}
                        <div className="flex-1 relative">
                            <div className="bg-brand-dark p-12 rounded-[40px] text-white h-full flex flex-col justify-between relative overflow-hidden group">
                                <div className="relative z-10">
                                    <Activity className="w-16 h-16 text-brand-lime mb-8" />
                                    <h3 className="text-4xl font-black mb-4">Live Execution</h3>
                                    <p className="text-gray-400">
                                        Trade NIFTY & BANKNIFTY with raw spreads. Our simulation environment mirrors institutional liquidity conditions.
                                    </p>
                                </div>

                                <div className="mt-12 grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                        <div className="text-brand-lime text-2xl font-black">2ms</div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wider">Latency</div>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                        <div className="text-brand-lime text-2xl font-black">0.0</div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wider">Spread</div>
                                    </div>
                                </div>

                                {/* Abstract Lines */}
                                <div className="absolute inset-0 opacity-20 pointer-events-none">
                                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                        <path d="M0,50 Q25,25 50,50 T100,50" stroke="white" fill="none" strokeWidth="0.5" />
                                        <path d="M0,60 Q25,35 50,60 T100,60" stroke="white" fill="none" strokeWidth="0.5" />
                                        <path d="M0,70 Q25,45 50,70 T100,70" stroke="white" fill="none" strokeWidth="0.5" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* SECTION 1.5: CHALLENGE SELECTOR */}
            <section className="bg-brand-dark py-32 px-6 md:px-12 border-t border-white/10 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-lime/30 to-transparent" />

                <div className="max-w-[1600px] mx-auto">
                    <div className="text-center mb-16">
                        <span className="block font-mono font-bold text-xs text-brand-lime uppercase tracking-widest mb-4">/ Select Protocol</span>
                        <h2 className="text-[5vw] md:text-5xl leading-[0.9] font-black tracking-tighter font-display text-white mb-6">
                            Choose Your Engine
                        </h2>
                        <p className="text-gray-400 max-w-xl mx-auto">
                            Tailor your capital access. Select the model that fits your risk profile and trading style.
                        </p>
                    </div>

                    <ChallengeSelector />

                    <div className="text-center mt-12">
                        <a href="/rules" className="text-xs font-mono text-gray-500 hover:text-brand-lime uppercase tracking-widest border-b border-transparent hover:border-brand-lime pb-1 transition-all">
                            View Full Trading Rules & Logic
                        </a>
                    </div>
                </div>
            </section>

            {/* SECTION 2: EXECUTION/DEVELOPMENT (Dark Block) */}
            <section className="bg-brand-dark py-32 px-6 md:px-12 border-t border-white/10">
                <div className="max-w-[1600px] mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-24">
                        <div>
                            <span className="block font-mono font-bold text-xs text-brand-lime uppercase tracking-widest mb-4">/ 02 Execution</span>
                            <h2 className="text-[8vw] leading-[0.85] font-black tracking-tighter font-display text-white">
                                SIMULATION
                            </h2>
                        </div>
                        <div className="hidden md:flex gap-12 text-right">
                            <div>
                                <div className="text-6xl font-black text-white mb-2">1,857</div>
                                <div className="text-xs font-mono text-gray-500 uppercase tracking-wider">Active Traders</div>
                            </div>
                            <div>
                                <div className="text-6xl font-black text-white mb-2 bg-brand-lime text-brand-dark px-4 inline-block transform -skew-x-12">4.9/5</div>
                                <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mt-2">Trust Score</div>
                            </div>
                        </div>
                    </div>

                    {/* Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Live Chart Block */}
                        <div className="md:col-span-2 bg-[#121220] rounded-[32px] border border-white/5 relative overflow-hidden h-[500px]">
                            <DummyTerminal />
                        </div>

                        {/* Feature Blocks */}
                        <div className="md:col-span-1 flex flex-col gap-6">
                            <div className="bg-brand-blue rounded-[32px] p-8 flex-1 relative overflow-hidden group">
                                <Zap className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="text-3xl font-black mb-2">Instant</h3>
                                <p className="text-white/70">
                                    Credentials delivered immediately upon purchase. No manual delays.
                                </p>
                            </div>
                            <div className="bg-[#1F1F35] rounded-[32px] p-8 flex-1 border border-white/5">
                                <Shield className="w-12 h-12 text-brand-lime mb-4" />
                                <h3 className="text-3xl font-black mb-2">Secure</h3>
                                <p className="text-gray-400">
                                    Encrypted payment gateways and segregated data architecture.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 3: PAYOUTS (Blue Gradient Block) */}
            <section className="relative py-32 px-6 md:px-12 overflow-hidden bg-brand-dark">
                {/* Blue Glow Background */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] bg-brand-blue/30 blur-[150px] rounded-full pointer-events-none" />

                <div className="relative z-10 max-w-[1200px] mx-auto text-center">
                    <span className="block font-mono font-bold text-xs text-brand-lime uppercase tracking-widest mb-8">/ 03 Payouts</span>

                    <h2 className="text-[8vw] leading-[0.9] font-black tracking-tighter font-display text-white mb-16">
                        Maintenance<br />
                        <span className="text-brand-blue/80">Your Wealth.</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-10 rounded-[32px] hover:bg-white/10 transition-colors">
                            <div className="text-5xl font-black text-brand-lime mb-4">80%</div>
                            <h4 className="text-xl font-bold uppercase tracking-widest mb-2">Profit Split</h4>
                            <p className="text-gray-400 text-sm">Keep the lion's share of your hard-earned alpha.</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-10 rounded-[32px] hover:bg-white/10 transition-colors">
                            <div className="text-5xl font-black text-brand-lime mb-4">14<span className="text-2xl">days</span></div>
                            <h4 className="text-xl font-bold uppercase tracking-widest mb-2">Bi-Weekly</h4>
                            <p className="text-gray-400 text-sm">Consistent cash flow. Request withdrawal every 2 weeks.</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-10 rounded-[32px] hover:bg-white/10 transition-colors">
                            <div className="text-5xl font-black text-brand-lime mb-4">Crypto</div>
                            <h4 className="text-xl font-bold uppercase tracking-widest mb-2">Methods</h4>
                            <p className="text-gray-400 text-sm">USDT (TRC20/ERC20) or Direct Bank Transfer.</p>
                        </div>
                    </div>

                    <div className="mt-24">
                        <div className="bg-black/40 backdrop-blur-lg border border-white/10 rounded-3xl p-8 max-w-2xl mx-auto flex items-center gap-6">
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shrink-0 animate-pulse">
                                <CheckCircle2 className="text-white" />
                            </div>
                            <div className="text-left">
                                <h4 className="font-bold text-white text-lg">Latest Payout Processed</h4>
                                <p className="text-brand-lime font-mono">₹ 142,500.00 • 2 mins ago • Bank Transfer</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER - Minimalist */}
            <footer className="py-20 px-6 border-t border-white/10 bg-brand-dark">
                <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-start gap-20">
                    <div>
                        <h2 className="text-6xl font-black tracking-tighter mb-8">Get in touch.</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-20">
                        <div>
                            <h4 className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-4">Socials</h4>
                            <ul className="space-y-2 text-white">
                                <li className="hover:text-brand-lime cursor-pointer transition-colors">Twitter (X)</li>
                                <li className="hover:text-brand-lime cursor-pointer transition-colors">Discord</li>
                                <li className="hover:text-brand-lime cursor-pointer transition-colors">Instagram</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-4">Legal</h4>
                            <ul className="space-y-2 text-white">
                                <li className="hover:text-brand-lime cursor-pointer transition-colors">Terms</li>
                                <li className="hover:text-brand-lime cursor-pointer transition-colors">Privacy</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="max-w-[1600px] mx-auto mt-20 pt-8 border-t border-white/5 text-xs text-gray-600 font-mono uppercase tracking-widest flex justify-between">
                    <span>© 2024 Optivon. All rights reserved.</span>
                    <span>Designed by Deepmind</span>
                </div>
            </footer>
        </div>
    );
}
