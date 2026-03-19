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
    <div className={`relative flex-1 bg-surface border ${isPopular ? 'border-accent shadow-[0_0_20px_rgba(197,0,34,0.15)]' : 'border-white/10'} p-8 rounded-none flex flex-col items-start w-full hover:border-accent/80 transition-all duration-300 group overflow-hidden ${isPopular ? 'bg-accent/5' : ''}`}>
        {isPopular && (
            <div className="absolute top-0 right-0 bg-accent text-white px-4 py-1.5 rounded-none text-[10px] font-bold uppercase tracking-widest font-display">
                Most Popular
            </div>
        )}

        <h3 className="text-4xl font-display font-black mb-2 text-white uppercase tracking-tighter">{title}</h3>
        <div className="text-3xl font-black text-accent mb-1 font-mono tracking-tighter">{price} <span className="text-xs font-bold text-secondary tracking-widest uppercase">/ one-time</span></div>
        <p className="text-secondary text-xs mb-8 font-medium font-display uppercase tracking-widest">{subtitle}</p>

        <button
            onClick={onSelect}
            className={`w-full py-4 rounded-none font-bold uppercase tracking-widest text-[11px] transition-transform hover:scale-[1.02] active:scale-[0.98] ${isPopular
                ? 'bg-accent text-white shadow-lg shadow-accent/20'
                : 'bg-white text-black group-hover:bg-accent group-hover:text-white'
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
            <header className="h-16 border-b border-white/10 bg-surface/80 backdrop-blur-md flex items-center justify-between px-6 z-20 shrink-0">
                <div className="flex items-center gap-8">
                    <h1 className="text-xl font-display font-black tracking-tighter text-white uppercase">OPTIVON <span className="text-accent">COMMAND</span></h1>

                    {/* Account Switcher */}
                    {accounts.length > 0 && (
                        <div className="flex items-center gap-3 bg-background px-3 py-1.5 border border-white/10 group hover:border-accent/50 transition-colors">
                            <span className="text-[9px] text-muted font-bold tracking-widest uppercase group-hover:text-white transition-colors">Active Link</span>
                            <div className="h-4 w-px bg-white/10"></div>
                            <select
                                value={selectedAccountId || ''}
                                onChange={handleAccountSwitch}
                                className="bg-transparent text-xs font-mono font-bold text-accent outline-none border-none cursor-pointer"
                            >
                                {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id} className="bg-surface text-primary">
                                        #{acc.id} • {acc.type}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Nav Tabs & Logout */}
                <div className="flex items-center gap-4">
                    <div className="flex bg-background p-1 border border-white/10">
                        {[
                            { id: 'overview', label: 'Dashboard' },
                            { id: 'terminal', label: 'Terminal' },
                            { id: 'challenges', label: 'New Challenge' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-5 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-accent text-white shadow-soft' : 'text-muted hover:text-white'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={onLogout}
                        className="px-5 py-3 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest"
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
                                    <div className="w-20 h-20 bg-surface border border-white/10 flex items-center justify-center mb-6 text-accent">
                                        <Activity className="w-10 h-10" />
                                    </div>
                                    <h2 className="text-4xl font-display font-black text-white mb-2 uppercase tracking-tighter">No Active Protocols</h2>
                                    <p className="text-secondary max-w-sm mb-8 font-medium">Initialize your first evaluation challenge to access the trading terminal.</p>
                                    <button onClick={() => setActiveTab('challenges')} className="px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-accent hover:text-white transition-colors">
                                        Start Evaluation
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-6">
                                        <div>
                                            <h2 className="text-4xl font-display font-black text-white tracking-tighter uppercase">Active Sessions</h2>
                                            <p className="text-secondary text-sm font-medium mt-1">Monitor all your accounts in real-time.</p>
                                        </div>
                                        <button onClick={() => setActiveTab('challenges')} className="flex items-center gap-2 px-6 py-3 bg-surface text-white border border-white/10 font-bold text-xs uppercase hover:border-accent hover:text-accent transition-all">
                                            <Plus className="w-4 h-4" /> New Account
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {accounts.map(acc => (
                                            <div key={acc.id} className="bg-surface border border-white/10 p-8 flex flex-col justify-between hover:border-accent/40 transition-all group relative overflow-hidden h-[300px]">
                                                {/* Background Accent */}
                                                <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full opacity-10 pointer-events-none transition-colors ${acc.equity >= acc.balance ? 'bg-green-500' : 'bg-red-500'}`}></div>

                                                <div className="flex justify-between items-start z-10">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="text-4xl font-black font-display text-white tracking-tighter">#{acc.id}</span>
                                                            <span className={`text-[9px] font-bold px-2 py-1 uppercase tracking-wider ${acc.status === 'active' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                                                acc.status === 'failed' || acc.status === 'expired' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                                                    'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                                                }`}>
                                                                {acc.status}
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-muted uppercase tracking-widest font-display">{acc.type} Protocol</span>
                                                    </div>
                                                    <div className="w-10 h-10 border border-white/10 flex items-center justify-center text-white bg-background shadow-sm">
                                                        <Terminal className="w-5 h-5" />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-8 my-6 z-10">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-muted uppercase tracking-widest font-display mb-1">Equity</p>
                                                        <p className={`text-3xl font-black font-mono tracking-tighter ${acc.equity >= acc.balance ? 'text-green-500' : 'text-red-500'}`}>${acc.equity.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-muted uppercase tracking-widest font-display mb-1">Balance</p>
                                                        <p className="text-3xl font-black font-mono tracking-tighter text-white">${acc.balance.toLocaleString()}</p>
                                                    </div>
                                                </div>

                                                <div className="z-10 mt-auto">
                                                    {acc.status === 'active' && (
                                                        <button
                                                            onClick={() => { setSelectedAccountId(acc.id); setActiveTab('terminal'); }}
                                                            className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-accent hover:text-white transition-colors"
                                                        >
                                                            Enter Terminal <ArrowRight className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {acc.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleLaunch(acc.id)}
                                                            className="w-full py-4 bg-accent text-white font-bold uppercase tracking-widest text-xs shadow-[0_0_15px_rgba(197,0,34,0.3)] hover:bg-accent/90 transition-all"
                                                        >
                                                            Launch Session
                                                        </button>
                                                    )}
                                                    {(acc.status === 'failed' || acc.status === 'expired') && (
                                                        <button className="w-full py-4 bg-surface border border-white/10 text-red-500 font-bold uppercase tracking-widest text-xs cursor-not-allowed opacity-50">
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
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-full px-4 mb-20">
                                <PricingCard
                                    title="5L Account"
                                    price="₹3,000"
                                    subtitle="Starter Tier"
                                    features={[
                                        "₹5,00,000 simulated capital",
                                        "3 Max Lots",
                                        "₹40,000 profit target",
                                        "3% max drawdown",
                                        "No Time Limit",
                                        "Basic Support"
                                    ]}
                                    onSelect={() => handlePurchase('5L', 500000)}
                                />
                                <PricingCard
                                    title="10L Account"
                                    price="₹5,000"
                                    subtitle="Standard Tier"
                                    isPopular={true}
                                    features={[
                                        "₹10,00,000 simulated capital",
                                        "5 Max Lots",
                                        "₹80,000 profit target",
                                        "3% max drawdown",
                                        "No Time Limit",
                                        "Priority Support"
                                    ]}
                                    onSelect={() => handlePurchase('10L', 1000000)}
                                />
                                <PricingCard
                                    title="20L Account"
                                    price="₹12,000"
                                    subtitle="Pro Tier"
                                    features={[
                                        "₹20,00,000 simulated capital",
                                        "8 Max Lots",
                                        "₹1.6L profit target",
                                        "3% max drawdown",
                                        "No Time Limit",
                                        "Dedicated Manager"
                                    ]}
                                    onSelect={() => handlePurchase('20L', 2000000)}
                                />
                                <PricingCard
                                    title="50L Account"
                                    price="₹22,000"
                                    subtitle="Elite Tier"
                                    features={[
                                        "₹50,00,000 simulated capital",
                                        "12 Max Lots",
                                        "₹4L profit target",
                                        "3% max drawdown",
                                        "No Time Limit",
                                        "Direct API Access"
                                    ]}
                                    onSelect={() => handlePurchase('50L', 5000000)}
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
            ₹{value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
    </div>
);

