import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ShieldCheck, Sparkles, CreditCard, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SIZES, DATA, MODELS } from '../components/Landing/ChallengeSelector';
import { API_BASE_URL } from '../config';
import Footer from '../components/Global/Footer';

export default function Checkout() {
    const location = useLocation();
    const navigate = useNavigate();

    const { user, login } = useAuth();
    const [selectedModelId, setSelectedModelId] = useState(location.state?.modelId || 'standard');
    const [selectedSizeId, setSelectedSizeId] = useState(location.state?.sizeId || '10L');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [authStep, setAuthStep] = useState('input');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const activeModel = MODELS.find(m => m.id === selectedModelId);
    const activeSize = SIZES.find(s => s.id === selectedSizeId);
    const activeData = DATA[selectedModelId];

    useEffect(() => {
        if (user) setAuthStep('done');
    }, [user]);

    const calculateValue = (percentageStr) => {
        const pct = parseInt(percentageStr) / 100;
        return `₹${(activeSize.value * pct).toLocaleString()}`;
    };

    const handleSendOTP = async () => {
        setError('');
        if (!email || !password) return setError("Please fill in email and password");
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/send-otp-register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (res.ok) {
                setAuthStep('verify');
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError("Failed to send OTP. Please check your connection.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyAndRegister = async () => {
        setError('');
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, otp })
            });
            const data = await res.json();

            if (res.ok) {
                const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const loginData = await loginRes.json();

                if (loginRes.ok) {
                    login(loginData.user, loginData.token);
                    setAuthStep('done');
                } else {
                    setError("Auto-login failed. Please login manually.");
                }
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError("Registration Failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateOrder = async () => {
        if (!user) return setError("User not authenticated.");
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/trade/purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ type: activeModel.label, size: activeSize.value })
            });

            if (res.ok) {
                navigate('/dashboard');
            } else {
                const data = await res.json();
                alert(data.error || "Purchase Failed");
            }

        } catch (e) {
            console.error(e);
            alert("Payment Processing Failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-primary font-sans flex flex-col selection:bg-accent selection:text-background">

            {/* Header */}
            <header className="h-20 border-b border-white/5 flex items-center px-8 md:px-12 bg-surface/80 backdrop-blur-md">
                <Link to="/" className="flex items-center gap-4 text-secondary hover:text-primary transition-all group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">HUB</span>
                </Link>
                <div className="mx-auto font-bold text-lg tracking-[-0.04em] uppercase">Initialize Node</div>
                <div className="w-16"></div>
            </header>

            <main className="flex-1 max-w-[1400px] mx-auto w-full p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-16">

                {/* LEFT: Selection Panel */}
                <div className="lg:col-span-4 space-y-12">
                    <div>
                        <div className="flex flex-col gap-2 mb-10">
                            <div className="text-[12px] font-bold text-accent uppercase tracking-[0.3em] font-display">Protocol Selection</div>
                            <h2 className="text-4xl font-display font-black tracking-tighter uppercase text-white">Active Matrix</h2>
                        </div>

                        {/* Size Selector */}
                        <div className="space-y-4">
                            {SIZES.map((size) => (
                                <button
                                    key={size.id}
                                    onClick={() => setSelectedSizeId(size.id)}
                                    className={`w-full flex items-center justify-between p-8 border transition-all ${selectedSizeId === size.id
                                        ? 'bg-accent/10 border-accent text-white shadow-[0_0_15px_rgba(197,0,34,0.3)]'
                                        : 'bg-surface border-white/10 text-secondary hover:border-white/30'
                                        }`}
                                >
                                    <div className="flex flex-col items-start gap-1">
                                        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${selectedSizeId === size.id ? 'text-accent' : 'text-muted'}`}>Allocation</span>
                                        <span className="text-2xl font-display font-black text-white uppercase tracking-tighter">{size.label}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-display font-black text-2xl text-white">₹{size.price.toLocaleString()}</span>
                                        {selectedSizeId === size.id && <div className="text-[10px] font-bold text-accent uppercase tracking-[0.3em] mt-1">Selected</div>}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 bg-surface rounded-premium border border-white/5 shadow-soft">
                        <h3 className="text-[10px] font-bold text-muted uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                            <Lock size={12} className="text-accent" /> Security Layer
                        </h3>
                        <p className="text-sm text-secondary leading-relaxed font-medium">
                            Encrypted merchant protocol active. UPI and Institutional gateways available.
                        </p>
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <div className="flex flex-col gap-2 mb-10">
                        <div className="text-[12px] font-bold text-accent uppercase tracking-[0.3em] font-display">Summary</div>
                        <h2 className="text-4xl font-display font-black tracking-tighter uppercase text-white">Technical Overview</h2>
                    </div>

                    <div className="bg-surface border border-white/10 overflow-hidden relative mb-12 shadow-2xl">
                        <div className="absolute top-0 right-0 p-32 bg-accent/10 blur-[100px] rounded-full pointer-events-none" />

                        <div className="p-12 border-b border-white/10 flex justify-between items-end">
                            <div>
                                <h1 className="text-6xl font-display font-black text-white tracking-tighter mb-2 uppercase">{activeSize.label}</h1>
                                <div className="text-[12px] font-bold text-accent uppercase tracking-[0.4em] font-display">{activeModel.label}</div>
                            </div>
                            <div className="text-right">
                                <span className="block text-[10px] text-muted font-bold uppercase tracking-[0.2em] mb-2">Protocol Fee</span>
                                <span className="text-5xl font-display font-black text-white tracking-tighter">₹{activeSize.price.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="p-12 grid grid-cols-2 md:grid-cols-3 gap-12">
                            <DetailItem label="Growth Target" value={activeData.target} sub={calculateValue(activeData.target)} />
                            <DetailItem label="Daily Stop" value={activeData.dailyDrawdown} sub={calculateValue(activeData.dailyDrawdown)} />
                            <DetailItem label="Hard Stop" value={activeData.maxDrawdown} sub={calculateValue(activeData.maxDrawdown)} />
                            <DetailItem label="Risk Limit" value={activeData.leverage} />
                            <DetailItem label="Scale Limit" value={`${activeSize.maxLots} Lots`} />
                            <DetailItem label="Profit Split" value={activeData.profitSplit} />
                        </div>
                    </div>

                    {/* Auth & Payment Section */}
                    <div className="bg-surface rounded-premium border border-white/5 p-12 mb-16 shadow-2xl">

                        {!user && authStep === 'input' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4">
                                <h3 className="text-xl font-bold text-primary mb-10 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-instrument bg-accent/10 flex items-center justify-center text-accent">
                                        <ShieldCheck size={20} />
                                    </div>
                                    Initialize Identity
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold text-muted uppercase tracking-[0.3em]">Corporate Email</label>
                                        <input
                                            type="email"
                                            placeholder="trader@optivon.com"
                                            className="w-full bg-background/50 border border-white/10 rounded-instrument px-6 py-4 text-primary font-medium focus:outline-none focus:border-accent transition-all placeholder:text-muted/30"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold text-muted uppercase tracking-[0.3em]">Access Code</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            className="w-full bg-background/50 border border-white/10 rounded-instrument px-6 py-4 text-primary font-medium focus:outline-none focus:border-accent transition-all placeholder:text-muted/30"
                                            value={password}
                                            onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                        />
                                    </div>
                                </div>
                                {error && <div className="text-red-400 text-[10px] font-bold uppercase tracking-widest text-center mb-6 bg-red-400/5 p-4 rounded-instrument border border-red-400/20">{error}</div>}
                                <button
                                    onClick={handleSendOTP}
                                    disabled={isLoading}
                                    className="w-full py-5 bg-background border border-white/10 hover:border-accent/30 text-primary rounded-instrument font-bold uppercase tracking-[0.3em] text-[11px] transition-all"
                                >
                                    {isLoading ? 'Processing...' : 'Verify Node Connectivity'}
                                </button>
                            </div>
                        )}

                        {!user && authStep === 'verify' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 text-center">
                                <h3 className="text-2xl font-bold text-primary mb-2 uppercase tracking-tight">Matrix Verification</h3>
                                <p className="text-secondary text-sm mb-10 font-medium tracking-tight">Enter the protocol key sent to <span className="text-primary font-bold">{email}</span></p>

                                {error && <div className="text-red-400 text-[10px] font-bold uppercase tracking-widest mb-6 bg-red-400/5 p-4 rounded-instrument border border-red-400/20">{error}</div>}

                                <input
                                    type="text"
                                    placeholder="000000"
                                    maxLength={6}
                                    className="w-64 bg-background border border-accent/20 rounded-instrument px-6 py-5 text-center text-4xl tracking-[0.4em] font-bold text-accent focus:outline-none focus:border-accent transition-all mb-10 placeholder:text-accent/10"
                                    value={otp}
                                    onChange={(e) => { setOtp(e.target.value); setError(''); }}
                                />

                                <div className="flex gap-6 max-w-lg mx-auto">
                                    <button
                                        onClick={() => setAuthStep('input')}
                                        className="flex-1 py-4 text-muted hover:text-primary transition-colors text-[10px] font-bold uppercase tracking-[0.3em]"
                                    >
                                        Recalibrate
                                    </button>
                                    <button
                                        onClick={handleVerifyAndRegister}
                                        disabled={isLoading || otp.length < 6}
                                        className="flex-[2] py-5 bg-accent text-background rounded-instrument font-bold uppercase tracking-[0.3em] text-[11px] hover:shadow-soft transition-all"
                                    >
                                        {isLoading ? 'Verifying...' : 'Authenticate'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {(user || authStep === 'done') && (
                            <div className="animate-in fade-in zoom-in">
                                <div className="flex items-center justify-between p-6 bg-accent/5 rounded-instrument border border-accent/20 mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-accent text-background rounded-full flex items-center justify-center">
                                            <CheckCircle2 size={18} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Authenticated Node</div>
                                            <div className="text-sm text-primary font-bold uppercase">{user?.email || email}</div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCreateOrder}
                                    className="w-full py-6 bg-accent text-background rounded-instrument font-bold uppercase tracking-[0.3em] text-[11px] hover:bg-primary transition-all shadow-soft flex items-center justify-center gap-4"
                                >
                                    <CreditCard size={18} />
                                    Process Allocation Fee (₹{activeSize.price.toLocaleString()})
                                </button>
                            </div>
                        )}

                    </div>

                </div>

            </main>

            <Footer />
        </div>
    );
}

function DetailItem({ label, value, sub }) {
    return (
        <div className="flex flex-col gap-2 border-l-2 border-accent/30 pl-6">
            <h4 className="text-[11px] font-bold text-muted uppercase tracking-[0.3em] font-display">{label}</h4>
            <div className="font-display font-black text-3xl text-white tracking-tighter">{value}</div>
            {sub && <div className="text-[11px] text-accent font-bold uppercase tracking-[0.1em]">{sub}</div>}
        </div>
    );
}
