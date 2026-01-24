
import React, { useEffect, useState } from 'react';
import Terminal from '../components/Terminal'; // Ensure this points to index.js which exports TerminalLayout?? No, usually default export
import TerminalLayout from '../components/Terminal/TerminalLayout'; // Direct import to be safe
import Settings from '../components/Settings';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export default function Dashboard({ user }) {
    return <DashboardContent user={user} />;
}

// Reused & Adapted Pricing Component from Landing
const PricingCard = ({ title, price, subtitle, features, isPopular, onSelect }) => (
    <div className={`relative flex-1 bg-[#0a0a0f] border ${isPopular ? 'border-cyber-cyan' : 'border-white/10'} p-6 rounded-2xl flex flex-col items-start w-full hover:transform hover:-translate-y-2 transition-all duration-300 group`}>
        {isPopular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyber-cyan text-black px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(0,243,255,0.4)]">
                Most Popular
            </div>
        )}

        <h3 className={`text-xl font-bold mb-2 font-orb ${isPopular ? 'text-white' : 'text-white'}`}>{title}</h3>
        <div className="text-2xl font-bold text-cyber-cyan mb-1">{price} <span className="text-xs font-normal text-gray-400">one-time</span></div>
        <p className="text-gray-400 text-xs mb-6 font-mono">{subtitle}</p>

        <button
            onClick={onSelect}
            className={`w-full py-3 mb-6 rounded font-bold uppercase tracking-widest text-xs transition-all ${isPopular
                ? 'bg-cyber-cyan text-black hover:bg-white hover:scale-[1.02]'
                : 'border border-gray-600 text-white hover:border-cyber-cyan hover:text-cyber-cyan'
                }`}
        >
            Select Protocol
        </button>

        <ul className="space-y-2 w-full flex-1">
            {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-gray-300 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyber-cyan shrink-0 mt-0.5" />
                    <span>{feature}</span>
                </li>
            ))}
        </ul>
    </div>
);

function DashboardContent({ user }) {
    const [accounts, setAccounts] = useState([]);
    const [selectedAccountId, setSelectedAccountId] = useState(null);
    const [quotes, setQuotes] = useState({ NIFTY: null, BANKNIFTY: null });
    const { addToast } = useToast();

    // View State
    const [activeTab, setActiveTab] = useState('overview'); // overview, terminal, challenges
    const [loading, setLoading] = useState(true);

    // Computed Active Account
    const activeAccount = accounts.find(a => a.id === parseInt(selectedAccountId));

    const fetchAccounts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/trade/accounts', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setAccounts(data);
                // Auto-select first account if none selected
                if (!selectedAccountId && data.length > 0) {
                    setSelectedAccountId(data[0].id);
                }
            }
        } catch (e) {
            console.error("Failed to fetch accounts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
        const interval = setInterval(fetchAccounts, 5000); // Polling for updates
        return () => clearInterval(interval);
    }, []);

    // SSE Stream
    useEffect(() => {
        const eventSource = new EventSource('http://localhost:5000/api/market/stream');
        eventSource.onmessage = (event) => {
            try {
                const tick = JSON.parse(event.data);
                if (tick && tick.symbol) {
                    setQuotes(prev => ({ ...prev, [tick.symbol]: tick }));
                }
            } catch (e) { console.warn("SSE Parse Error"); }
        };
        return () => eventSource.close();
    }, []);

    // Handlers
    const handlePurchase = async (type, size) => {
        try {
            const res = await fetch('http://localhost:5000/api/trade/purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ type, size })
            });
            if (res.ok) {
                addToast(`Purchased ${type} Challenge`, 'success');
                fetchAccounts();
                setActiveTab('overview'); // Go back to list
            } else {
                addToast('Purchase Failed', 'error');
            }
        } catch (e) { addToast('Purchase Failed', 'error'); }
    };

    const handleLaunch = async (accId) => {
        try {
            const res = await fetch('http://localhost:5000/api/trade/launch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ accountId: accId })
            });
            if (res.ok) {
                addToast('Session Launched', 'success');
                fetchAccounts();
                // Ensure we select this account and go to terminal
                setSelectedAccountId(accId);
                setActiveTab('terminal');
            } else {
                addToast('Launch Failed', 'error');
            }
        } catch (e) { addToast('Launch Failed', 'error'); }
    };

    if (loading) return <div className="min-h-screen bg-cyber-black flex items-center justify-center text-cyber-cyan font-mono animate-pulse">SYSTEM LOADING...</div>;

    // Derived Logic for Account Switcher
    const handleAccountSwitch = (e) => {
        const newId = e.target.value;
        setSelectedAccountId(newId);
    };

    return (
        <div className="flex flex-col h-screen bg-[#050505] text-white font-sans overflow-hidden">
            {/* TOP BAR */}
            <header className="h-16 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-6 z-20">
                <div className="flex items-center gap-8">
                    <h1 className="text-2xl font-black font-orb tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan to-white">OPTIVON</h1>

                    {/* Account Switcher */}
                    {accounts.length > 0 && (
                        <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded border border-white/10">
                            <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Active Link</span>
                            <select
                                value={selectedAccountId || ''}
                                onChange={handleAccountSwitch}
                                className="bg-transparent text-sm font-mono text-cyber-cyan outline-none border-none cursor-pointer"
                            >
                                {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id} className="bg-black text-gray-300">
                                        #{acc.id} - {acc.type} (${acc.balance.toLocaleString()}) - {acc.status.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Nav Tabs */}
                <div className="flex bg-black/50 p-1 rounded-lg border border-white/5">
                    {[
                        { id: 'overview', label: 'Command Center' },
                        { id: 'terminal', label: 'Terminal Matrix' },
                        { id: 'challenges', label: 'New Protocol' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all rounded ${activeTab === tab.id ? 'bg-cyber-cyan text-black shadow-[0_0_10px_rgba(0,243,255,0.4)]' : 'text-gray-500 hover:text-white'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 overflow-hidden relative">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20"></div>

                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="h-full overflow-y-auto p-8 max-w-7xl mx-auto w-full relative z-10">
                        {accounts.length === 0 ? (
                            <div className="text-center py-20">
                                <h2 className="text-2xl text-gray-500 font-orb mb-4">NO ACTIVE PROTOCOLS</h2>
                                <button onClick={() => setActiveTab('challenges')} className="text-cyber-cyan underline underline-offset-4 hover:text-white">Initialize a Challenge</button>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <h2 className="text-xl font-bold font-orb text-white/50 tracking-widest border-b border-white/5 pb-4">ACTIVE SESSIONS</h2>
                                <div className="grid gap-6">
                                    {accounts.map(acc => (
                                        <div key={acc.id} className="bg-white/5 border border-white/10 p-6 rounded-xl flex flex-col md:flex-row items-center justify-between hover:border-cyber-cyan/30 transition-colors">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl font-black font-orb text-white">#{acc.id}</span>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${acc.status === 'active' ? 'border-green-500/50 text-green-400 bg-green-500/10' :
                                                        acc.status === 'failed' || acc.status === 'expired' ? 'border-red-500/50 text-red-400 bg-red-500/10' :
                                                            'border-yellow-500/50 text-yellow-400 bg-yellow-500/10'
                                                        }`}>
                                                        {acc.status.toUpperCase()}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-gray-500 font-mono">{acc.type} Protocol • ${acc.size.toLocaleString()}</span>
                                            </div>

                                            <div className="flex gap-12 font-mono text-sm py-4 md:py-0">
                                                <div className="flex flex-col">
                                                    <span className="text-gray-500 text-[10px] uppercase">Equity</span>
                                                    <span className="text-white font-bold text-lg">${acc.equity.toLocaleString()}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-gray-500 text-[10px] uppercase">Balance</span>
                                                    <span className="text-gray-300">${acc.balance.toLocaleString()}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-4">
                                                {acc.status === 'active' && (
                                                    <button
                                                        onClick={() => { setSelectedAccountId(acc.id); setActiveTab('terminal'); }}
                                                        className="px-6 py-2 bg-white text-black font-bold uppercase tracking-wider text-xs rounded hover:scale-105 transition-transform"
                                                    >
                                                        Access Terminal
                                                    </button>
                                                )}
                                                {acc.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleLaunch(acc.id)}
                                                        className="px-6 py-2 bg-cyber-cyan text-black font-bold uppercase tracking-wider text-xs rounded shadow-[0_0_15px_rgba(0,243,255,0.3)] hover:scale-105 transition-transform"
                                                    >
                                                        Launch Session
                                                    </button>
                                                )}
                                                {(acc.status === 'failed' || acc.status === 'expired') && (
                                                    <button className="px-6 py-2 border border-red-500/30 text-red-500 font-bold uppercase tracking-wider text-xs rounded cursor-not-allowed opacity-50">
                                                        Terminated
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TERMINAL TAB */}
                {activeTab === 'terminal' && activeAccount && (
                    <TerminalLayout
                        key={activeAccount.id} // Force remount on account switch
                        user={user}
                        quotes={quotes}
                        account={activeAccount}
                        onTrade={fetchAccounts}
                    />
                )}
                {activeTab === 'terminal' && !activeAccount && (
                    <div className="h-full flex items-center justify-center text-gray-500 font-mono">
                        Select an active account to initialize terminal.
                    </div>
                )}

                {/* CHALLENGES TAB */}
                {activeTab === 'challenges' && (
                    <div className="h-full overflow-y-auto p-8 relative z-10 flex flex-col items-center justify-center">
                        <div className="text-center mb-10 mt-10">
                            <h2 className="text-3xl font-bold text-white mb-2 font-orb">INITIATE NEW PROTOCOL</h2>
                            <p className="text-gray-400 font-mono text-sm max-w-lg mx-auto">Select the challenge that matches your skill level. Pass the evaluation to earn performance-based rewards.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full px-4 mb-20">
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
                                onSelect={() => handlePurchase('Starter', 100000)}
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
                                onSelect={() => handlePurchase('Intermediate', 300000)}
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
                                onSelect={() => handlePurchase('Advanced', 500000)}
                            />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

const StatBox = ({ label, value, color, isActive }) => (
    <div className={`p-4 border rounded-xl backdrop-blur-sm transition-all ${isActive ? 'border-cyber-cyan bg-cyber-cyan/5 shadow-[0_0_15px_rgba(0,243,255,0.1)]' : 'border-white/10 bg-black/40'}`}>
        <div className="text-[10px] text-gray-400 mb-1 uppercase tracking-widest font-bold">{label}</div>
        <div className={`text-xl font-bold font-mono tracking-tight ${color || 'text-white'}`}>
            ${value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
    </div>
);
