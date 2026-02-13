import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';

const AlertContext = createContext();

export const useAlerts = () => {
    const context = useContext(AlertContext);
    if (!context) return { alerts: [], addAlert: () => { }, removeAlert: () => { }, clearTriggered: () => { } };
    return context;
};

export const AlertProvider = ({ children, quotes }) => {
    const [alerts, setAlerts] = useState(() => {
        const saved = localStorage.getItem('price_alerts');
        return saved ? JSON.parse(saved) : [];
    });
    const { addToast } = useToast();

    // Persist alerts
    useEffect(() => {
        localStorage.setItem('price_alerts', JSON.stringify(alerts));
    }, [alerts]);

    const addAlert = useCallback((alert) => {
        const newAlert = {
            id: `alert_${Date.now()}`,
            createdAt: Date.now(),
            triggered: false,
            ...alert
        };
        setAlerts(prev => [...prev, newAlert]);
        addToast(`Alert set for ${alert.symbol} at ${alert.targetPrice}`, 'info');
    }, [addToast]);

    const removeAlert = useCallback((id) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    }, []);

    const clearTriggered = useCallback(() => {
        setAlerts(prev => prev.filter(a => !a.triggered));
    }, []);

    // Check alerts against price updates
    useEffect(() => {
        if (!quotes) return;

        let triggeredAny = false;
        const updatedAlerts = alerts.map(alert => {
            if (alert.triggered) return alert;

            const currentQuote = quotes[alert.symbol];
            if (!currentQuote) return alert;

            const currentPrice = currentQuote.ltp;

            // Check if price crossed the target
            // If direction is 'buy' (expecting price to go UP to target)
            // If direction is 'sell' (expecting price to go DOWN to target)
            // Or more simply based on where current price was when set.
            // Let's use a simple cross check:
            let isTriggered = false;
            if (alert.initialPrice < alert.targetPrice) {
                // We are waiting for price to go UP
                if (currentPrice >= alert.targetPrice) isTriggered = true;
            } else {
                // We are waiting for price to go DOWN
                if (currentPrice <= alert.targetPrice) isTriggered = true;
            }

            if (isTriggered) {
                triggeredAny = true;
                addToast(`🔔 ALERT: ${alert.symbol} reached ${alert.targetPrice}!`, 'info');
                // Play sound if possible
                try {
                    const audio = new Audio('/alert-sound.mp3'); // Assuming one exists or fallback
                    audio.play().catch(() => { });
                } catch (e) { }

                return { ...alert, triggered: true };
            }
            return alert;
        });

        if (triggeredAny) {
            setAlerts(updatedAlerts);
        }
    }, [quotes, alerts, addToast]);

    return (
        <AlertContext.Provider value={{ alerts, addAlert, removeAlert, clearTriggered }}>
            {children}
        </AlertContext.Provider>
    );
};

