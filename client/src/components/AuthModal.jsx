import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, ArrowRight, ShieldCheck, KeyRound, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { API_BASE_URL } from '../config';

export default function AuthModal({ onClose, onLoginSuccess }) {
    const { addToast } = useToast();
    const [mode, setMode] = useState('LOGIN'); // LOGIN, REGISTER, FORGOT
    const [step, setStep] = useState(1); // 1: Creds/Email, 2: OTP/2FA, 3: Setup 2FA

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [pin, setPin] = useState(''); // For 2FA Login or Setup
    const [userId, setUserId] = useState(null); // For 2FA Login context
    const [tempToken, setTempToken] = useState(null); // For 2FA Setup context

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const resetState = () => {
        setStep(1);
        setError('');
        setOtp('');
        setPin('');
        setPassword('');
    };

    // HANDLERS ----------------------------------------------------------------

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!password) {
            setError('Password is required');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/send-otp-register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            if (data.devOTP) {
                addToast(`DEV MODE: Your Code is ${data.devOTP}`, 'success', 10000);
            } else {
                addToast('Verification code sent to your email', 'success');
            }
            setStep(2); 
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, otp })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const loginData = await loginRes.json();

            if (loginData.token) {
                setTempToken(loginData.token);
                setStep(3); 
            } else {
                throw new Error("Registration succeeded but auto-login failed.");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSetup2FA = async (e) => {
        e.preventDefault();
        if (pin.length !== 6) {
            setError('PIN must be 6 digits');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/setup-2fa`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tempToken}`
                },
                body: JSON.stringify({ pin })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            addToast('Registration & Setup Complete!', 'success');
            onLoginSuccess({ user: { email }, token: tempToken }); 
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            if (data.require2FA) {
                setUserId(data.userId);
                setStep(2); 
            } else {
                addToast('Welcome back to Optivon', 'success');
                onLoginSuccess({ user: data.user, token: data.token });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify2FA = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/verify-2fa-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, pin })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            addToast('Access Granted', 'success');
            onLoginSuccess({ user: data.user, token: data.token });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPass = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            if (data.devLink) {
                addToast('DEV MODE: Check Console/Network for Link', 'success');
                window.open(data.devLink, '_blank');
            } else {
                addToast('Recovery link sent to your email', 'success');
            }
            setMode('LOGIN');
            resetState();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/90 backdrop-blur-md p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-sm bg-surface rounded-premium shadow-2xl border border-white/5 overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-10 pt-10 pb-4 flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-primary uppercase tracking-tight">
                                {mode === 'LOGIN' ? 'Sync Profile' : mode === 'REGISTER' ? 'Initiate Node' : 'Recover Key'}
                            </h2>
                            <p className="text-secondary text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
                                {mode === 'LOGIN' ? (step === 2 ? 'Security Verification' : 'Access your terminal.') :
                                    mode === 'REGISTER' ? (step === 1 ? 'Begin your evaluation.' : step === 3 ? 'Secure your account.' : 'Verify Identity.') :
                                        'System recovery sequence.'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 bg-background border border-white/5 text-muted hover:text-accent rounded-full transition-all shadow-soft"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="mx-10 mt-4 p-4 bg-red-400/5 border border-red-400/20 rounded-instrument flex items-center gap-4 animate-in slide-in-from-top-2">
                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0 animate-pulse" />
                            <span className="text-red-400 text-[10px] font-bold uppercase tracking-widest leading-none">{error}</span>
                        </div>
                    )}

                    <div className="p-10 space-y-8">

                        {mode === 'LOGIN' && step === 1 && (
                            <form onSubmit={handleLogin} className="space-y-6">
                                <Input label="Identifier" icon={Mail} type="email" value={email} onChange={setEmail} placeholder="trader@optivon.pro" />
                                <Input label="Access Key" icon={Lock} type="password" value={password} onChange={setPassword} placeholder="••••••••" />
                                <div className="flex justify-end">
                                    <button type="button" onClick={() => { setMode('FORGOT'); resetState(); }} className="text-[10px] font-bold text-accent uppercase tracking-widest hover:text-primary transition-colors">
                                        Lost Recovery Key?
                                    </button>
                                </div>
                                <SubmitButton loading={loading}>Initialize Protocol</SubmitButton>
                            </form>
                        )}

                        {mode === 'LOGIN' && step === 2 && (
                            <form onSubmit={handleVerify2FA} className="space-y-10 text-center">
                                <div className="w-20 h-20 bg-accent/5 border border-accent/20 rounded-premium flex items-center justify-center mx-auto text-accent shadow-soft">
                                    <ShieldCheck className="w-10 h-10" />
                                </div>
                                <Input label="Security PIN" icon={KeyRound} type="password" value={pin} onChange={setPin} placeholder="000000" maxLength={6} center />
                                <SubmitButton loading={loading}>Unlock Node</SubmitButton>
                            </form>
                        )}

                        {mode === 'REGISTER' && step === 1 && (
                            <form onSubmit={handleSendOtp} className="space-y-6">
                                <Input label="Identifier" icon={Mail} type="email" value={email} onChange={setEmail} placeholder="trader@optivon.pro" />
                                <Input label="Set Key" icon={Lock} type="password" value={password} onChange={setPassword} placeholder="••••••••" />
                                <div className="text-[9px] text-muted font-bold uppercase tracking-[0.2em] bg-background/50 p-3 rounded-instrument border border-white/5">
                                    Protocol will dispatch a verification sequence to this node.
                                </div>
                                <SubmitButton loading={loading}>Initiate Sync</SubmitButton>
                            </form>
                        )}

                        {mode === 'REGISTER' && step === 2 && (
                            <form onSubmit={handleRegister} className="space-y-6">
                                <Input label="Sequence Code" icon={ShieldCheck} type="text" value={otp} onChange={setOtp} placeholder="000000" />
                                <SubmitButton loading={loading}>Verify & Connect</SubmitButton>
                            </form>
                        )}

                        {mode === 'REGISTER' && step === 3 && (
                            <form onSubmit={handleSetup2FA} className="space-y-10 text-center">
                                <div className="w-20 h-20 bg-accent/5 border border-accent/20 rounded-premium flex items-center justify-center mx-auto text-accent shadow-soft">
                                    <CheckCircle className="w-10 h-10" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-primary uppercase tracking-tight">Node Activated</h3>
                                    <p className="text-secondary text-[10px] font-bold uppercase tracking-widest">Configure 2FA PIN for secure transit.</p>
                                </div>
                                <Input label="Encryption PIN" icon={KeyRound} type="password" value={pin} onChange={setPin} placeholder="000000" maxLength={6} center />
                                <SubmitButton loading={loading}>Secure & Finalize</SubmitButton>
                            </form>
                        )}

                        {mode === 'FORGOT' && (
                            <form onSubmit={handleForgotPass} className="space-y-6">
                                <Input label="Identifier" icon={Mail} type="email" value={email} onChange={setEmail} placeholder="trader@optivon.pro" />
                                <SubmitButton loading={loading}>Dispatch Recovery</SubmitButton>
                                <button type="button" onClick={() => { setMode('LOGIN'); resetState(); }} className="w-full text-center text-[10px] font-bold text-muted uppercase tracking-[0.2em] hover:text-primary transition-all mt-4">
                                    Return to Sync
                                </button>
                            </form>
                        )}

                        {mode !== 'FORGOT' && step === 1 && (
                            <div className="pt-8 border-t border-white/5 text-center">
                                <button
                                    onClick={() => { setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN'); resetState(); }}
                                    className="text-[10px] font-bold text-muted hover:text-accent uppercase tracking-[0.3em] transition-all"
                                >
                                    {mode === 'LOGIN' ? 'Initialize New Node' : 'Established Node Log'}
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

function Input({ label, icon: Icon, type, value, onChange, placeholder, maxLength, center }) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className="space-y-3">
            <label className={`text-[10px] font-bold text-muted uppercase tracking-[0.3em] ml-1 block ${center ? 'text-center' : ''}`}>{label}</label>
            <div className="relative group">
                <Icon className={`absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent transition-all ${center ? 'hidden' : ''}`} />
                <input
                    type={inputType}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className={`w-full bg-background border border-white/5 rounded-instrument py-4 text-sm font-bold text-primary outline-none focus:border-accent/40 transition-all placeholder:text-muted/20 ${center ? 'text-center px-4 tracking-[0.8em] font-mono' : 'pl-14 pr-12'}`}
                    placeholder={placeholder}
                    required
                    maxLength={maxLength}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-accent transition-all p-1"
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                )}
            </div>
        </div>
    );
}

function SubmitButton({ children, loading }) {
    return (
        <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-accent text-background rounded-instrument font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-primary transition-all disabled:opacity-50 shadow-soft flex items-center justify-center gap-4 group"
        >
            {loading ? 'Processing...' : children}
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
        </button>
    );
}
