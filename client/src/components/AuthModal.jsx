
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
                // Register Success -> Show MFA Setup
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
                // Need to fetch user details again or just use what we have? 
                // The verify endpoint returns token. We should fetch /me to get full user object.
                const meRes = await fetch('http://localhost:5000/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${data.token}` }
                });
                const meData = await meRes.json();
                onLoginSuccess(meData.user);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-md bg-[#0a0a12] border border-cyber-cyan/30 p-8 rounded-2xl shadow-[0_0_40px_rgba(0,243,255,0.15)] overflow-hidden"
                >
                    {/* Decor */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-cyan to-transparent"></div>

                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>

                    <h2 className="text-3xl font-bold text-white mb-2 text-center font-orb tracking-wider">
                        {isLogin ? 'SYSTEM LOGIN' : 'NEW OPERATOR'}
                    </h2>
                    <p className="text-center text-gray-400 text-sm mb-8 font-mono">Authenticate to access the neural network.</p>

                    {error && (
                        <div className="mb-6 p-3 bg-red-900/20 border border-red-500/50 text-red-400 text-xs font-mono text-center rounded">
                            ERROR: {error}
                        </div>
                    )}

                    {!mfaSetup && !showMfaInput && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-cyber-cyan mb-2 uppercase tracking-wider">Email Identity</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan outline-none transition-all"
                                    placeholder="operator@optivon.net"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-cyber-cyan mb-2 uppercase tracking-wider">Passcode</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-4 bg-cyber-cyan text-black font-bold uppercase tracking-widest hover:bg-white transition-all rounded"
                            >
                                {isLogin ? 'Connect' : 'Register'}
                            </button>
                        </form>
                    )}

                    {/* MFA Setup Step */}
                    {mfaSetup && (
                        <div className="text-center space-y-6">
                            <div className="p-4 bg-white rounded-lg inline-block">
                                <img src={mfaSetup} alt="QR" className="w-48 h-48" />
                            </div>
                            <p className="text-sm text-gray-300 font-mono">Scan this QR code with your authenticator device.</p>
                            <input
                                type="text"
                                value={mfaCode}
                                onChange={e => setMfaCode(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-center text-xl tracking-widest text-white focus:border-cyber-cyan outline-none"
                                placeholder="000 000"
                                maxLength={6}
                            />
                            <button
                                onClick={handleMfaVerify}
                                className="w-full py-3 bg-cyber-purple text-white font-bold uppercase tracking-widest hover:bg-cyber-purple/80 transition-all rounded shadow-[0_0_15px_rgba(189,0,255,0.4)]"
                            >
                                Verify & Access
                            </button>
                        </div>
                    )}

                    {/* MFA Login Step */}
                    {showMfaInput && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyber-cyan/10 text-cyber-cyan mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                </div>
                                <h3 className="text-white font-bold mb-2">Security Verification</h3>
                                <p className="text-gray-400 text-xs font-mono">Enter the 6-digit code from your authenticator.</p>
                            </div>
                            <input
                                type="text"
                                value={mfaCode}
                                onChange={e => setMfaCode(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-center text-2xl tracking-[0.5em] text-white focus:border-cyber-cyan outline-none"
                                placeholder="000000"
                                maxLength={6}
                            />
                            <button
                                onClick={handleMfaVerify}
                                className="w-full py-4 bg-cyber-cyan text-black font-bold uppercase tracking-widest hover:bg-white transition-all rounded shadow-neon-cyan"
                            >
                                Unlock Session
                            </button>
                        </div>
                    )}

                    <div className="mt-8 text-center">
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(''); setMfaSetup(null); setShowMfaInput(null); }}
                            className="text-gray-500 hover:text-cyber-cyan text-xs uppercase tracking-widest transition-colors"
                        >
                            {isLogin ? 'Request New Identity' : 'Existing Operator? Login'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
