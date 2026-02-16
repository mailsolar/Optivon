import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';

const AlertContext = createContext();

export const useAlerts = () => {
    const context = useContext(AlertContext);
    if (!context) return { alerts: [], addAlert: () => { }, removeAlert: () => { }, clearTriggered: () => { }, checkAlerts: () => { } };
    return context;
};

export const AlertProvider = ({ children }) => {
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

    // Logic to check alerts against provided quotes
    const checkAlerts = useCallback((quotes) => {
        if (!quotes) return;

        setAlerts(prevAlerts => {
            let triggeredAny = false;
            const updatedAlerts = prevAlerts.map(alert => {
                if (alert.triggered) return alert;

                const currentQuote = quotes[alert.symbol];
                if (!currentQuote) return alert;

                const currentPrice = currentQuote.ltp;
                let isTriggered = false;

                if (alert.initialPrice < alert.targetPrice) {
                    // Waiting for check UP
                    if (currentPrice >= alert.targetPrice) isTriggered = true;
                } else {
                    // Waiting for check DOWN
                    if (currentPrice <= alert.targetPrice) isTriggered = true;
                }

                if (isTriggered) {
                    triggeredAny = true;
                    addToast(`🔔 ALERT: ${alert.symbol} reached ${alert.targetPrice}!`, 'info');
                    try {
                        const audio = new Audio('/alert-sound.mp3');
                        audio.play().catch(() => { });
                    } catch (e) { }

                    return { ...alert, triggered: true };
                }
                return alert;
            });

            return triggeredAny ? updatedAlerts : prevAlerts;
        });
    }, [addToast]);

    return (
        <AlertContext.Provider value={{ alerts, addAlert, removeAlert, clearTriggered, checkAlerts }}>
            {children}
        </AlertContext.Provider>
    );
};

