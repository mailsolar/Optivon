import React, { useState, useEffect } from 'react';
import { ChevronRight, Key, Share2, ArrowRight, X, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { API_BASE_URL } from '../../config';

// Simple Modal for Purchasing Challenge
const PurchaseModal = ({ isOpen, onClose, onPurchase }) => {
    const [selectedLevel, setSelectedLevel] = useState('5L');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const levels = [
        { id: '5L', label: '5L', size: 500000, price: 3000 },
        { id: '10L', label: '10L', size: 1000000, price: 5000 },
        { id: '20L', label: '20L', size: 2000000, price: 12000 },
        { id: '50L', label: '50L', size: 5000000, price: 22000 },
    ];

    const handleBuy = async () => {
        setLoading(true);
        try {
            const selected = levels.find(l => l.id === selectedLevel);
            await onPurchase({ type: selected.label, size: selected.size, price: selected.price });
            onClose();
        } catch (e) {
            // Error handled by parent
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md p-4">
            <div className="bg-surface rounded-premium border border-white/10 w-full max-w-md overflow-hidden shadow-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-muted hover:text-primary transition-colors"><X size={20} /></button>

                <div className="p-10">
                    <div className="mb-8">
                        <div className="text-[10px] font-bold text-accent uppercase tracking-[0.3em] mb-2">Protocol</div>
                        <h2 className="text-2xl font-bold text-primary uppercase tracking-tight">Select Matrix</h2>
                    </div>

                    <div className="space-y-3 mb-10">
                        {levels.map((level) => (
                            <div
                                key={level.id}
                                onClick={() => setSelectedLevel(level.id)}
                                className={`p-5 rounded-instrument border flex justify-between items-center transition-all ${selectedLevel === level.id
                                    ? 'bg-accent/5 border-accent'
                                    : 'bg-background/50 border-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div>
                                    <h4 className={`text-sm font-bold uppercase tracking-widest ${selectedLevel === level.id ? 'text-accent' : 'text-primary'}`}>{level.label} Account</h4>
                                    <p className="text-[10px] text-muted uppercase tracking-widest font-bold mt-1">Allocation: ₹{level.size.toLocaleString('en-IN')}</p>
                                    <p className="text-sm font-bold text-primary mt-2">₹{level.price.toLocaleString('en-IN')}</p>
                                </div>
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${selectedLevel === level.id ? 'border-accent bg-accent' : 'border-white/10'
                                    }`}>
                                    {selectedLevel === level.id && <div className="w-2.5 h-2.5 bg-background rounded-full" />}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleBuy}
                        disabled={loading}
                        className="w-full bg-accent text-background font-bold py-4 rounded-instrument uppercase tracking-[0.3em] text-[11px] hover:bg-primary transition-all disabled:opacity-50 shadow-soft"
                    >
                        {loading ? 'Processing...' : 'Initialize Allocation'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function AccountsOverview() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPurchase, setShowPurchase] = useState(false);

    const fetchAccounts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/trade/accounts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAccounts(data);
            }
        } catch (e) {
            console.error("Failed to fetch accounts", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handlePurchase = async (pkg) => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/trade/purchase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(pkg)
        });

        const data = await res.json();

        if (res.ok) {
            addToast('Challenge Purchased Successfully', 'success');
            fetchAccounts();
        } else {
            addToast(data.error || 'Purchase Failed', 'error');
            throw new Error(data.error);
        }
    };

    const handleLaunch = async (acc) => {
        if (acc.status === 'pending') {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/trade/launch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ accountId: acc.id })
            });

            if (res.ok) {
                navigate('/terminal', { state: { account: acc } });
            } else {
                const data = await res.json();
                addToast(data.error, 'error');
            }
        } else if (acc.status === 'active') {
            navigate('/terminal', { state: { account: acc } });
        }
    };

    return (
        <div className="flex flex-col gap-10 h-full font-sans">
            {/* Main Content */}
            <div className="flex-1 min-w-0 flex flex-col gap-10">

                {/* Hero Card */}
                <div className="relative rounded-premium p-12 overflow-hidden bg-surface border border-white/5 shadow-2xl">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none" />

                    <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
                        <div className="max-w-xl">
                            <div className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] mb-4">Protocol Evaluation</div>
                            <h3 className="text-3xl font-bold text-primary mb-4 uppercase tracking-tight">Accelerated Capital Access</h3>
                            <p className="text-secondary font-medium text-sm leading-relaxed mb-8">
                                Deploy institutional-grade strategies on up to ₹50L capital. 
                                Our precision environment rewards execution excellence.
                            </p>
                            <div className="flex gap-4">
                                {['Zero Commision', 'Direct Execution', 'Smart Payouts'].map((tag, i) => (
                                    <div key={i} className="px-4 py-2 bg-background/50 rounded-full border border-white/5 text-[9px] font-bold uppercase tracking-widest text-muted">
                                        {tag}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={() => setShowPurchase(true)}
                            className="flex items-center gap-4 bg-accent text-background px-8 py-4 rounded-instrument font-bold text-[11px] uppercase tracking-[0.3em] transition-all hover:bg-primary shadow-soft group"
                        >
                            Start Evaluation
                            <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-surface rounded-premium border border-white/5 flex flex-col flex-1 min-h-[400px] overflow-hidden shadow-2xl">
                    <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-surface/50 backdrop-blur-md">
                        <div className="flex flex-col gap-1">
                            <div className="text-[10px] font-bold text-muted uppercase tracking-[0.3em]">Historical Log</div>
                            <h3 className="text-xl font-bold text-primary uppercase tracking-tight flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-accent rounded-full"></span>
                                Matrix Instances
                            </h3>
                        </div>
                    </div>

                    <div className="overflow-x-auto flex-1 px-4">
                        {loading ? (
                            <div className="p-20 text-center text-muted font-bold text-[10px] uppercase tracking-widest animate-pulse">Initializing Link...</div>
                        ) : accounts.length === 0 ? (
                            <div className="p-20 text-center text-muted font-medium text-sm">
                                No active instances detected. Initialize a protocol to begin.
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[10px] text-muted uppercase tracking-[0.3em] border-b border-white/5">
                                        <th className="px-6 py-6 font-bold">Protocol ID / Program</th>
                                        <th className="px-6 py-6 font-bold">Net Balance</th>
                                        <th className="px-6 py-6 font-bold">Temporal Sync</th>
                                        <th className="px-6 py-6 font-bold text-center">Status</th>
                                        <th className="px-6 py-6 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.03]">
                                    {accounts.map((acc, i) => (
                                        <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-8">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">#{acc.id.toString().padStart(6, '0')}</span>
                                                    <span className="text-base font-bold text-primary uppercase">{acc.type}</span>
                                                    <span className="text-[10px] text-muted font-bold uppercase tracking-wider">₹{acc.size.toLocaleString('en-IN')} ALLOCATION</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-8">
                                                <div className="flex flex-col">
                                                    <span className="text-2xl font-bold text-primary tracking-tighter">
                                                        ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </span>
                                                    <div className="text-[9px] text-accent font-bold uppercase tracking-widest mt-1">Live Feed</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-8">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-bold text-secondary uppercase tracking-tighter">
                                                        {new Date(acc.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                    {acc.session_expires && (
                                                        <span className="text-[9px] text-red-400 font-bold uppercase tracking-widest">Expires in {Math.floor((new Date(acc.session_expires) - new Date()) / 3600000)}H</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-8 text-center">
                                                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border
                                                    ${(acc.status === 'failed' || acc.status === 'expired') ? 'bg-red-400/5 text-red-400 border-red-400/20' :
                                                        acc.status === 'active' ? 'bg-accent/5 text-accent border-accent/20' :
                                                            'bg-white/5 text-muted border-white/10'}
                                                `}>
                                                    {acc.status === 'active' && <div className="w-1 h-1 bg-accent rounded-full animate-pulse" />}
                                                    {acc.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-8 text-right">
                                                {(acc.status === 'pending' || acc.status === 'active') ? (
                                                    <button
                                                        onClick={() => handleLaunch(acc)}
                                                        className="px-6 py-3 bg-background border border-white/10 text-primary hover:border-accent hover:text-accent rounded-instrument font-bold text-[10px] uppercase tracking-[0.3em] transition-all flex items-center gap-3 ml-auto"
                                                    >
                                                        {acc.status === 'pending' ? 'Initiate' : 'Terminal'} <ArrowRight size={14} />
                                                    </button>
                                                ) : (
                                                    <Link to={`/dashboard/account/${acc.id}`} className="px-6 py-3 bg-white/5 text-muted hover:text-primary rounded-instrument font-bold text-[10px] uppercase tracking-[0.3em] transition-all flex items-center gap-3 ml-auto">
                                                        Metrics <ArrowRight size={14} />
                                                    </Link>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            <PurchaseModal
                isOpen={showPurchase}
                onClose={() => setShowPurchase(false)}
                onPurchase={handlePurchase}
            />
        </div>
    );
}
