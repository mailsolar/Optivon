import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, ArrowRight, ShieldCheck, QrCode } from 'lucide-react';

export default function AuthModal({ onClose, onLoginSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [mfaCode, setMfaCode] = useState('');
    const [mfaSetup, setMfaSetup] = useState(null);
    const [showMfaInput, setShowMfaInput] = useState(false);
    const [userId, setUserId] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const endpoint = isLogin ? 'login' : 'register';

        try {
            const res = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            if (isLogin) {
                if (data.mfaRequired) {
                    setUserId(data.userId);
                    setShowMfaInput(true);
                } else {
                    localStorage.setItem('token', data.token);
                    onLoginSuccess(data.user);
                }
            } else {
                setUserId(data.userId);
                setMfaSetup(data.imData);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleMfaVerify = async () => {
        setError('');
        try {
            const res = await fetch('http://localhost:5000/api/auth/2fa/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, token: mfaCode })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            if (data.verified) {
                localStorage.setItem('token', data.token);
                onLoginSuccess(data.user); // Ideally fetch full user if needed
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4">
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
                                {isLogin ? 'Welcome Back' : 'Join Optivon'}
                            </h2>
                            <p className="text-secondary text-xs font-mono mt-1">
                                {isLogin ? 'Access your terminal.' : 'Begin your evaluation.'}
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
                        <div className="mx-8 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-red-500 text-[10px] font-black uppercase tracking-wider">{error}</span>
                        </div>
                    )}

                    <div className="p-8 space-y-6">
                        {!mfaSetup && !showMfaInput && (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest pl-1">Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary group-focus-within:text-accent transition-colors" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-3.5 text-sm font-medium text-primary outline-none focus:border-accent transition-all placeholder:text-secondary/30"
                                            placeholder="trader@optivon.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest pl-1">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary group-focus-within:text-accent transition-colors" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-3.5 text-sm font-medium text-primary outline-none focus:border-accent transition-all placeholder:text-secondary/30"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-accent text-brand-dark rounded-xl font-bold uppercase tracking-wider text-xs hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 group"
                                >
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>
                        )}

                        {/* MFA Setup */}
                        {mfaSetup && (
                            <div className="space-y-6 text-center animate-in slide-in-from-right duration-300">
                                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto text-accent mb-4">
                                    <QrCode className="w-8 h-8" />
                                </div>
                                <div className="p-4 bg-white rounded-xl inline-block border border-border">
                                    <img src={mfaSetup} alt="QR" className="w-40 h-40 mix-blend-multiply" />
                                </div>
                                <p className="text-secondary text-xs font-medium">Scan with your authenticator app</p>
                                <input
                                    type="text"
                                    value={mfaCode}
                                    onChange={e => setMfaCode(e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-4 text-center text-xl font-mono font-bold text-primary tracking-[0.5em] outline-none focus:border-accent transition-all"
                                    placeholder="000000"
                                    maxLength={6}
                                />
                                <button
                                    onClick={handleMfaVerify}
                                    className="w-full py-4 bg-accent text-brand-dark rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-accent/90 transition-colors"
                                >
                                    Verify Setup
                                </button>
                            </div>
                        )}

                        {/* MFA Verification (Login) */}
                        {showMfaInput && (
                            <div className="space-y-6 text-center animate-in slide-in-from-right duration-300">
                                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto text-accent mb-4">
                                    <ShieldCheck className="w-8 h-8" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-primary">Security Check</h3>
                                    <p className="text-secondary text-xs">Enter your 2FA code</p>
                                </div>
                                <input
                                    type="text"
                                    value={mfaCode}
                                    onChange={e => setMfaCode(e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-4 text-center text-xl font-mono font-bold text-primary tracking-[0.5em] outline-none focus:border-accent transition-all"
                                    placeholder="000000"
                                    maxLength={6}
                                    autoFocus
                                />
                                <button
                                    onClick={handleMfaVerify}
                                    className="w-full py-4 bg-accent text-brand-dark rounded-xl font-bold uppercase tracking-wider text-xs hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Unlock Terminal
                                </button>
                            </div>
                        )}

                        {/* Toggle Mode */}
                        <div className="pt-4 border-t border-border text-center">
                            <button
                                onClick={() => { setIsLogin(!isLogin); setError(''); setMfaSetup(null); setShowMfaInput(null); }}
                                className="text-[10px] font-black text-secondary hover:text-primary uppercase tracking-widest transition-colors"
                            >
                                {isLogin ? 'New to Optivon? Start Challenge' : 'Have an account? Log In'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
