import React, { createContext, useState, useEffect, useContext } from 'react';
import { useToast } from './ToastContext';

const AlgoContext = createContext();

export function AlgoProvider({ children }) {
    const [activeBots, setActiveBots] = useState([]);
    const { addToast } = useToast();

    // AVAILABLE STRATEGIES
    const availableStrategies = [
        {
            id: 'STRAT_RSI_MOMENTUM', // ID matches Server STRATEGY constant
            name: 'RSI Momentum Scalper',
            description: 'Classic mean reversion. Longs when RSI < 30, Shorts when RSI > 70.',
            risk: 'Medium',
            params: { period: 14, overbought: 70, oversold: 30, qty: 1 }
        },
        {
            id: 'STRAT_EMA_CROSS',
            name: 'EMA Trend Follower',
            description: 'Enters Long when Price > EMA. Enters Short when Price < EMA.',
            risk: 'High',
            params: { period: 20, type: 'EMA', qty: 1 }
        },
        {
            id: 'STRAT_FLUX_GRID',
            name: 'Flux Grid Protocol',
            description: 'Places varying limit orders above/below price to capture volatility.',
            risk: 'Low',
            params: { grids: 5, spread: 10, qty: 1 }
        }
    ];

    // Fetch bots from Server
    const refreshBots = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await fetch('/api/algo/bots', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const bots = await res.json();
                // Map server bots to UI format if needed, mostly they match
                setActiveBots(bots.map(b => ({
                    ...b,
                    name: availableStrategies.find(s => s.id === b.strategy)?.name || b.strategy,
                    strategyId: b.strategy, // UI uses strategyId sometimes
                    lastTrade: b.lastTradeTime || 0, // Server might not send this yet
                    totalTrades: b.tradesCount || 0
                })));
            }
        } catch (error) {
            console.error("Failed to fetch bots:", error);
        }
    };

    // Poll for updates
    useEffect(() => {
        refreshBots();
        const interval = setInterval(refreshBots, 2000);
        return () => clearInterval(interval);
    }, []);

    const startBot = async (strategyId, symbol, params, accountId) => { // Added accountId
        try {
            const token = localStorage.getItem('token');
            // If no accountId passed, we failed. UI must provide it.
            // For now, if missing, we pick from localStorage or Context? 
            // Better to fail if not provided, but UI (AlgoManager) doesn't have it yet.
            // We will need to pass accountId from UI.

            if (!accountId) {
                addToast('Account ID missing', 'error');
                return;
            }

            const strategy = availableStrategies.find(s => s.id === strategyId);
            const res = await fetch('/api/algo/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    accountId,
                    symbol,
                    strategy: strategyId,
                    risk: strategy.risk // Default risk
                })
            });

            if (res.ok) {
                addToast(`${strategy.name} Activated on ${symbol}`, 'success');
                refreshBots();
            } else {
                const err = await res.json();
                addToast(err.error || 'Failed to start bot', 'error');
            }
        } catch (e) {
            addToast('Network Error', 'error');
        }
    };

    const stopBot = async (botId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/algo/stop', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ botId })
            });

            if (res.ok) {
                addToast('Algo Instance Terminated', 'error'); // Red toast for stop
                refreshBots();
            }
        } catch (e) {
            addToast('Failed to stop bot', 'error');
        }
    };

    return (
        <AlgoContext.Provider value={{ activeBots, startBot, stopBot, availableStrategies }}>
            {children}
        </AlgoContext.Provider>
    );
}

export const useAlgo = () => useContext(AlgoContext);

