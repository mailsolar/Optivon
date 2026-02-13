import React, { useState } from 'react';
import { Settings, X, Shield, Activity, Bell, Layout, Monitor, Zap, TrendingUp, TrendingDown, Mail, Smartphone, Volume2, Grid, MousePointer, Info } from 'lucide-react';

const SETTINGS_CATEGORIES = {
    GENERAL: [
        { id: 'show-volumes', label: 'Show Trade Volumes', type: 'checkbox', default: false, icon: Activity },
        { id: 'show-askline', label: 'Show Ask Line', type: 'checkbox', default: true, icon: Activity },
        { id: 'show-ohlc', label: 'Show OHLC', type: 'checkbox', default: false, icon: Layout },
        { id: 'show-period-sep', label: 'Show Period Separators', type: 'checkbox', default: true, icon: Grid },
        { id: 'auto-scroll', label: 'Auto Scroll Charts', type: 'checkbox', default: true, icon: MousePointer },
    ],
    TRADING: [
        { id: 'one-click-trading', label: 'Enable One-Click Trading', type: 'checkbox', default: false, icon: Zap },
        { id: 'confirm-order', label: 'Confirm Orders Before Execution', type: 'checkbox', default: true, icon: Shield },
        { id: 'show-trade-levels', label: 'Show Trade Levels on Chart', type: 'checkbox', default: true, icon: Layout },
        { id: 'expert-advisors', label: 'Allow Expert Advisors', type: 'checkbox', default: false, icon: Smartphone },
    ],
    NOTIFICATIONS: [
        { id: 'sound-alerts', label: 'Enable Sound Alerts', type: 'checkbox', default: true, icon: Volume2 },
        { id: 'push-notifications', label: 'Push Notifications', type: 'checkbox', default: true, icon: Smartphone },
        { id: 'email-alerts', label: 'Email Alerts', type: 'checkbox', default: false, icon: Mail },
    ],
    RISK_MANAGEMENT: [
        { id: 'max-drawdown', label: 'Maximum Drawdown (%)', type: 'number', default: 10, min: 1, max: 20, step: 0.5, icon: Shield },
        { id: 'daily-loss-limit', label: 'Daily Loss Limit (%)', type: 'number', default: 5, min: 0.5, max: 10, step: 0.5, icon: Shield },
        { id: 'max-position-size', label: 'Max Position Size (Lots)', type: 'number', default: 10, min: 1, max: 100, step: 1, icon: Shield },
        { id: 'stop-loss-required', label: 'Require Stop Loss', type: 'checkbox', default: true, icon: Shield },
    ],
    APPEARANCE: [
        { id: 'theme', label: 'Color Theme', type: 'select', options: ['OptiVon Dark', 'Light', 'Cyberpunk'], default: 'OptiVon Dark', icon: Monitor },
        { id: 'chart-bg', label: 'Chart Background', type: 'color', default: '#0a0e27', icon: Layout },
        { id: 'grid-color', label: 'Grid Color', type: 'color', default: '#1a1e2e', icon: Grid },
        { id: 'bull-color', label: 'Bullish Candle Color', type: 'color', default: '#00C853', icon: TrendingUp },
        { id: 'bear-color', label: 'Bearish Candle Color', type: 'color', default: '#FF1744', icon: TrendingDown },
    ],
};

import { useSettings } from '../../context/SettingsContext';

export default function SettingsPanel({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('GENERAL');
    const { settings, updateSetting, resetSettings } = useSettings();

    const handleChange = (id, value) => {
        updateSetting(id, value);

        // Auto-update Colors based on Theme Selection
        if (id === 'theme') {
            if (value === 'Light') {
                updateSetting('chart-bg', '#ffffff');
                updateSetting('grid-color', '#e5e7eb');
                updateSetting('bull-color', '#26a69a');
                updateSetting('bear-color', '#ef5350');
            } else if (value === 'Cyberpunk') {
                updateSetting('chart-bg', '#090014');
                updateSetting('grid-color', '#2a0a4a');
                updateSetting('bull-color', '#00ffd5');
                updateSetting('bear-color', '#ff0055');
            } else { // Default Dark
                updateSetting('chart-bg', '#0a0e27');
                updateSetting('grid-color', '#1a1e2e');
                updateSetting('bull-color', '#26a69a');
                updateSetting('bear-color', '#ef5350');
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] animate-in fade-in duration-200">
            <div className="bg-[#0a0e27] border border-white/10 rounded-2xl w-full max-w-5xl h-[85vh] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex overflow-hidden">

                {/* Sidebar */}
                <div className="w-72 bg-[#1a1e2e]/50 border-r border-white/5 flex flex-col">
                    <div className="p-6 border-b border-white/5">
                        <h2 className="text-xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
                            <Settings className="w-6 h-6 text-blue-500 animate-[spin_10s_linear_infinite]" />
                            Sys Config
                        </h2>
                        <p className="text-[10px] text-gray-500 mt-2 font-mono">TERMINAL v2.1.0</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-1">
                        {Object.keys(SETTINGS_CATEGORIES).map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveTab(category)}
                                className={`w-full text-left px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === category
                                    ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-lg shadow-blue-900/10'
                                    : 'text-gray-500 hover:bg-white/5 hover:text-white border border-transparent'
                                    }`}
                            >
                                {category.replace(/_/g, ' ')}
                            </button>
                        ))}
                    </div>

                    <div className="p-4 border-t border-white/5">
                        <button
                            onClick={() => {
                                if (window.confirm("Reset all settings to default?")) {
                                    if (window.confirm("Reset all settings to default?")) {
                                        resetSettings();
                                        window.location.reload();
                                    }
                                }
                            }}
                            className="w-full bg-red-500/5 hover:bg-red-500/10 text-red-500 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border border-red-500/10 hover:border-red-500/30"
                        >
                            <Shield className="w-3 h-3" /> Factory Reset
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col bg-[#0a0e27]">
                    {/* Header */}
                    <div className="flex items-center justify-between p-8 border-b border-white/5 bg-[#0a0e27]">
                        <div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-1">{activeTab.replace(/_/g, ' ')}</h3>
                            <p className="text-xs text-gray-500">Configure global parameters for this session.</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors border border-white/5 hover:border-white/20"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Settings List */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-6">
                        {SETTINGS_CATEGORIES[activeTab]?.map((setting) => (
                            <div key={setting.id} className="flex items-center justify-between p-6 bg-[#1a1e2e]/30 border border-white/5 rounded-2xl hover:border-white/10 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${settings[setting.id] !== undefined ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-800/50 text-gray-600'} transition-colors`}>
                                        {setting.icon && <setting.icon className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{setting.label}</div>
                                        <div className="text-[10px] text-gray-600 font-mono uppercase tracking-wide">ID: {setting.id}</div>
                                    </div>
                                </div>

                                <div className="w-48">
                                    {setting.type === 'checkbox' && (
                                        <label className="relative inline-flex items-center cursor-pointer float-right">
                                            <input
                                                type="checkbox"
                                                checked={settings[setting.id] ?? setting.default}
                                                onChange={(e) => handleChange(setting.id, e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    )}

                                    {setting.type === 'number' && (
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={settings[setting.id] ?? setting.default}
                                                onChange={(e) => handleChange(setting.id, parseFloat(e.target.value))}
                                                min={setting.min}
                                                max={setting.max}
                                                step={setting.step || 1}
                                                className="w-full bg-[#0a0e27] border border-white/10 rounded-xl px-4 py-2.5 text-right font-mono font-bold text-white focus:border-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                    )}

                                    {setting.type === 'select' && (
                                        <div className="relative">
                                            <select
                                                value={settings[setting.id] ?? setting.default}
                                                onChange={(e) => handleChange(setting.id, e.target.value)}
                                                className="w-full bg-[#0a0e27] border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold text-xs focus:border-blue-500 outline-none appearance-none transition-all"
                                            >
                                                {setting.options.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {setting.type === 'color' && (
                                        <div className="relative flex justify-end">
                                            <input
                                                type="color"
                                                value={settings[setting.id] ?? setting.default}
                                                onChange={(e) => handleChange(setting.id, e.target.value)}
                                                className="w-full h-10 bg-transparent cursor-pointer rounded-xl"
                                                style={{ border: 'none' }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="p-8 border-t border-white/5 flex justify-between items-center bg-[#0a0e27]">
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            CHANGES AUTO-SAVED
                        </div>
                        <button
                            onClick={onClose}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                        >
                            Close Config
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

