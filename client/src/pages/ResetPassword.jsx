import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { API_BASE_URL } from '../config';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const email = searchParams.get('email');
    const code = searchParams.get('code');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, newPassword })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!email || !code) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="bg-surface p-8 rounded-3xl border border-red-500/20 text-center">
                    <h2 className="text-red-500 font-bold mb-2">Invalid Link</h2>
                    <p className="text-secondary text-sm">Missing recovery parameters.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-surface rounded-3xl shadow-2xl border border-border overflow-hidden p-8">

                {success ? (
                    <div className="text-center space-y-4 py-8">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto text-emerald-500">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-black font-display text-primary">Password Reset!</h2>
                        <p className="text-secondary text-sm">Redirecting you to login...</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-8">
                            <h2 className="text-2xl font-black font-display text-primary tracking-tight">Reset Password</h2>
                            <p className="text-secondary text-xs font-mono mt-1">
                                Secure your account for {email}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                <span className="text-red-500 text-[10px] font-black uppercase tracking-wider">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest pl-1">New Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary group-focus-within:text-accent transition-colors" />
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-3.5 text-sm font-medium text-primary outline-none focus:border-accent transition-all placeholder:text-secondary/30"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest pl-1">Confirm Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary group-focus-within:text-accent transition-colors" />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-3.5 text-sm font-medium text-primary outline-none focus:border-accent transition-all placeholder:text-secondary/30"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-accent text-brand-dark rounded-xl font-bold uppercase tracking-wider text-xs hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-2 group"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

