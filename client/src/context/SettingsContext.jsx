
import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

const DEFAULT_SETTINGS = {
    // General
    'show-volumes': false,
    'show-askline': true,
    'show-ohlc': false,
    'show-period-sep': true,
    'auto-scroll': true,

    // Trading
    'one-click-trading': false,
    'confirm-order': true,
    'show-trade-levels': true,
    'expert-advisors': false,

    // Notifications
    'sound-alerts': true,
    'push-notifications': true,
    'email-alerts': false,

    // Risk Management
    'max-drawdown': 10,
    'daily-loss-limit': 5,
    'max-position-size': 10,
    'stop-loss-required': true,

    // Trading
    'one-click-trading': false,
    'confirm-order': true,
    'show-trade-levels': true,
    'expert-advisors': false,

    // Appearance
    'theme': 'OptiVon Dark',
    'chart-bg': '#0a0e27',
    'grid-color': '#1a1e2e',
    'bull-color': '#26a69a', // Standard Green
    'bear-color': '#ef5350', // Standard Red
    'version': 2 // Increment to force reset
};

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('optivon_settings');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Force reset if version mismatch (fixes old color schema persistence)
            if (parsed.version !== DEFAULT_SETTINGS.version) {
                return DEFAULT_SETTINGS;
            }
            return { ...DEFAULT_SETTINGS, ...parsed };
        }
        return DEFAULT_SETTINGS;
    });

    const updateSetting = (key, value) => {
        setSettings(prev => {
            const newSettings = { ...prev, [key]: value };
            localStorage.setItem('optivon_settings', JSON.stringify(newSettings));
            return newSettings;
        });
    };

    const resetSettings = () => {
        setSettings(DEFAULT_SETTINGS);
        localStorage.removeItem('optivon_settings');
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

