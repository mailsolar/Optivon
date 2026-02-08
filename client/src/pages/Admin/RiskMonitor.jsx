import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

export default function RiskMonitor() {
    const { token } = useAuth();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRiskData();
        const interval = setInterval(fetchRiskData, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    const fetchRiskData = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/risk-monitor', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAccounts(data);
            }
        } catch (err) {
            console.error("Failed to fetch risk data", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-black font-display text-primary">Live Risk Monitor</h1>
                <button
                    onClick={fetchRiskData}
                    className="p-2 bg-surface border border-border rounded-lg text-secondary hover:text-primary transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map(acc => (
                    <RiskCard key={acc.id} account={acc} />
                ))}
            </div>

            {!loading && accounts.length === 0 && (
                <div className="text-center py-12 text-secondary">
                    No active accounts to monitor.
                </div>
            )}
        </div>
    );
}

function RiskCard({ account }) {
    const isDanger = account.isDanger;
    const size = account.size;
    const equity = account.equity || account.balance;
    const maxLossLimit = size * 0.90; // 10% DD

    // Progress towards failure (0% to 100%)
    // If equity = size, 0% relative loss. If equity = 90k, 100% relative loss.
    // Loss = Size - Equity. Max Loss = Size * 0.10.
    const lossAmount = size - equity;
    const maxAllowedLoss = size * 0.10;
    const usagePct = Math.min(Math.max((lossAmount / maxAllowedLoss) * 100, 0), 100);

    return (
        <div className={`p-4 rounded-xl border ${isDanger ? 'bg-red-500/5 border-red-500/30' : 'bg-surface border-border'}`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-primary">Account #{account.id}</h3>
                    <p className="text-xs text-secondary font-mono">${size.toLocaleString()} {account.type}</p>
                </div>
                {isDanger ? (
                    <AlertCircle className="w-5 h-5 text-red-500 animate-pulse" />
                ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                )}
            </div>

            <div className="space-y-3">
                {/* Max DD Meter */}
                <div>
                    <div className="flex justify-between text-[10px] uppercase font-bold text-secondary mb-1">
                        <span>Max Drawdown Risk</span>
                        <span className={isDanger ? 'text-red-400' : 'text-emerald-400'}>{usagePct.toFixed(1)}% Used</span>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${isDanger ? 'bg-red-500' : 'bg-emerald-500'}`}
                            style={{ width: `${usagePct}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-secondary mt-1">
                        <span>Eq: ${equity.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        <span>Limit: ${maxLossLimit.toLocaleString()}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 bg-background rounded-lg">
                        <div className="text-[10px] text-secondary">Daily DD</div>
                        <div className="text-xs font-bold font-mono text-primary">{account.dailyDD}%</div>
                    </div>
                    <div className="p-2 bg-background rounded-lg">
                        <div className="text-[10px] text-secondary">Total DD</div>
                        <div className="text-xs font-bold font-mono text-primary">{account.currentDD}%</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
