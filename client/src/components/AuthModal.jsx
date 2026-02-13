import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, ArrowRight, ShieldCheck, KeyRound, CheckCircle } from 'lucide-react';
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

    // 1. Send OTP (Register Step 1)
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
            setStep(2); // Move to OTP
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 2. Register (Register Step 2)
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

            // Auto-login to generate token for 2FA setup
            const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const loginData = await loginRes.json();

            if (loginData.token) {
                setTempToken(loginData.token);
                // addToast('Registration Successful! Please set up your 2FA PIN.', 'success');
                setStep(3); // Move to 2FA Setup
            } else {
                throw new Error("Registration succeeded but auto-login failed.");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 3. Setup 2FA (Register Step 3)
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
            onLoginSuccess({ user: { email }, token: tempToken }); // Finish
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 4. Login (Login Step 1)
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
                setStep(2); // Move to 2FA Input
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

    // 5. Verify 2FA Login (Login Step 2)
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

    // 6. Forgot Password Request
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

            if (!res.ok) throw new Error(data.error);

            if (data.devLink) {
                addToast('DEV MODE: Check Console/Network for Link', 'success');
                console.log("DEV RECOVERY LINK:", data.devLink);
                // Prompt user to copy it
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


    // RENDERERS ---------------------------------------------------------------

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-sm bg-surface rounded-3xl shadow-2xl border border-border overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-8 pt-8 pb-4 flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-black font-display text-primary tracking-tight">
                                {mode === 'LOGIN' ? 'Welcome Back' : mode === 'REGISTER' ? 'Join Optivon' : 'Recover Account'}
                            </h2>
                            <p className="text-secondary text-xs font-mono mt-1">
                                {mode === 'LOGIN' ? (step === 2 ? 'Security Verification' : 'Access your terminal.') :
                                    mode === 'REGISTER' ? (step === 1 ? 'Begin your evaluation.' : step === 3 ? 'Secure your account.' : 'Verify Identity.') :
                                        'We\'ll send you a link.'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 text-secondary hover:text-primary hover:bg-background rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="mx-8 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                            <span className="text-red-500 text-[10px] font-black uppercase tracking-wider">{error}</span>
                        </div>
                    )}

                    <div className="p-8 space-y-6">

                        {/* --- LOGIN FLOW --- */}
                        {mode === 'LOGIN' && step === 1 && (
                            <form onSubmit={handleLogin} className="space-y-4">
                                <Input label="Email" icon={Mail} type="email" value={email} onChange={setEmail} placeholder="trader@optivon.com" />
                                <Input label="Password" icon={Lock} type="password" value={password} onChange={setPassword} placeholder="••••••••" />
                                <div className="flex justify-end">
                                    <button type="button" onClick={() => { setMode('FORGOT'); resetState(); }} className="text-[10px] font-bold text-accent hover:underline">
                                        Forgot Password?
                                    </button>
                                </div>
                                <SubmitButton loading={loading}>Sign In</SubmitButton>
                            </form>
                        )}

                        {mode === 'LOGIN' && step === 2 && (
                            <form onSubmit={handleVerify2FA} className="space-y-6 text-center">
                                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto text-accent">
                                    <ShieldCheck className="w-8 h-8" />
                                </div>
                                <Input label="6-Digit PIN" icon={KeyRound} type="password" value={pin} onChange={setPin} placeholder="000000" maxLength={6} center />
                                <SubmitButton loading={loading}>Unlock Terminal</SubmitButton>
                            </form>
                        )}


                        {/* --- REGISTER FLOW --- */}
                        {mode === 'REGISTER' && step === 1 && (
                            <form onSubmit={handleSendOtp} className="space-y-4">
                                <Input label="Email" icon={Mail} type="email" value={email} onChange={setEmail} placeholder="trader@optivon.com" />
                                <Input label="Create Password" icon={Lock} type="password" value={password} onChange={setPassword} placeholder="••••••••" />
                                <div className="text-[10px] text-secondary/60 font-mono">
                                    We will send a verification code to this address.
                                </div>
                                <SubmitButton loading={loading}>Register</SubmitButton>
                            </form>
                        )}

                        {mode === 'REGISTER' && step === 2 && (
                            <form onSubmit={handleRegister} className="space-y-4">
                                <Input label="Verification Code" icon={ShieldCheck} type="text" value={otp} onChange={setOtp} placeholder="000000" />
                                <SubmitButton loading={loading}>Verify & Create Account</SubmitButton>
                            </form>
                        )}

                        {mode === 'REGISTER' && step === 3 && (
                            <form onSubmit={handleSetup2FA} className="space-y-6 text-center">
                                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto text-emerald-500">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-primary">Account Created!</h3>
                                    <p className="text-secondary text-xs">Set up a 6-digit PIN for 2-Factor Auth.</p>
                                </div>
                                <Input label="Set 6-Digit PIN" icon={KeyRound} type="password" value={pin} onChange={setPin} placeholder="000000" maxLength={6} center />
                                <SubmitButton loading={loading}>Enable 2FA & Login</SubmitButton>
                            </form>
                        )}


                        {/* --- FORGOT PASSWORD --- */}
                        {mode === 'FORGOT' && (
                            <form onSubmit={handleForgotPass} className="space-y-4">
                                <Input label="Email" icon={Mail} type="email" value={email} onChange={setEmail} placeholder="trader@optivon.com" />
                                <SubmitButton loading={loading}>Send Recovery Link</SubmitButton>
                                <button type="button" onClick={() => { setMode('LOGIN'); resetState(); }} className="w-full text-center text-xs text-secondary hover:text-primary mt-4">
                                    Back to Login
                                </button>
                            </form>
                        )}


                        {/* Mode Switcher */}
                        {mode !== 'FORGOT' && step === 1 && (
                            <div className="pt-4 border-t border-border text-center">
                                <button
                                    onClick={() => { setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN'); resetState(); }}
                                    className="text-[10px] font-black text-secondary hover:text-primary uppercase tracking-widest transition-colors"
                                >
                                    {mode === 'LOGIN' ? 'New to Optivon? Start Challenge' : 'Have an account? Log In'}
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

// Reusable Input Component
function Input({ label, icon: Icon, type, value, onChange, placeholder, maxLength, center }) {
    return (
        <div className="space-y-2">
            <label className={`text-[10px] font-black text-secondary uppercase tracking-widest pl-1 block ${center ? 'text-center' : ''}`}>{label}</label>
            <div className="relative group">
                <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary group-focus-within:text-accent transition-colors ${center ? 'hidden' : ''}`} />
                <input
                    type={type}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className={`w-full bg-background border border-border rounded-xl py-3.5 text-sm font-medium text-primary outline-none focus:border-accent transition-all placeholder:text-secondary/30 ${center ? 'text-center px-4 tracking-[0.5em] font-mono' : 'pl-12 pr-4'}`}
                    placeholder={placeholder}
                    required
                    maxLength={maxLength}
                />
            </div>
        </div>
    );
}

// Reusable Button
function SubmitButton({ children, loading }) {
    return (
        <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-accent text-brand-dark rounded-xl font-bold uppercase tracking-wider text-xs hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-2 group"
        >
            {loading ? 'Processing...' : children}
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
        </button>
    );
}

