import React, { createContext, useState, useEffect, useContext } from 'react';
import { RiskManager } from '../utils/riskManagement';

import { useSettings } from './SettingsContext';

const RiskManagementContext = createContext();

export function RiskManagementProvider({ children, initialBalance, currentBalance }) {
    const { settings } = useSettings();
    const [riskStatus, setRiskStatus] = useState({
        isActive: true,
        dailyLoss: 0,
        dailyLossPercentage: 0,
        maxDrawdown: 0,
        maxDrawdownPercentage: 0,
        warnings: [],
    });

    const [accountLocked, setAccountLocked] = useState(false);
    const [lockReason, setLockReason] = useState('');

    // Maintain a ref for manager to persist across renders
    const managerRef = React.useRef(null);

    useEffect(() => {
        // Initialize Manager only once or when initialBalance changes drastically (account switch)
        if (!managerRef.current && initialBalance) {
            managerRef.current = new RiskManager(initialBalance, settings?.['daily-loss-limit'] || 5, settings?.['max-drawdown'] || 10);
        }
    }, [initialBalance]);

    // Update limits when settings change
    useEffect(() => {
        if (managerRef.current && settings) {
            managerRef.current.updateLimits(settings['daily-loss-limit'], settings['max-drawdown']);
        }
    }, [settings]);

    useEffect(() => {
        if (!managerRef.current || !currentBalance) return;

        const result = managerRef.current.checkDrawdown(currentBalance);
        const warnings = [];

        if (result.limitWarning) {
            warnings.push(`Warning: Drawdown Clean (${result.dailyLossPercent}% / ${result.maxLossPercent}%)`);
        }

        if (result.violated) {
            setAccountLocked(true);
            setLockReason(result.message);
            warnings.push(result.message);
        }

        setRiskStatus({
            isActive: !result.violated,
            dailyLossPercentage: parseFloat(result.dailyLossPercent),
            maxDrawdownPercentage: parseFloat(result.maxLossPercent),
            warnings
        });

    }, [currentBalance]);

    return (
        <RiskManagementContext.Provider value={{ riskStatus, accountLocked, lockReason }}>
            {children}
        </RiskManagementContext.Provider>
    );
}

export const useRiskManagement = () => {
    const context = useContext(RiskManagementContext);
    if (!context) {
        // Fallback when context is not available
        return {
            riskStatus: {
                isActive: true,
                dailyLoss: 0,
                dailyLossPercentage: 0,
                maxDrawdown: 0,
                maxDrawdownPercentage: 0,
                warnings: []
            },
            accountLocked: false,
            lockReason: ''
        };
    }
    return context;
};

// Risk Status Display Component
export function RiskStatusBanner() {
    const { riskStatus, accountLocked, lockReason } = useRiskManagement();

    if (accountLocked) {
        return (
            <div className="bg-red-500 text-white p-3 flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top-4 relative z-50 shadow-2xl">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <span className="font-black uppercase tracking-widest text-xs">Account Locked</span>
                    <span className="text-xs font-mono bg-black/20 px-2 py-0.5 rounded opacity-90">{lockReason}</span>
                </div>
            </div>
        );
    }

    if (riskStatus.warnings.length > 0) {
        return (
            <div className="bg-yellow-500/10 border-b border-yellow-500/20 backdrop-blur-md p-2 flex items-center justify-between px-4 sm:px-6 animate-in fade-in relative z-40">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-ping"></div>
                    <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Risk Warning</span>
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-6 text-[10px] font-mono text-yellow-400">
                    {riskStatus.warnings.map((w, i) => <span key={i}>{w}</span>)}
                    <div className="flex gap-4 opacity-50 hidden sm:flex">
                        <span>DD: {riskStatus.maxDrawdownPercentage.toFixed(2)}%</span>
                        <span>DL: {riskStatus.dailyLossPercentage.toFixed(2)}%</span>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}

