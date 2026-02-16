
import React, { useState, useEffect } from 'react';
import { ChevronRight, Key, Share2, ArrowRight, X, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { API_BASE_URL } from '../../config';

// Simple Modal for Purchasing Challenge
const PurchaseModal = ({ isOpen, onClose, onPurchase }) => {
    const [selectedLevel, setSelectedLevel] = useState('5k');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const levels = [
        { id: '5L', label: '5L', size: 500000, price: 3000, color: 'text-brand-lime' },
        { id: '10L', label: '10L', size: 1000000, price: 5000, color: 'text-brand-blue' },
        { id: '20L', label: '20L', size: 2000000, price: 12000, color: 'text-purple-400' },
        { id: '50L', label: '50L', size: 5000000, price: 22000, color: 'text-orange-400' },
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1F1F35] rounded-2xl border border-white/10 w-full max-w-md overflow-hidden shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>

                <div className="p-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Select Challenge</h2>
                    <p className="text-gray-400 text-sm mb-6">Choose your funding level to start evaluation.</p>

                    <div className="space-y-3 mb-8">
                        {levels.map((level) => (
                            <div
                                key={level.id}
                                onClick={() => setSelectedLevel(level.id)}
                                className={`p-4 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${selectedLevel === level.id
                                    ? 'bg-brand-lime/10 border-brand-lime'
                                    : 'bg-white/5 border-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div>
                                    <h4 className={`font-bold ${level.color}`}>{level.label} Account</h4>
                                    <p className="text-xs text-gray-400 uppercase tracking-widest font-mono">Size: ₹{level.size.toLocaleString('en-IN')}</p>
                                    <p className="text-sm font-bold text-white mt-1">₹{level.price.toLocaleString('en-IN')}</p>
                                </div>
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedLevel === level.id ? 'border-brand-lime' : 'border-gray-600'
                                    }`}>
                                    {selectedLevel === level.id && <div className="w-2.5 h-2.5 bg-brand-lime rounded-full" />}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleBuy}
                        disabled={loading}
                        className="w-full bg-brand-lime text-brand-dark font-bold py-3 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : 'Purchase Challenge'}
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
            // Launch Logic
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
                // Note: Better to let Terminal fetch fresh, but state passing is ok for immediate props
            } else {
                const data = await res.json();
                addToast(data.error, 'error');
            }
        } else if (acc.status === 'active') {
            navigate('/terminal', { state: { account: acc } });
        }
    };

    // News (Static for now, could fetch later)


    return (
        <div className="flex flex-col lg:flex-row gap-8 h-full">
            {/* LEFT COLUMN: Main Content */}
            <div className="flex-1 min-w-0 flex flex-col gap-8">

                {/* HERO CARD (Gradient Dark) */}
                <div className="relative rounded-2xl p-8 overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1F1F35] to-[#17172B] border border-white/5 rounded-2xl" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-lime/5 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="px-2 py-0.5 text-[10px] font-mono font-bold text-brand-lime bg-brand-lime/10 border border-brand-lime/20 rounded uppercase tracking-widest">
                                    New Challenge
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Ready to Scale?</h3>
                            <p className="text-gray-400 max-w-lg text-sm leading-relaxed">
                                Unlock up to ₹50L buying power. Prove your edge in our high-frequency simulation environment.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowPurchase(true)}
                            className="flex items-center gap-3 bg-brand-lime text-brand-dark px-6 py-3 rounded-lg font-bold text-sm transition-transform hover:scale-105 shadow-[0_0_20px_rgba(245,255,171,0.2)]"
                        >
                            Start Evaluation
                            <ArrowRight size={16} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {/* ACCOUNTS TABLE */}
                <div className="bg-[#1F1F35] rounded-2xl border border-white/5 flex flex-col flex-1 min-h-[300px] overflow-hidden">
                    <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-[#1F1F35]">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1 h-4 bg-brand-lime rounded-full"></span>
                            Accounts History
                        </h3>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500 font-mono text-sm">Loading Accounts...</div>
                        ) : accounts.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 font-mono text-sm">
                                No active accounts. Start an evaluation to begin.
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5 text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                                        <th className="px-6 py-4 font-normal">Program</th>
                                        <th className="px-6 py-4 font-normal">Balance</th>
                                        <th className="px-6 py-4 font-normal">Created / Session</th>
                                        <th className="px-6 py-4 font-normal">Status</th>
                                        <th className="px-6 py-4 font-normal">Actions</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {accounts.map((acc, i) => (
                                        <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4 text-sm font-medium text-white align-top">
                                                <div className="flex flex-col">
                                                    <span className="text-brand-lime font-mono text-xs mb-1">ID: #{acc.id.toString().padStart(4, '0')}</span>
                                                    <span className="font-bold">{acc.type}</span>
                                                    <span className="text-xs text-gray-500">Size: ₹{acc.size.toLocaleString('en-IN')}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-lg font-bold text-white tracking-tight">
                                                    ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400 font-mono">
                                                {acc.session_start ? new Date(acc.session_start).toLocaleDateString() : new Date(acc.created_at).toLocaleDateString()}
                                                {acc.session_expires && (
                                                    <div className="text-[10px] text-red-400 mt-1">Exp: {new Date(acc.session_expires).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded text-[10px] font-bold font-mono uppercase tracking-wider
                                                    ${(acc.status === 'failed' || acc.status === 'expired') ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                                        acc.status === 'active' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                                            'bg-gray-500/10 text-gray-400 border border-gray-500/20'}
                                                `}>
                                                    {acc.status === 'active' && <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />}
                                                    {acc.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <button className="text-gray-400 hover:text-brand-lime p-2 hover:bg-white/5 rounded transition-colors" title="Credentials"><Key size={16} /></button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {(acc.status === 'pending' || acc.status === 'active') ? (
                                                    <button
                                                        onClick={() => handleLaunch(acc)}
                                                        className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-dark bg-white hover:bg-brand-lime px-4 py-2 rounded transition-all"
                                                    >
                                                        {acc.status === 'pending' ? 'Launch' : 'Trade'} <ArrowRight size={12} />
                                                    </button>
                                                ) : (
                                                    <Link to={`/dashboard/account/${acc.id}`} className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded transition-all">
                                                        View Metrics <ArrowRight size={12} />
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

