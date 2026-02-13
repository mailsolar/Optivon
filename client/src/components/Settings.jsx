import React, { useState } from 'react';

export default function Settings({ user }) {
    const [qrCode, setQrCode] = useState(null);
    const [secret, setSecret] = useState(null);
    const [token, setToken] = useState('');
    const [status, setStatus] = useState('');

    const enable2FA = async () => {
        try {
            const res = await fetch('/api/auth/2fa/setup', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await res.json();
            if (data.qrCode) {
                setQrCode(data.qrCode);
                setSecret(data.secret);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const verifyAndActivate = async () => {
        try {
            const res = await fetch('/api/auth/2fa/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ token, secret }) // Send secret to verify against if not saved yet, or just token
                // Note: backend /2fa/verify checks against DB user secret usually. 
                // In our setup logic, we saved the secret to DB immediately (simpler).
                // So we just need to verify usage.
            });
            const data = await res.json();
            if (data.verified) {
                setStatus('2FA Activated Successfully');
                setQrCode(null);
            } else {
                setStatus('Invalid Code. Try again.');
            }
        } catch (err) {
            setStatus('Error verifying');
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-white border-b border-white/10 pb-4">System Configuration</h2>

            <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-cyber-cyan">Two-Factor Authentication</h3>
                        <p className="text-gray-400 text-sm mt-1">Secure your terminal access.</p>
                    </div>
                    {!qrCode && (
                        <button
                            onClick={enable2FA}
                            className="px-4 py-2 bg-cyber-purple/20 border border-cyber-purple text-cyber-purple hover:bg-cyber-purple hover:text-white transition-all uppercase text-xs font-bold tracking-widest rounded"
                        >
                            Enable 2FA
                        </button>
                    )}
                </div>

                {qrCode && (
                    <div className="bg-black/50 p-6 rounded border border-white/10 text-center animate-pulse-border">
                        <p className="mb-4 text-sm text-gray-300">Scan this QR code with Google Authenticator:</p>
                        <img src={qrCode} alt="2FA QR" className="mx-auto border-4 border-white mb-4 w-48 h-48" />

                        <div className="max-w-xs mx-auto space-y-3">
                            <input
                                type="text"
                                placeholder="Enter 6-digit Code"
                                value={token}
                                onChange={e => setToken(e.target.value)}
                                maxLength="6"
                                className="w-full bg-void border border-white/20 p-2 text-center text-white tracking-[0.5em] focus:border-cyber-cyan outline-none"
                            />
                            <button
                                onClick={verifyAndActivate}
                                className="w-full py-2 bg-cyber-cyan text-black font-bold uppercase text-xs tracking-widest hover:brightness-110"
                            >
                                Verify & Activate
                            </button>
                        </div>
                    </div>
                )}

                {status && <div className="mt-4 text-center text-cyber-cyan font-mono">{status}</div>}
            </div>
        </div>
    );
}

