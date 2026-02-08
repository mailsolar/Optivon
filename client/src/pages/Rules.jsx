import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, AlertTriangle, TrendingUp, Ban, CheckCircle2, Gavel, Scale, Clock, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Rules() {
    return (
        <div className="min-h-screen bg-brand-dark text-white font-sans selection:bg-brand-lime selection:text-brand-dark">
            {/* Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex justify-between items-center bg-brand-dark/90 backdrop-blur-md border-b border-white/5">
                <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                    <span className="text-xs font-mono uppercase tracking-widest">Back to Home</span>
                </Link>
                <div className="font-display font-black text-xl tracking-[0.2em]">OPTIVON <span className="text-brand-lime">//</span> RULES</div>
                <div className="w-24"></div> {/* Spacer for center alignment */}
            </nav>

            <main className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block"
                    >
                        <span className="block font-mono text-brand-lime text-sm uppercase tracking-widest mb-4">The Protocol v2.0</span>
                        <h1 className="text-6xl md:text-8xl font-black font-display tracking-tighter uppercase mb-6">
                            Official <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-lime to-emerald-400">Rulebook</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            Transparency is our currency. Master these parameters to secure and retain your funding.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Sidebar Navigation (Hidden on mobile, sticky on desktop) */}
                    <aside className="hidden lg:block lg:col-span-3">
                        <div className="sticky top-32 space-y-2">
                            <NavAnchor href="#core" label="Core Trading Rules" />
                            <NavAnchor href="#risk" label="Risk Parameters" />
                            <NavAnchor href="#behavior" label="Trading Behavior" />
                            <NavAnchor href="#execution" label="Execution Policy" />
                            <NavAnchor href="#stages" label="Challenge Stages" />
                            <NavAnchor href="#disqualification" label="Disqualification" />
                            <NavAnchor href="#integrity" label="Anti-Cheating" />
                        </div>
                    </aside>

                    {/* Content Area */}
                    <div className="lg:col-span-9 space-y-24">

                        {/* 1. Core Trading Rules */}
                        <Section id="core" title="Core Trading Rules" icon={Scale}>
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                <RuleCard title="Profit Targets" value="10% / 8% / 5%">
                                    <ul className="space-y-2 text-sm text-gray-400 mt-2">
                                        <li className="flex justify-between"><span>1-Phase Challenge:</span> <span className="text-white font-bold">10%</span></li>
                                        <li className="flex justify-between"><span>2-Phase (Phase 1):</span> <span className="text-white font-bold">8%</span></li>
                                        <li className="flex justify-between"><span>2-Phase (Phase 2):</span> <span className="text-white font-bold">5%</span></li>
                                        <li className="flex justify-between"><span>Funded Stage:</span> <span className="text-brand-lime font-bold">No Target</span></li>
                                    </ul>
                                </RuleCard>
                                <RuleCard title="Drawdown Limits" value="4% Daily / 8-10% Max">
                                    <ul className="space-y-2 text-sm text-gray-400 mt-2">
                                        <li className="flex justify-between"><span>Daily Max Loss:</span> <span className="text-red-400 font-bold">4%</span></li>
                                        <li className="flex justify-between"><span>Max Trailing (Chal):</span> <span className="text-red-400 font-bold">8%</span></li>
                                        <li className="flex justify-between"><span>Max Trailing (Fund):</span> <span className="text-red-400 font-bold">10%</span></li>
                                    </ul>
                                </RuleCard>
                            </div>

                            <div className="bg-[#1F1F35] rounded-2xl p-8 border border-white/5 mb-8">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <TrendingUp size={20} className="text-brand-lime" />
                                    Leverage & Lot Limits
                                </h3>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <h4 className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-4">Instrument Leverage</h4>
                                        <ul className="space-y-3">
                                            <BadgeRow label="Options Buying" value="10x" />
                                            <BadgeRow label="Hedged Selling" value="5x" />
                                            <BadgeRow label="Index Futures" value="2x - 3x" />
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-4">Max Lots (Nifty / BankNifty)</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between border-b border-white/5 pb-2"><span>₹50k Acc</span> <span className="font-mono text-white">2-3 / 1-2 Lots</span></div>
                                            <div className="flex justify-between border-b border-white/5 pb-2"><span>₹100k Acc</span> <span className="font-mono text-white">5-6 / 3-4 Lots</span></div>
                                            <div className="flex justify-between border-b border-white/5 pb-2"><span>₹200k Acc</span> <span className="font-mono text-white">10-12 / 6-8 Lots</span></div>
                                            <div className="flex justify-between"><span>₹500k Acc</span> <span className="font-mono text-white">25-30 / 15-20 Lots</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Section>

                        {/* 2. Risk Rules */}
                        <Section id="risk" title="Risk Parameters" icon={Shield}>
                            <div className="space-y-6">
                                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-red-400 mb-2">Rule 1: Max Risk Per Trade</h3>
                                    <p className="text-gray-300">You cannot risk more than <span className="font-bold text-white">2% of account balance</span> on a single position.</p>
                                    <p className="text-xs text-gray-500 mt-2">Violations result in trade block or account failure.</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-[#1F1F35] rounded-2xl p-6 border border-white/5">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Clock className="text-brand-lime" size={20} />
                                            <h3 className="font-bold">Overnight Policy</h3>
                                        </div>
                                        <p className="text-sm text-gray-400 mb-2">NO overnight positions allowed.</p>
                                        <div className="inline-block bg-red-500/20 text-red-400 text-xs font-bold px-2 py-1 rounded">Auto-close at 3:25 PM</div>
                                    </div>

                                    <div className="bg-[#1F1F35] rounded-2xl p-6 border border-white/5">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Activity className="text-brand-lime" size={20} />
                                            <h3 className="font-bold">Averaging</h3>
                                        </div>
                                        <p className="text-sm text-gray-400 mb-2">No averaging down after 2nd entry.</p>
                                        <ul className="text-xs text-gray-500 space-y-1">
                                            <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-green-500" /> 1st & 2nd Entry Allowed</li>
                                            <li className="flex items-center gap-2"><Ban size={12} className="text-red-500" /> 3rd Entry Blocked (Martingale Protection)</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </Section>

                        {/* 3. Trading Behavior */}
                        <Section id="behavior" title="Trading Behavior" icon={Activity}>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="font-bold text-green-400 mb-4 flex items-center gap-2"><CheckCircle2 /> Allowed Strategies</h3>
                                    <ul className="space-y-3">
                                        {['Intraday Trading', 'Trend Trading', 'Scalping', 'Breakout Trading', 'Options Buying', 'Hedged Options Selling', 'Algo Trading (Approved Only)'].map((item, i) => (
                                            <li key={i} className="flex items-center gap-3 text-sm text-gray-300 p-3 bg-white/5 rounded-lg border border-white/5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-bold text-red-400 mb-4 flex items-center gap-2"><Ban /> Prohibited Strategies</h3>
                                    <ul className="space-y-3">
                                        {['Martingale (Infinite Averaging)', 'Grid Trading', 'High-Frequency API Botting', 'Latency Arbitrage', 'Copy Trading (3rd Party)', 'Insider News Trading', 'Account Churning'].map((item, i) => (
                                            <li key={i} className="flex items-center gap-3 text-sm text-gray-300 p-3 bg-red-500/5 rounded-lg border border-red-500/10">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </Section>

                        {/* 4. Execution Rules */}
                        <Section id="execution" title="Execution Rules" icon={Gavel}>
                            <div className="space-y-4">
                                <div className="p-6 bg-[#1F1F35] rounded-2xl border border-white/5">
                                    <h3 className="font-bold text-lg mb-2">Realistic Fill Simulation</h3>
                                    <p className="text-gray-400 text-sm">We simulate real market conditions. Expect slight slippage during high volatility. Market orders fill at best bid/ask. Limit orders follow FIFO logic. <span className="text-brand-lime">Zero "fake instant fills".</span></p>
                                </div>
                                <div className="p-6 bg-[#1F1F35] rounded-2xl border border-white/5">
                                    <h3 className="font-bold text-lg mb-2">Spread Protection</h3>
                                    <p className="text-gray-400 text-sm mb-3">If spread exceeds threshold, trade is rejected to protect you from bad fills.</p>
                                    <div className="flex gap-4">
                                        <Badge label="BankNifty > ₹6 Blocked" color="red" />
                                        <Badge label="Nifty > ₹3 Blocked" color="red" />
                                    </div>
                                </div>
                            </div>
                        </Section>

                        {/* 5. Stages */}
                        <Section id="stages" title="Challenge & Funded Stages" icon={TrendingUp}>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="border border-brand-lime/20 bg-brand-lime/5 rounded-2xl p-6">
                                    <h3 className="text-xl font-bold text-brand-lime mb-4">Challenge Phase</h3>
                                    <ul className="space-y-2 text-sm text-gray-300">
                                        <li className="flex gap-2"><CheckCircle2 size={16} className="text-brand-lime" /> Achieve target without DD Violation</li>
                                        <li className="flex gap-2"><CheckCircle2 size={16} className="text-brand-lime" /> No minimum trading days</li>
                                        <li className="flex gap-2"><CheckCircle2 size={16} className="text-brand-lime" /> Min 2 trades required</li>
                                        <li className="flex gap-2"><CheckCircle2 size={16} className="text-brand-lime" /> All positions closed by 3:25 PM</li>
                                    </ul>
                                </div>
                                <div className="border border-brand-blue/20 bg-brand-blue/5 rounded-2xl p-6">
                                    <h3 className="text-xl font-bold text-brand-blue mb-4">Funded Phase</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-xs uppercase tracking-widest text-gray-500">Profit Split</div>
                                            <div className="text-2xl font-black text-white">80% Trader <span className="text-gray-600 text-lg">/ 20% Firm</span></div>
                                        </div>
                                        <div>
                                            <div className="text-xs uppercase tracking-widest text-gray-500">Payouts</div>
                                            <div className="text-white font-medium">1st Payout: <span className="text-brand-blue">14 Days</span></div>
                                            <div className="text-white font-medium">Next: <span className="text-brand-blue">Bi-Weekly</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Section>

                        {/* 6. Disqualification & Integrity */}
                        <div id="disqualification" className="space-y-12">
                            <Section id="disqualification" title="Termination Policy" icon={AlertTriangle}>
                                <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl text-center">
                                    <h3 className="text-2xl font-bold text-white mb-6">Automatic Disqualification</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {['Daily DD Violated', 'Max DD Violated', 'Lot Limit Broken', 'Banned Instrument', 'Overnight Trade', 'Risk Exceeded', 'Price Manipulation'].map((reason, i) => (
                                            <div key={i} className="bg-red-500/10 p-3 rounded-lg text-xs font-bold text-red-200 uppercase tracking-wide">
                                                {reason}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Section>

                            <Section id="integrity" title="Zero Tolerance Integrity" icon={Shield}>
                                <div className="grid md:grid-cols-3 gap-6">
                                    <IntegrityCard title="Multi-Account Passing" desc="Using same IP/Device for multiple accounts." />
                                    <IntegrityCard title="Arbitrage Exploits" desc="Exploiting feed latency or slippage bugs." />
                                    <IntegrityCard title="Group Hedging" desc="Hedging positions between two opposite accounts." />
                                </div>
                            </Section>
                        </div>

                    </div>
                </div>

                {/* Footer CTA */}
                <div className="mt-32 text-center">
                    <h2 className="text-4xl font-black font-display mb-6">Ready to execute?</h2>
                    <Link to="/" className="inline-flex items-center gap-2 bg-brand-lime text-brand-dark px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform">
                        Start Evaluation
                    </Link>
                </div>

            </main>
        </div>
    );
}

// --- Components ---

function NavAnchor({ href, label }) {
    return (
        <a href={href} className="block px-4 py-3 text-sm text-gray-500 hover:text-brand-lime hover:bg-white/5 rounded-lg transition-colors border-l-2 border-transparent hover:border-brand-lime">
            {label}
        </a>
    );
}

function Section({ id, title, icon: Icon, children }) {
    return (
        <section id={id} className="scroll-mt-32">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-brand-lime">
                    <Icon size={24} />
                </div>
                <h2 className="text-4xl font-black font-display tracking-tight text-white">{title}</h2>
            </div>
            {children}
        </section>
    );
}

function RuleCard({ title, value, children }) {
    return (
        <div className="bg-[#1F1F35] p-6 rounded-2xl border border-white/5">
            <h4 className="text-gray-500 text-xs font-mono uppercase tracking-widest mb-2">{title}</h4>
            <div className="text-2xl font-bold text-white mb-2">{value}</div>
            {children}
        </div>
    );
}

function BadgeRow({ label, value }) {
    return (
        <li className="flex justify-between items-center text-sm">
            <span className="text-gray-400">{label}</span>
            <span className="bg-white/10 px-2 py-1 rounded text-white font-mono text-xs">{value}</span>
        </li>
    );
}

function Badge({ label, color }) {
    return (
        <span className={`px-3 py-1.5 rounded bg-${color}-500/10 border border-${color}-500/20 text-${color}-400 text-xs font-bold uppercase tracking-wider`}>
            {label}
        </span>
    );
}

function IntegrityCard({ title, desc }) {
    return (
        <div className="bg-[#1F1F35] p-6 rounded-2xl border border-white/5 hover:border-red-500/30 transition-colors group">
            <Ban className="text-red-500 mb-4 group-hover:scale-110 transition-transform" size={24} />
            <h4 className="font-bold text-white mb-2">{title}</h4>
            <p className="text-sm text-gray-400">{desc}</p>
        </div>
    );
}
