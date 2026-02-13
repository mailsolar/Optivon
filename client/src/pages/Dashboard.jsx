import React, { useEffect, useState } from 'react';
import TerminalLayout from '../components/Terminal/TerminalLayout';
import { useToast } from '../context/ToastContext';
import { AlertProvider } from '../context/AlertContext';
import { CheckCircle2, Terminal, Plus, ArrowRight, Activity, ShieldCheck, Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Dashboard({ user, onLogout }) {
    return <DashboardContent user={user} onLogout={onLogout} />;
}

// Reused & Adapted Pricing Component
const PricingCard = ({ title, price, subtitle, features, isPopular, onSelect }) => (
    <div className={`relative flex-1 bg-surface border ${isPopular ? 'border-accent' : 'border-border'} p-8 rounded-3xl flex flex-col items-start w-full hover:border-accent/80 transition-all duration-300 group overflow-hidden ${isPopular ? 'bg-gradient-to-b from-surface to-accent/5' : ''}`}>
        {isPopular && (
            <div className="absolute top-0 right-0 bg-accent text-white px-4 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-wider">
                Most Popular
            </div>
        )}

        <h3 className="text-2xl font-black mb-2 text-primary tracking-tight">{title}</h3>
        <div className="text-3xl font-black text-accent mb-1 font-mono tracking-tight">{price} <span className="text-xs font-bold text-secondary tracking-normal">/ one-time</span></div>
        <p className="text-secondary text-xs mb-8 font-medium">{subtitle}</p>

        <button
            onClick={onSelect}
            className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-transform hover:scale-[1.02] active:scale-[0.98] ${isPopular
                ? 'bg-accent text-brand-dark shadow-lg shadow-accent/20'
                : 'bg-primary text-background group-hover:bg-accent group-hover:text-brand-dark'
                }`}
        >
            Select Protocol
        </button>

        <ul className="space-y-4 w-full flex-1 mt-8">
            {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs text-secondary font-medium">
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                    <span>{feature}</span>
                </li>
            ))}
        </ul>
    </div>
);

function DashboardContent({ user, onLogout }) {
    const [accounts, setAccounts] = useState([]);
    const [selectedAccountId, setSelectedAccountId] = useState(null);
    const [quotes, setQuotes] = useState({ NIFTY: null, BANKNIFTY: null });
    const { addToast } = useToast();
    const { theme } = useTheme();

    // View State
    const [activeTab, setActiveTab] = useState('overview'); // overview, terminal, challenges
    const [loading, setLoading] = useState(true);

    // Computed Active Account
    const activeAccount = accounts.find(a => a.id === parseInt(selectedAccountId));

    const fetchAccounts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/trade/accounts', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setAccounts(data);
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
        const interval = setInterval(fetchAccounts, 5000);
        return () => clearInterval(interval);
    }, []);

    // SSE Stream
    useEffect(() => {
        const eventSource = new EventSource('/api/market/stream');
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

    const handlePurchase = async (type, size) => {
        try {
            const res = await fetch('/api/trade/purchase', {
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
                setActiveTab('overview');
            } else {
                addToast('Purchase Failed', 'error');
            }
        } catch (e) { addToast('Purchase Failed', 'error'); }
    };

    const handleLaunch = async (accId) => {
        try {
            const res = await fetch('/api/trade/launch', {
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
                setSelectedAccountId(accId);
                setActiveTab('terminal');
            } else {
                addToast('Launch Failed', 'error');
            }
        } catch (e) { addToast('Launch Failed', 'error'); }
    };

    if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-accent font-black animate-pulse tracking-widest text-xs uppercase">System Initializing...</div>;

    const handleAccountSwitch = (e) => {
        const newId = e.target.value;
        setSelectedAccountId(newId);
    };

    return (
        <div className="flex flex-col h-screen bg-background text-primary font-sans overflow-hidden transition-colors duration-300">
            {/* TOP BAR */}
            <header className="h-16 border-b border-border bg-surface/50 backdrop-blur-md flex items-center justify-between px-6 z-20 shrink-0">
                <div className="flex items-center gap-8">
                    <h1 className="text-xl font-black tracking-tighter text-primary">OPTIVON <span className="text-accent">COMMAND</span></h1>

                    {/* Account Switcher */}
                    {accounts.length > 0 && (
                        <div className="flex items-center gap-3 bg-surface px-3 py-1.5 rounded-lg border border-border group hover:border-accent/50 transition-colors">
                            <span className="text-[9px] text-secondary font-black tracking-widest uppercase group-hover:text-primary transition-colors">Active Link</span>
                            <div className="h-4 w-px bg-border"></div>
                            <select
                                value={selectedAccountId || ''}
                                onChange={handleAccountSwitch}
                                className="bg-transparent text-xs font-mono font-bold text-accent outline-none border-none cursor-pointer"
                            >
                                {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id} className="bg-brand-dark text-white">
                                        #{acc.id} • {acc.type}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Nav Tabs & Logout */}
                <div className="flex items-center gap-4">
                    <div className="flex bg-surface p-1 rounded-xl border border-border">
                        {[
                            { id: 'overview', label: 'Dashboard' },
                            { id: 'terminal', label: 'Terminal' },
                            { id: 'challenges', label: 'New Challenge' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg ${activeTab === tab.id ? 'bg-accent text-brand-dark shadow-md' : 'text-secondary hover:text-white'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={onLogout}
                        className="px-5 py-3 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                    >
                        Disconnect
                    </button>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 overflow-hidden relative">
                <AlertProvider quotes={quotes}>

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="h-full overflow-y-auto p-8 max-w-[1600px] mx-auto w-full relative z-10">
                            {accounts.length === 0 ? (
                                <div className="text-center py-32 flex flex-col items-center">
                                    <div className="w-20 h-20 bg-surface border border-border rounded-3xl flex items-center justify-center mb-6 text-accent">
                                        <Activity className="w-10 h-10" />
                                    </div>
                                    <h2 className="text-3xl font-black text-primary mb-2">No Active Protocols</h2>
                                    <p className="text-secondary max-w-sm mb-8">Initialize your first evaluation challenge to access the trading terminal.</p>
                                    <button onClick={() => setActiveTab('challenges')} className="px-8 py-4 bg-primary text-background rounded-full font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform">
                                        Start Evaluation
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between border-b border-border pb-6">
                                        <div>
                                            <h2 className="text-2xl font-black text-primary tracking-tight">Active Sessions</h2>
                                            <p className="text-secondary text-sm font-medium mt-1">Monitor all your accounts in real-time.</p>
                                        </div>
                                        <button onClick={() => setActiveTab('challenges')} className="flex items-center gap-2 px-4 py-2 bg-surface text-primary border border-border rounded-xl font-bold text-xs uppercase hover:border-accent hover:text-accent transition-all">
                                            <Plus className="w-4 h-4" /> New Account
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {accounts.map(acc => (
                                            <div key={acc.id} className="bg-surface border border-border p-8 rounded-3xl flex flex-col justify-between hover:border-accent/40 transition-all group relative overflow-hidden h-[300px]">
                                                {/* Background Accent */}
                                                <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full opacity-10 pointer-events-none transition-colors ${acc.equity >= acc.balance ? 'bg-green-500' : 'bg-red-500'}`}></div>

                                                <div className="flex justify-between items-start z-10">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="text-3xl font-black font-mono text-primary">#{acc.id}</span>
                                                            <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider ${acc.status === 'active' ? 'bg-green-500/10 text-green-500' :
                                                                acc.status === 'failed' || acc.status === 'expired' ? 'bg-red-500/10 text-red-500' :
                                                                    'bg-yellow-500/10 text-yellow-500'
                                                                }`}>
                                                                {acc.status}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">{acc.type} Protocol</span>
                                                    </div>
                                                    <div className="w-10 h-10 border border-border rounded-xl flex items-center justify-center text-primary bg-background shadow-sm">
                                                        <Terminal className="w-5 h-5" />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-8 my-6 z-10">
                                                    <div>
                                                        <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">Equity</p>
                                                        <p className={`text-2xl font-black font-mono tracking-tight ${acc.equity >= acc.balance ? 'text-green-500' : 'text-red-500'}`}>${acc.equity.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">Balance</p>
                                                        <p className="text-2xl font-black font-mono tracking-tight text-primary">${acc.balance.toLocaleString()}</p>
                                                    </div>
                                                </div>

                                                <div className="z-10 mt-auto">
                                                    {acc.status === 'active' && (
                                                        <button
                                                            onClick={() => { setSelectedAccountId(acc.id); setActiveTab('terminal'); }}
                                                            className="w-full py-4 bg-primary text-background font-bold uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 group-hover:gap-4 transition-all"
                                                        >
                                                            Enter Terminal <ArrowRight className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {acc.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleLaunch(acc.id)}
                                                            className="w-full py-4 bg-accent text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all"
                                                        >
                                                            Launch Session
                                                        </button>
                                                    )}
                                                    {(acc.status === 'failed' || acc.status === 'expired') && (
                                                        <button className="w-full py-4 bg-surface border border-border text-red-500 font-bold uppercase tracking-widest text-xs rounded-xl cursor-not-allowed opacity-50">
                                                            Account Closed
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
                        <div className="h-full flex flex-col items-center justify-center gap-4 text-secondary">
                            <ShieldCheck className="w-12 h-12 text-border" />
                            <p className="font-medium text-sm">Select an active account from the dashboard to initialize the terminal.</p>
                        </div>
                    )}

                    {/* CHALLENGES TAB */}
                    {activeTab === 'challenges' && (
                        <div className="h-full overflow-y-auto p-8 relative z-10 flex flex-col items-center justify-center">
                            <div className="text-center mb-12 mt-10">
                                <h2 className="text-4xl font-black text-primary font-display mb-4">INITIATE PROTOCOL</h2>
                                <p className="text-secondary font-medium text-sm max-w-lg mx-auto leading-relaxed">Select the challenge that matches your skill level. Pass the evaluation to earn performance-based rewards.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl w-full px-4 mb-20 mx-auto">
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
                </AlertProvider>
            </main>
        </div>
    );
}

const StatBox = ({ label, value, color, isActive }) => (
    <div className={`p-4 border rounded-xl backdrop-blur-sm transition-all ${isActive ? 'border-accent bg-accent/5 shadow-sm' : 'border-border bg-surface'}`}>
        <div className="text-[10px] text-secondary mb-1 uppercase tracking-widest font-black">{label}</div>
        <div className={`text-xl font-black font-mono tracking-tight ${color || 'text-primary'}`}>
            ${value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
    </div>
);

