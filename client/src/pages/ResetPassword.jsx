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
            <div className="min-h-screen bg-background flex items-center justify-center p-4 font-sans">
                <div className="bg-surface p-12 rounded-premium border border-red-400/20 text-center shadow-2xl">
                    <h2 className="text-red-400 font-bold uppercase tracking-widest mb-4">Invalid Sequence</h2>
                    <p className="text-secondary font-medium text-sm">Missing core recovery parameters.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-sm bg-surface rounded-premium shadow-2xl border border-white/5 overflow-hidden p-10">

                {success ? (
                    <div className="text-center space-y-8 py-10">
                        <div className="w-20 h-20 bg-accent/5 border border-accent/20 rounded-premium flex items-center justify-center mx-auto text-accent shadow-soft">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-primary uppercase tracking-tight">Key Synchronized</h2>
                            <p className="text-secondary text-[10px] font-bold uppercase tracking-widest">Redirecting to terminal sync...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="mb-10">
                            <h2 className="text-2xl font-bold text-primary uppercase tracking-tight">Cailbrate Key</h2>
                            <p className="text-secondary text-[10px] font-bold uppercase tracking-[0.3em] mt-3">
                                Securing node {email}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-8 p-4 bg-red-400/5 border border-red-400/20 rounded-instrument flex items-center gap-4">
                                <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                                <span className="text-red-400 text-[10px] font-bold uppercase tracking-widest">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-muted uppercase tracking-[0.3em] ml-1">New Access Key</label>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent transition-all" />
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        className="w-full bg-background border border-white/5 rounded-instrument py-4 pl-14 pr-6 text-sm font-bold text-primary outline-none focus:border-accent/40 transition-all placeholder:text-muted/20"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-muted uppercase tracking-[0.3em] ml-1">Confirm Key</label>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent transition-all" />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className="w-full bg-background border border-white/5 rounded-instrument py-4 pl-14 pr-6 text-sm font-bold text-primary outline-none focus:border-accent/40 transition-all placeholder:text-muted/20"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-accent text-background rounded-instrument font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-primary transition-all disabled:opacity-50 shadow-soft flex items-center justify-center gap-4 group mt-4"
                            >
                                {loading ? 'Calibrating...' : 'Sync New Key'}
                                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
