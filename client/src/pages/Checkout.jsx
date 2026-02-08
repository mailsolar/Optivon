import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ShieldCheck, Sparkles, CreditCard, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SIZES, DATA, MODELS } from '../components/Landing/ChallengeSelector';


export default function Checkout() {
    const location = useLocation();
    const navigate = useNavigate();

    // Default to first options if no state (e.g. direct access)
    const { user, login } = useAuth(); // Access auth context
    const [selectedModelId, setSelectedModelId] = useState(location.state?.modelId || 'standard');
    const [selectedSizeId, setSelectedSizeId] = useState(location.state?.sizeId || '10L');

    // Auth State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [authStep, setAuthStep] = useState('input'); // 'input', 'verify', 'done' (or if user is already logged in)
    const [isLoading, setIsLoading] = useState(false);

    const activeModel = MODELS.find(m => m.id === selectedModelId);
    const activeSize = SIZES.find(s => s.id === selectedSizeId);
    const activeData = DATA[selectedModelId];

    // If user is already logged in, skip auth steps
    useEffect(() => {
        if (user) setAuthStep('done');
    }, [user]);

    const calculateValue = (percentageStr) => {
        const pct = parseInt(percentageStr) / 100;
        return `₹${(activeSize.value * pct).toLocaleString()}`;
    };

    const handleSendOTP = async () => {
        if (!email || !password) return alert("Please fill in email and password");
        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/auth/send-otp-register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (res.ok) {
                setAuthStep('verify');
                alert(`OTP Sent! (Dev: ${data.devOTP})`); // Remove dev hint in prod
            } else {
                alert(data.error);
            }
        } catch (err) {
            alert("Failed to send OTP");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyAndRegister = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, otp })
            });
            const data = await res.json();

            if (res.ok) {
                // Auto-login after register (simplified for flow)
                // In a real app, you might want to call the login endpoint to get a token
                // For now, let's assume successful registration means they are ready to pay
                // Or better, let's trigger a real background login to set the context

                // Triggering Login (re-using login logic or hitting login endpoint)
                const loginRes = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const loginData = await loginRes.json();

                if (loginRes.ok) {
                    login(loginData.user, loginData.token);
                    setAuthStep('done');
                } else {
                    alert("Registration successful, but auto-login failed. Please login manually.");
                }
            } else {
                alert(data.error);
            }
        } catch (err) {
            alert("Registration Failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateOrder = () => {
        // Placeholder for Payment Gateway Integration
        alert(`Creating order for ${user?.email || email}...\nPrice: ₹${activeSize.price}`);
    };

    return (
        <div className="min-h-screen bg-brand-dark text-white font-sans flex flex-col">

            {/* Header */}
            <header className="h-20 border-b border-white/5 flex items-center px-6 md:px-12 bg-[#0a0a12]">
                <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={18} />
                    <span className="text-xs font-mono uppercase tracking-widest">Back</span>
                </Link>
                <div className="mx-auto font-display font-black text-xl tracking-[0.2em]">CHECKOUT</div>
                <div className="w-16"></div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* LEFT: Selection Panel */}
                <div className="lg:col-span-4 space-y-8">
                    <div>
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <div className="w-1 h-6 bg-brand-lime rounded-full" />
                            Select Challenge
                        </h2>

                        {/* 1. Model Selector (Hidden if only 1, but kept for logic) */}
                        {/* 
                        <div className="mb-6">
                            <label className="text-xs text-gray-500 font-mono uppercase block mb-3">Model</label>
                            ...
                        </div>
                        */}

                        {/* 2. Size Selector (Vertical List) */}
                        <div className="space-y-3">
                            <label className="text-xs text-gray-500 font-mono uppercase tracking-widest block mb-1">Account Size</label>
                            {SIZES.map((size) => (
                                <button
                                    key={size.id}
                                    onClick={() => setSelectedSizeId(size.id)}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${selectedSizeId === size.id
                                        ? 'bg-brand-lime/10 border-brand-lime text-white'
                                        : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex flex-col items-start">
                                        <span className={`font-bold ${selectedSizeId === size.id ? 'text-brand-lime' : ''}`}>{size.label}</span>
                                        <span className="text-[10px] font-mono opacity-60">Capital</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-bold">₹{size.price.toLocaleString()}</span>
                                        {selectedSizeId === size.id && <CheckCircle2 size={16} className="text-brand-lime ml-auto mt-1" />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 bg-[#1F1F35] rounded-2xl border border-white/5">
                        <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
                            <Lock size={14} /> Secure Payment
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Your payment is processed securely. We accept UPI, Credit Cards, and Crypto.
                        </p>
                    </div>
                </div>

                {/* RIGHT: Summary & Checkout */}
                <div className="lg:col-span-8">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <div className="w-1 h-6 bg-brand-blue rounded-full" />
                        Challenge Overview
                    </h2>

                    <div className="bg-[#121220] rounded-3xl border border-white/10 overflow-hidden relative mb-8">
                        <div className="absolute top-0 right-0 p-32 bg-brand-lime/5 blur-[100px] rounded-full pointer-events-none" />

                        <div className="p-8 border-b border-white/5 flex justify-between items-start">
                            <div>
                                <h1 className="text-4xl font-black text-white mb-2">{activeSize.label}</h1>
                                <p className="text-brand-lime font-mono text-sm uppercase tracking-widest">{activeModel.label}</p>
                            </div>
                            <div className="text-right">
                                <span className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Total Fee</span>
                                <span className="text-3xl font-bold text-white">₹{activeSize.price.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-2 md:grid-cols-3 gap-8">
                            <DetailItem label="Profit Target" value={activeData.target} sub={calculateValue(activeData.target)} />
                            <DetailItem label="Daily Drawdown" value={activeData.dailyDrawdown} sub={calculateValue(activeData.dailyDrawdown)} />
                            <DetailItem label="Max Drawdown" value={activeData.maxDrawdown} sub={calculateValue(activeData.maxDrawdown)} />
                            <DetailItem label="Leverage" value={activeData.leverage} />
                            <DetailItem label="Max Lots" value={activeData.maxLots} />
                            <DetailItem label="Profit Split" value={activeData.profitSplit} />
                        </div>
                    </div>

                    {/* Authentication & Payment Section */}
                    <div className="bg-[#121220] rounded-3xl border border-white/10 p-8 mb-8 transition-all">

                        {!user && authStep === 'input' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-brand-lime/10 text-brand-lime">
                                        <ShieldCheck size={20} />
                                    </div>
                                    Create Account
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-gray-500 uppercase tracking-widest">Email Address</label>
                                        <input
                                            type="email"
                                            placeholder="trader@optivon.com"
                                            className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-lime transition-colors"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-gray-500 uppercase tracking-widest">Password</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-lime transition-colors"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleSendOTP}
                                    disabled={isLoading}
                                    className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold uppercase tracking-widest transition-all"
                                >
                                    {isLoading ? 'Sending...' : 'Next: Verify Email'}
                                </button>
                            </div>
                        )}

                        {!user && authStep === 'verify' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 text-center">
                                <h3 className="text-xl font-bold text-white mb-2">Verify Email</h3>
                                <p className="text-gray-400 text-sm mb-6">Enter the code sent to <span className="text-white">{email}</span></p>

                                <input
                                    type="text"
                                    placeholder="000000"
                                    maxLength={6}
                                    className="w-48 bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-4 text-center text-2xl tracking-[0.5em] font-mono text-brand-lime focus:outline-none focus:border-brand-lime transition-colors mb-6"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setAuthStep('input')}
                                        className="flex-1 py-4 text-gray-500 hover:text-white transition-colors text-xs uppercase tracking-widest"
                                    >
                                        Change Email
                                    </button>
                                    <button
                                        onClick={handleVerifyAndRegister}
                                        disabled={isLoading || otp.length < 6}
                                        className="flex-[2] py-4 bg-brand-lime text-brand-dark rounded-xl font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(204,255,0,0.3)]"
                                    >
                                        {isLoading ? 'Verifying...' : 'Verify & Register'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {(user || authStep === 'done') && (
                            <div className="animate-in fade-in zoom-in">
                                <div className="flex items-center justify-between p-4 bg-brand-lime/10 rounded-xl border border-brand-lime/20 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-brand-lime text-brand-dark rounded-full">
                                            <CheckCircle2 size={16} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">Logged in as</div>
                                            <div className="text-xs text-brand-lime font-mono">{user?.email || email}</div>
                                        </div>
                                    </div>
                                    {/* Optional: Change account button could go here */}
                                </div>

                                <button
                                    onClick={handleCreateOrder}
                                    className="w-full py-4 bg-brand-lime text-brand-dark rounded-xl font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_40px_rgba(204,255,0,0.4)] flex items-center justify-center gap-3"
                                >
                                    <CreditCard size={20} />
                                    Pay ₹{activeSize.price.toLocaleString()}
                                </button>
                            </div>
                        )}

                    </div>

                </div>

            </main>
        </div>
    );
}

function DetailItem({ label, value, sub }) {
    return (
        <div>
            <h4 className="text-xs text-gray-500 uppercase tracking-widest mb-1">{label}</h4>
            <div className="font-bold text-xl text-white">{value}</div>
            {sub && <div className="text-xs text-gray-400 font-mono mt-0.5">{sub}</div>}
        </div>
    );
}
