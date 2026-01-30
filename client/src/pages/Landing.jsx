import React from 'react';
import { motion } from 'framer-motion';
import {
    TrendingDown,
    AlertTriangle,
    Globe,
    Activity,
    Zap,
    Target,
    BarChart,
    Shield,
    DollarSign,
    CheckCircle2,
    Mail,
    ArrowRight,
    Twitter,
    Linkedin,
    Youtube,
    Heart
} from 'lucide-react';

// --- ANIMATION VARIANTS ---
const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut",
            staggerChildren: 0.15,
            when: "beforeChildren"
        }
    }
};

const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" }
    }
};

// --- REUSABLE COMPONENTS ---

const RevealSection = ({ children, className = "" }) => {
    return (
        <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionVariants}
            className={`min-h-[60vh] flex flex-col items-center justify-center py-20 px-4 md:px-8 relative z-10 ${className}`}
        >
            <div className="max-w-6xl w-full text-center flex flex-col items-center">
                {children}
            </div>
        </motion.section>
    );
};

const ProblemCard = ({ icon: Icon, title, description }) => (
    <div className="bg-[#0a0a0f] border border-white/5 p-8 rounded-2xl hover:border-cyber-cyan/30 transition-all duration-300 text-left h-full group">
        <div className="p-3 bg-cyber-cyan/10 w-fit rounded-lg mb-6 group-hover:bg-cyber-cyan/20 transition-colors">
            <Icon className="w-6 h-6 text-cyber-cyan" />
        </div>
        <h3 className="text-xl font-bold text-white mb-3 font-orb">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed font-mono">
            {description}
        </p>
    </div>
);

const FeatureCard = ({ icon: Icon, title, description }) => (
    <div className="bg-[#0a0a0f] border border-white/5 p-8 rounded-2xl hover:border-cyber-cyan/30 transition-all duration-300 text-left h-full">
        <Icon className="w-8 h-8 text-cyber-cyan mb-6" />
        <h3 className="text-lg font-bold text-white mb-3 font-orb">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed font-mono">
            {description}
        </p>
    </div>
);

const PricingCard = ({ title, price, subtitle, features, isPopular, onSelect }) => (
    <div className={`relative flex-1 bg-[#0a0a0f] border ${isPopular ? 'border-cyber-cyan' : 'border-white/10'} p-8 rounded-2xl flex flex-col items-start w-full max-w-sm hover:transform hover:-translate-y-2 transition-all duration-300`}>
        {isPopular && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyber-cyan text-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Most Popular
            </div>
        )}

        <h3 className={`text-2xl font-bold mb-2 font-orb ${isPopular ? 'text-white' : 'text-white'}`}>{title}</h3>
        <div className="text-3xl font-bold text-cyber-cyan mb-1">{price} <span className="text-sm font-normal text-gray-400">one-time</span></div>
        <p className="text-gray-400 text-sm mb-8 font-mono">{subtitle}</p>

        <button
            onClick={onSelect}
            className={`w-full py-3 mb-8 rounded font-bold uppercase tracking-widest text-sm transition-all ${isPopular
                ? 'bg-cyber-cyan text-black hover:bg-white'
                : 'border border-gray-600 text-white hover:border-cyber-cyan hover:text-cyber-cyan'
                }`}
        >
            Start Challenge →
        </button>

        <ul className="space-y-3 w-full">
            {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-gray-300 font-mono">
                    <CheckCircle2 className="w-4 h-4 text-cyber-cyan shrink-0 mt-0.5" />
                    <span>{feature}</span>
                </li>
            ))}
        </ul>
    </div>
);

// --- NEW COMPONENTS ---

const EarlyAccess = () => (
    <div className="w-full max-w-4xl mx-auto bg-[#0a0a0f] border border-white/5 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden group mt-20">
        {/* Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-cyber-cyan/5 blur-3xl rounded-full opacity-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/20 text-cyber-cyan text-xs font-bold uppercase tracking-wider mb-6">
                ● Limited Early Access Spots
            </span>

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 font-orb">
                Join the Early Access
            </h2>

            <p className="text-gray-400 max-w-xl mb-10 font-mono text-sm leading-relaxed">
                Be the first to use Optivon when we launch. Get exclusive access to beta features and special pricing for early adopters.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mb-10">
                <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="email"
                        placeholder="Enter your email address"
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyber-cyan/50 transition-colors font-mono text-sm"
                    />
                </div>
                <button className="bg-cyber-cyan text-black px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-white transition-colors whitespace-nowrap">
                    Join Waitlist <ArrowRight className="w-4 h-4" />
                </button>
            </div>

            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-xs text-gray-500 font-mono uppercase tracking-wide">
                <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan"></span> Early bird pricing
                </span>
                <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan"></span> Beta access
                </span>
                <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan"></span> Priority support
                </span>
            </div>

            <div className="mt-12 pt-8 border-t border-white/5 w-full text-center">
                <span className="text-cyber-cyan font-bold">1,247</span> <span className="text-gray-500 text-sm">traders already on the waitlist</span>
            </div>
        </div>
    </div>
);

const Footer = () => (
    <footer className="bg-[#050505] border-t border-white/5 pt-20 pb-10 px-6 md:px-12 mt-20 font-sans w-full relative z-10">
        <div className="max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 text-left">
                {/* Brand */}
                <div className="col-span-1">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-cyber-cyan rounded flex items-center justify-center text-black font-bold font-orb text-lg">O</div>
                        <span className="text-2xl font-bold text-white font-orb">Optivon</span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6 font-mono">
                        India's first real-time NIFTY & BANKNIFTY trading simulation and evaluation platform. Practice, evaluate, and earn rewards.
                    </p>
                    <div className="flex gap-4">
                        {[Twitter, Linkedin, Youtube, Mail].map((Icon, i) => (
                            <a key={i} href="#" className="w-10 h-10 rounded bg-white/5 flex items-center justify-center hover:bg-cyber-cyan hover:text-black transition-colors text-gray-400">
                                <Icon className="w-5 h-5" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Links Columns */}
                {[
                    { title: "Product", links: ["Features", "Pricing", "How It Works", "Demo"] },
                    { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
                    { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Risk Disclosure", "Refund Policy"] }
                ].map((col, i) => (
                    <div key={i} className="col-span-1">
                        <h4 className="text-white font-bold mb-6 font-orb tracking-wide">{col.title}</h4>
                        <ul className="space-y-4">
                            {col.links.map(link => (
                                <li key={link}>
                                    <a href="#" className="text-gray-500 hover:text-cyber-cyan text-sm transition-colors">{link}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Disclaimer */}
            <div className="border border-yellow-500/20 bg-yellow-500/5 rounded-lg p-6 mb-12 flex gap-4 items-start text-left">
                <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-yellow-500/80 text-sm leading-relaxed">
                    Disclaimer: Optivon is a simulation platform. No real trading or broking services are provided. All trading is simulated and does not involve real financial instruments or capital.
                </p>
            </div>

            {/* Copyright */}
            <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 font-mono border-t border-white/5 pt-8">
                <div>&copy; 2025 Optivon. All rights reserved.</div>
                <div className="flex items-center gap-1 mt-4 md:mt-0">
                    Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for Indian Traders
                </div>
            </div>
        </div>
    </footer>
);


// --- MAIN PAGE ---
export default function Landing({ onAuthRequest }) {
    return (
        <div className="bg-cyber-black text-white selection:bg-cyber-cyan selection:text-black font-sans relative h-screen overflow-y-auto overflow-x-hidden">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 bg-[#050505] z-0" />
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(0,243,255,0.03)_0%,transparent_70%)] pointer-events-none z-0" />

            {/* 1. HERO SECTION */}
            <RevealSection className="min-h-[85vh]">
                <motion.div variants={childVariants} className="mb-6">
                    <span className="text-cyber-cyan font-mono text-sm tracking-[0.3em] uppercase opacity-80">System Online</span>
                </motion.div>

                <motion.h1 variants={childVariants} className="text-6xl md:text-9xl font-black mb-6 tracking-tighter text-white font-orb">
                    OPTIVON
                </motion.h1>

                <motion.p variants={childVariants} className="text-xl text-gray-400 max-w-2xl font-light leading-relaxed mb-12">
                    The next evolution in proprietary trading technology. <br />
                    Enter the neural simulation. Prove your edge.
                </motion.p>

                <motion.div variants={childVariants}>
                    <button
                        onClick={onAuthRequest}
                        className="px-12 py-5 bg-white text-black font-bold tracking-widest uppercase hover:scale-105 transition-transform duration-300 rounded"
                    >
                        Initialize Protocol
                    </button>
                </motion.div>
            </RevealSection>

            {/* 2. WHY INDIAN TRADERS NEED THIS (Problems) */}
            <RevealSection>
                <motion.h2 variants={childVariants} className="text-3xl md:text-5xl font-bold mb-4 font-orb text-white">
                    Why Indian Traders Need This
                </motion.h2>
                <motion.p variants={childVariants} className="text-gray-400 max-w-2xl mb-16 font-mono text-sm md:text-base">
                    The trading landscape in India presents unique challenges that prevent traders from reaching their full potential.
                </motion.p>

                <motion.div variants={childVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                    <ProblemCard
                        icon={TrendingDown}
                        title="High Trading Costs"
                        description="Real trading involves significant capital risk, brokerage fees, and emotional stress that can wipe out accounts."
                    />
                    <ProblemCard
                        icon={AlertTriangle}
                        title="No Safe Practice Environment"
                        description="Paper trading doesn't reflect real conditions. Live trading with real money is too risky for skill development."
                    />
                    <ProblemCard
                        icon={Globe}
                        title="Foreign Firms Don't Support Indian Markets"
                        description="International prop firms focus on US/EU markets. Indian traders need a platform built for NIFTY & BANKNIFTY."
                    />
                </motion.div>
            </RevealSection>

            {/* 3. PROFESSIONAL TRADING EXPERIENCE (Features) */}
            <RevealSection className="bg-black/20">
                <motion.h2 variants={childVariants} className="text-3xl md:text-5xl font-bold mb-4 font-orb text-white">
                    A Professional Trading Experience — Fully Simulated
                </motion.h2>
                <motion.p variants={childVariants} className="text-gray-400 max-w-2xl mb-16 font-mono text-sm md:text-base">
                    All the tools and features you need to trade like a professional, without risking real capital.
                </motion.p>

                <motion.div variants={childVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    <FeatureCard
                        icon={Activity}
                        title="Real-time NIFTY/BANKNIFTY Data"
                        description="Access live market data feeds with millisecond precision, just like real trading environments."
                    />
                    <FeatureCard
                        icon={Zap}
                        title="Simulated Order Execution"
                        description="Experience realistic order fills with slippage modeling and depth-based execution simulation."
                    />
                    <FeatureCard
                        icon={Target}
                        title="Evaluation Challenges"
                        description="Take structured trading challenges with defined profit targets and risk parameters to prove your skills."
                    />
                    <FeatureCard
                        icon={BarChart}
                        title="P&L Analytics Dashboard"
                        description="Deep insights into your trading performance with detailed metrics, win rates, and risk analysis."
                    />
                    <FeatureCard
                        icon={Shield}
                        title="Risk Checks & Drawdown Limits"
                        description="Built-in risk management rules that mirror professional trading standards and protect capital."
                    />
                    <FeatureCard
                        icon={DollarSign}
                        title="Performance-based Payouts"
                        description="Successful traders earn real rewards based on their simulated trading performance and consistency."
                    />
                </motion.div>
            </RevealSection>

            {/* 4. CHOOSE YOUR EVALUATION CHALLENGE (Pricing) */}
            <RevealSection>
                <motion.h2 variants={childVariants} className="text-3xl md:text-5xl font-bold mb-4 font-orb text-white">
                    Choose Your Evaluation Challenge
                </motion.h2>
                <motion.p variants={childVariants} className="text-gray-400 max-w-2xl mb-16 font-mono text-sm md:text-base">
                    Select the challenge that matches your skill level. Pass the evaluation to earn performance-based rewards.
                </motion.p>

                <motion.div variants={childVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full items-start">
                    <PricingCard
                        title="Starter"
                        price="₹2,999"
                        subtitle="Perfect for beginners testing their skills"
                        features={[
                            "₹1,00,000 simulated capital",
                            "₹8,000 profit target",
                            "5% max drawdown",
                            "30 days duration",
                            "Basic analytics",
                            "Email support"
                        ]}
                        onSelect={onAuthRequest}
                    />
                    <PricingCard
                        title="Intermediate"
                        price="₹5,999"
                        subtitle="For traders ready to scale up"
                        isPopular={true}
                        features={[
                            "₹3,00,000 simulated capital",
                            "₹24,000 profit target",
                            "6% max drawdown",
                            "45 days duration",
                            "Advanced analytics",
                            "Priority support",
                            "Risk management tools"
                        ]}
                        onSelect={onAuthRequest}
                    />
                    <PricingCard
                        title="Advanced"
                        price="₹9,999"
                        subtitle="Maximum capital for experienced traders"
                        features={[
                            "₹5,00,000 simulated capital",
                            "₹40,000 profit target",
                            "7% max drawdown",
                            "60 days duration",
                            "Premium analytics",
                            "24/7 support",
                            "Advanced risk tools",
                            "API access"
                        ]}
                        onSelect={onAuthRequest}
                    />
                </motion.div>
            </RevealSection>

            {/* 5. EARLY ACCESS */}
            <RevealSection>
                <motion.div variants={childVariants}>
                    <EarlyAccess />
                </motion.div>
            </RevealSection>

            {/* 6. FOOTER */}
            <Footer />
        </div>
    );
}
