import React from 'react';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, 
    Shield, 
    AlertTriangle, 
    TrendingUp, 
    Ban, 
    CheckCircle2, 
    Gavel, 
    Scale, 
    Clock, 
    Activity,
    ChevronRight,
    Target,
    Zap,
    MoveRight,
    Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Global/Footer';

export default function Rules() {
    return (
        <div className="min-h-screen bg-background text-primary font-sans selection:bg-accent selection:text-background">
            {/* Minimal Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-8 flex justify-between items-center transition-all duration-500 backdrop-blur-md border-b border-black/15/[0.05]">
                <Link to="/" className="flex items-center gap-4 text-secondary hover:text-primary transition-all group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[12px] font-bold uppercase tracking-[0.2em]">HUB</span>
                </Link>
                <div className="flex flex-col items-center">
                    <div className="font-display font-black text-2xl tracking-tighter uppercase">PROTOCOL</div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Master Rulebook</div>
                </div>
                <div className="w-16"></div>
            </nav>

            <main className="pt-48 pb-20">
                <div className="px-8 md:px-24 max-w-[1400px] mx-auto">
                    
                    {/* Editorial Header */}
                    <header className="mb-32 border-b border-black/15 pb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-start gap-8"
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-accent font-bold text-[12px] uppercase tracking-[0.3em] font-display">Optivon Enforcement v2.4.0</span>
                                <div className="h-px w-24 bg-accent/50" />
                            </div>
                            <h1 className="text-[12vw] md:text-[8vw] font-display font-black leading-[0.85] tracking-tighter uppercase text-primary">
                                THE MASTER<br />
                                <span className="text-accent">RULEBOOK.</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-secondary max-w-2xl font-medium leading-relaxed mt-8">
                                Transparency and precision define our partnership. These parameters protect both the firm's capital and your trading longevity. Strict adherence is mandatory.
                            </p>
                        </motion.div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
                        
                        {/* Sidebar */}
                        <aside className="lg:col-span-3 hidden lg:block self-start sticky top-48 max-h-[calc(100vh-12rem)] overflow-y-auto no-scrollbar">
                            <div className="flex flex-col gap-2">
                                <NavAnchor href="#core" label="01 Core Trading" />
                                <NavAnchor href="#risk" label="02 Risk Rules" />
                                <NavAnchor href="#behavior" label="03 Trading Behavior" />
                                <NavAnchor href="#execution" label="04 Execution" />
                                <NavAnchor href="#stages" label="05 Evaluation Stage" />
                                <NavAnchor href="#funded" label="06 Funded Stage" />
                                <NavAnchor href="#disqualification" label="07 Disqualification" />
                                <NavAnchor href="#anticheat" label="08 Anti-Cheating" />
                            </div>
                        </aside>

                        {/* Content */}
                        <div className="lg:col-span-9 space-y-48">
                            
                            {/* 1. CORE TRADING RULES */}
                            <Section id="core" number="01" title="Core Trading Rules" icon={Target}>
                                <div className="text-secondary font-medium tracking-widest uppercase text-xs mb-8">(Applies to Challenge & Funded Accounts)</div>
                                
                                <div className="space-y-16">
                                    {/* Profit Targets */}
                                    <div>
                                        <h3 className="text-3xl font-display font-bold text-primary mb-6 uppercase tracking-tighter">1. Profit Targets</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <StatItem label="Evaluation Profit Target" value="8%" />
                                            <StatItem label="Funded Stage" value="No target" highlight />
                                        </div>
                                    </div>

                                    {/* Drawdown Rules */}
                                    <div>
                                        <h3 className="text-3xl font-display font-bold text-primary mb-6 uppercase tracking-tighter">2. Drawdown Rules</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <RuleBlock 
                                                title="Max Daily Drawdown" 
                                                value="2% / 4%" 
                                                desc="2% for Evaluation | 4% for Funded. Based on starting balance." 
                                                accent 
                                            />
                                            <RuleBlock 
                                                title="Max Overall Drawdown" 
                                                value="3% / 10%" 
                                                desc="3% for Evaluation | 10% for Funded. If hit → violation → fail." 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Section>

                            {/* 2. RISK RULES */}
                            <Section id="risk" number="02" title="Risk Rules" icon={Shield}>
                                <div className="space-y-12">
                                    <FeatureBox 
                                        icon={<AlertTriangle size={24} />} 
                                        title="Rule 1: Max Risk Per Trade" 
                                        desc="Trader cannot risk more than 2% of account on a single position. System checks Stop loss placement, Lot size, and Distance to SL. Violation = trade blocked or account failed." 
                                    />
                                    <FeatureBox 
                                        icon={<Clock size={24} />} 
                                        title="Rule 2: Overnight Holding" 
                                        desc="NO overnight positions allowed. All trades auto-close at 3:25 PM." 
                                    />
                                    <FeatureBox 
                                        icon={<Activity size={24} />} 
                                        title="Rule 3: No averaging down after 2nd entry" 
                                        desc="To avoid martingale behaviour: 1st entry → allowed, 2nd entry → allowed, 3rd entry → NOT allowed unless it reduces risk." 
                                    />
                                    <FeatureBox 
                                        icon={<Globe size={24} />} 
                                        title="Rule 4: Trade Only From 9:15 AM – 3:25 PM" 
                                        desc="This prevents premarket or closing-price manipulation." 
                                    />
                                </div>
                            </Section>

                            {/* 3. TRADING BEHAVIOR RULES */}
                            <Section id="behavior" number="03" title="Trading Behavior" icon={Ban}>
                                <div className="p-12 border-l-4 border-accent bg-accent/5">
                                    <h4 className="text-[12px] font-bold uppercase tracking-[0.3em] text-accent mb-8">Strictly Prohibited</h4>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[
                                            'Martingale strategy (infinite averaging)',
                                            'Grid trading',
                                            'Price manipulation',
                                            'High-frequency API botting',
                                            'Latency arbitrage',
                                            'Copy trading from other prop firm accounts',
                                            'Multi-account duplication',
                                            'Using insider news to execute trades',
                                            'Placing 50+ trades in 1 second',
                                            'Expert Advisors (EA) are strictly prohibited'
                                        ].map(item => (
                                            <li key={item} className="flex items-center gap-4 text-primary font-medium">
                                                <Ban size={18} className="text-accent shrink-0" />
                                                <span className="leading-relaxed">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Section>

                            {/* 4. EXECUTION RULES */}
                            <Section id="execution" number="04" title="Execution Rules" icon={Zap}>
                                <div className="space-y-12">
                                    <div className="border border-black/15 p-10 bg-surface">
                                        <h4 className="text-2xl font-display font-black text-primary mb-4 uppercase">Rule 1: Realistic Fill Simulation</h4>
                                        <ul className="list-disc list-inside text-secondary space-y-2 font-medium">
                                            <li>Slight slippage during high volatility</li>
                                            <li>Market orders fill at best bid/ask</li>
                                            <li>Limit orders follow FIFO logic</li>
                                            <li>Zero “fake instant fills”</li>
                                        </ul>
                                    </div>

                                    <div className="border border-black/15 p-10 bg-surface">
                                        <h4 className="text-2xl font-display font-black text-primary mb-4 uppercase">Rule 2: Order Rejection Conditions</h4>
                                        <p className="text-secondary mb-4 font-medium">Order gets blocked if:</p>
                                        <ul className="list-disc list-inside text-secondary space-y-2 font-medium">
                                            <li>Lot size greater than allowed</li>
                                            <li>Margin insufficient (after leverage)</li>
                                            <li>Chop/volatility too extreme</li>
                                            <li>DD violation detection</li>
                                            <li>Trader attempted a banned strategy</li>
                                        </ul>
                                    </div>

                                    <div className="border border-black/15 p-10 bg-surface">
                                        <h4 className="text-2xl font-display font-black text-primary mb-4 uppercase">Rule 3: Spread Protection</h4>
                                        <p className="text-secondary mb-4 font-medium leading-relaxed">
                                            If spread {'>'} allowed threshold, system rejects the trade. Prevents manipulation.
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                            <div className="bg-primary p-4 border border-black/15 text-sm text-background/80">
                                                <span className="text-background font-bold">BankNifty CE</span> spread {'>'} ₹6 → no fill
                                            </div>
                                            <div className="bg-primary p-4 border border-black/15 text-sm text-background/80">
                                                <span className="text-background font-bold">Nifty CE</span> spread {'>'} ₹3 → no fill
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Section>

                            {/* 5. CHALLENGE STAGE RULES */}
                            <Section id="stages" number="05" title="Evaluation Stage" icon={TrendingUp}>
                                <div className="p-12 bg-white/5 border border-black/15">
                                    <h4 className="text-[12px] font-bold uppercase tracking-[0.3em] text-secondary mb-8">Requirements for Funded Upgrade</h4>
                                    <ul className="space-y-6">
                                        {[
                                            'Achieve 8% profit target without violating DD',
                                            'Maintain risk discipline',
                                            'All positions close by 3:25 PM',
                                            'Must follow lot limit rules',
                                            'Only approved instruments allowed'
                                        ].map(item => (
                                            <li key={item} className="flex items-center gap-4 text-primary font-bold text-lg">
                                                <CheckCircle2 size={24} className="text-accent shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-12 text-accent font-bold uppercase tracking-widest text-sm">
                                        Passing triggers review → funded account upgrade.
                                    </div>
                                </div>
                            </Section>

                            {/* 6. FUNDED STAGE RULES */}
                            <Section id="funded" number="06" title="Funded Stage" icon={CheckCircle2}>
                                <p className="text-secondary font-medium tracking-widest uppercase text-xs mb-8">This is where payouts happen.</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <RuleBlock title="Profit Split" value="80 / 20" desc="80% to trader, 20% to firm" accent />
                                    <RuleBlock title="Payout Timing" value="14 Days" desc="First payout after 14 days trading. Subsequent payouts weekly/bi-weekly." />
                                    <RuleBlock title="Funded DD" value="4% / 10%" desc="Max daily loss: 4%. Max overall DD: 10%." />
                                </div>
                            </Section>

                            {/* 7. DISQUALIFICATION RULES */}
                            <Section id="disqualification" number="07" title="Disqualification" icon={Gavel}>
                                <div className="p-12 border border-accent/30 bg-accent/5">
                                    <h3 className="text-3xl font-display font-black mb-8 uppercase tracking-tighter text-primary hover:text-accent transition-colors">Account is TERMINATED if:</h3>
                                    <div className="flex flex-wrap gap-4">
                                        {['Daily DD violated', 'Max DD violated', 'Lot limit broken', 'Banned instrument traded', 'Trade held overnight', 'Risk-per-trade exceeded', 'Profit artificially spiked (manipulation)'].map(item => (
                                            <span key={item} className="px-6 py-4 bg-primary text-background border border-accent/20 text-sm font-bold uppercase tracking-widest">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </Section>

                            {/* 8. ANTI-CHEATING RULES */}
                            <Section id="anticheat" number="08" title="Anti-Cheating Rules" icon={Scale}>
                                <p className="text-secondary font-medium tracking-widest uppercase text-xs mb-12">These protect you from losses and fraud.</p>
                                
                                <div className="space-y-8">
                                    <RiskCard 
                                        title="Multi-Account Passing" 
                                        desc="If trader passes challenges from Same IP, Same device, or Same browser → Automatic failure."
                                        warning
                                    />
                                    <RiskCard 
                                        title="Passing Using Arbitrage Glitches" 
                                        desc="If trader exploits Wrong price feed, Slippage bugs, Latency issues, or Fill logic errors → Account closed, No payout."
                                        warning
                                    />
                                    <RiskCard 
                                        title="Toxic Order Flow" 
                                        desc="If trader uses Large orders to spoof, Constant order spam, or Ladder filling → Immediate ban."
                                        warning
                                    />
                                    <RiskCard 
                                        title="Hedging Between Two Accounts" 
                                        desc="Example: Account A buys 10 lots, Account B sells 10 lots → Both banned."
                                        warning
                                    />
                                </div>
                            </Section>

                        </div>
                    </div>

                    {/* Final CTA */}
                    <div className="mt-64 py-32 border-t border-black/15/[0.05] text-center bg-surface">
                        <div className="text-[12px] font-bold uppercase tracking-[0.5em] text-secondary mb-8">EXECUTION</div>
                        <h2 className="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase mb-12 text-primary">
                            VALIDATED?
                        </h2>
                        <Link to="/" className="group inline-flex items-center gap-6 px-16 py-6 bg-white text-black font-bold uppercase tracking-[0.3em] text-[14px] hover:bg-accent hover:text-primary transition-colors border border-black/15">
                            PROVE YOUR EDGE
                            <MoveRight className="group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}

function NavAnchor({ href, label }) {
    const handleClick = (e) => {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            setTimeout(() => {
                target.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    };

    return (
        <a 
            href={href} 
            onClick={handleClick}
            className="block py-4 px-6 border-l-2 border-black/15 text-[11px] font-bold uppercase tracking-[0.2em] text-secondary hover:text-primary hover:border-accent transition-all cursor-pointer"
        >
            {label}
        </a>
    );
}

function Section({ id, number, title, icon: Icon, children }) {
    return (
        <section id={id} className="scroll-mt-48 transition-all">
            <div className="flex flex-col gap-8 mb-16">
                <div className="text-accent font-bold text-[14px] uppercase tracking-[0.3em] font-display">
                    [{number}]
                </div>
                <div className="flex items-center justify-between">
                    <h2 className="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase text-primary">{title}</h2>
                    <Icon size={48} className="text-secondary" />
                </div>
                <div className="h-px w-full bg-white/[0.1]" />
            </div>
            {children}
        </section>
    );
}

function RuleBlock({ title, value, desc, accent }) {
    return (
        <div className={`p-10 border ${accent ? 'bg-primary text-background border-primary' : 'bg-surface border-black/15'}`}>
            <div className={`text-[11px] font-bold uppercase tracking-[0.2em] mb-4 ${accent ? 'text-background/70' : 'text-secondary'}`}>{title}</div>
            <div className={`text-6xl font-display font-black mb-4 tracking-tighter ${accent ? 'text-background' : 'text-primary'}`}>{value}</div>
            <p className={`text-sm font-medium ${accent ? 'text-background/80' : 'text-secondary'}`}>{desc}</p>
        </div>
    );
}

function StatItem({ label, value, highlight }) {
    return (
        <div className={`p-8 border border-black/15 bg-surface ${highlight ? 'border-accent' : ''}`}>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-secondary mb-2">{label}</div>
            <div className={`text-3xl font-display font-black ${highlight ? 'text-accent' : 'text-primary'}`}>{value}</div>
        </div>
    );
}

function RiskCard({ title, desc, warning }) {
    return (
        <div className={`p-10 border-l-4 ${warning ? 'border-accent bg-accent/5' : 'border-black/15 bg-surface'}`}>
            <h4 className={`text-2xl font-display font-black mb-4 uppercase ${warning ? 'text-primary' : 'text-primary'}`}>{title}</h4>
            <p className="text-secondary font-medium leading-relaxed max-w-2xl">{desc}</p>
        </div>
    );
}

function FeatureBox({ icon, title, desc }) {
    return (
        <div className="flex gap-8 p-10 bg-surface border border-black/15 group hover:border-accent transition-colors">
            <div className="text-accent group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div>
                <h4 className="font-display font-black text-2xl text-primary uppercase mb-4 tracking-tighter">{title}</h4>
                <p className="text-sm text-secondary leading-relaxed font-medium">{desc}</p>
            </div>
        </div>
    );
}
