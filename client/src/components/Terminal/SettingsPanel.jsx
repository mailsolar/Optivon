import React, { useState } from 'react';
import { Settings, X, Shield, Activity, Bell, Layout, Monitor, Zap, TrendingUp, TrendingDown, Mail, Smartphone, Volume2, Grid, MousePointer, Info, Target, Clock, ArrowRight } from 'lucide-react';

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
        { id: 'section-title', label: 'PERSONAL RISK CONTROLS (Soft Limits)', type: 'title', icon: Shield },
        { id: 'max-drawdown', label: 'Personal Max Drawdown (%)', type: 'number', default: 10, min: 0.1, max: 100, step: 0.1, icon: Shield },
        { id: 'daily-loss-limit', label: 'Personal Daily Loss Limit (%)', type: 'number', default: 5, min: 0.1, max: 100, step: 0.1, icon: Shield },
        { id: 'max-position-size', label: 'Max Position Size (Lots)', type: 'number', default: 10, min: 1, max: 100, step: 1, icon: Shield },

        { id: 'section-separator', type: 'separator' },

        { id: 'firm-rules-title', label: 'FIRM ACCOUNT RULES (Hard Limits)', type: 'title', icon: Shield },
        { id: 'firm-max-dd', label: 'Max Account Drawdown', type: 'info', value: '5.0%', icon: Shield },
        { id: 'firm-daily-dd', label: 'Max Daily Drawdown', type: 'info', value: '3.0%', icon: Shield },
        { id: 'firm-profit-target', label: 'Profit Target', type: 'info', value: '8.0%', icon: Target },
        { id: 'firm-min-days', label: 'Min Trading Days', type: 'info', value: '5 Days', icon: Clock },
    ],
    APPEARANCE: [
        { id: 'theme', label: 'Color Theme', type: 'select', options: ['OptiVon Dark', 'Light', 'Cyberpunk'], default: 'OptiVon Dark', icon: Monitor },
        { id: 'chart-bg', label: 'Chart Background', type: 'color', default: '#0F0F10', icon: Layout },
        { id: 'grid-color', label: 'Grid Color', type: 'color', default: '#1a1a1a', icon: Grid },
        { id: 'bull-color', label: 'Bullish Candle Color', type: 'color', default: '#C50022', icon: TrendingUp },
        { id: 'bear-color', label: 'Bearish Candle Color', type: 'color', default: '#FFFFFF', icon: TrendingDown },
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
            } else { // Default Monolith Dark
                updateSetting('chart-bg', '#0F0F10');
                updateSetting('grid-color', '#1a1a1a');
                updateSetting('bull-color', '#C50022');
                updateSetting('bear-color', '#FFFFFF');
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-xl flex items-center justify-center z-[200] animate-in fade-in duration-300 p-6 sm:p-12">
            <div className="bg-background border border-white/[0.05] rounded-premium w-full max-w-6xl h-full max-h-[900px] shadow-premium flex overflow-hidden relative">
                
                {/* Sidebar */}
                <div className="w-80 bg-surface border-r border-white/5 flex flex-col shrink-0">
                    <div className="p-10 border-b border-white/[0.03]">
                        <h2 className="text-xl font-black text-primary tracking-tighter uppercase flex items-center gap-4 text-shadow-glow">
                            <Settings className="w-6 h-6 text-accent animate-[spin_12s_linear_infinite]" />
                            System Config
                        </h2>
                        <div className="flex items-center gap-2 mt-3">
                            <span className="text-[10px] text-accent font-black tracking-[0.3em] uppercase">INSTITUTIONAL // PROTOCOL</span>
                            <span className="w-1 h-1 bg-white/10 rounded-full" />
                            <span className="text-[10px] text-muted font-bold tracking-[0.1em] uppercase font-mono">v2.41</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-2">
                        {Object.keys(SETTINGS_CATEGORIES).map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveTab(category)}
                                className={`w-full text-left px-5 py-3.5 rounded-instrument text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-4 relative overflow-hidden group ${activeTab === category
                                    ? 'bg-accent/5 text-accent border border-accent/20 shadow-inner'
                                    : 'text-secondary hover:bg-white/[0.02] hover:text-primary border border-transparent'
                                    }`}
                            >
                                {activeTab === category && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-accent rounded-r-full" />}
                                {category.replace(/_/g, ' ')}
                            </button>
                        ))}
                    </div>

                    <div className="p-8 border-t border-white/[0.03]">
                        <button
                            onClick={() => {
                                if (window.confirm("Initialize complete system reset? All local node configurations will be purged.")) {
                                    resetSettings();
                                    window.location.reload();
                                }
                            }}
                            className="w-full bg-red-400/5 hover:bg-red-400/10 text-red-400 py-4 rounded-instrument text-[9px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 border border-red-400/10 hover:border-red-400/20"
                        >
                            <Shield className="w-3.5 h-3.5" /> Re-Initialize Node
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col bg-background relative">
                    <div className="absolute inset-0 bg-gentle-grid opacity-20 pointer-events-none" />

                    {/* Header */}
                    <div className="flex items-center justify-between p-10 border-b border-white/[0.03] relative z-10">
                        <div>
                            <div className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] mb-2">Protocol Segment</div>
                            <h3 className="text-3xl font-black text-primary uppercase tracking-tight">{activeTab.replace(/_/g, ' ')}</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-12 h-12 rounded-full bg-surface border border-white/5 flex items-center justify-center text-muted hover:text-primary hover:border-accent/30 hover:bg-background transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Settings List */}
                    <div className="flex-1 overflow-y-auto p-12 space-y-8 relative z-10 hide-scrollbar">
                        {SETTINGS_CATEGORIES[activeTab]?.map((setting) => {
                            if (setting.type === 'title') {
                                return (
                                    <div key={setting.id} className="mt-12 mb-6 flex items-center gap-6">
                                        <div className="w-10 h-10 rounded-instrument bg-accent/5 flex items-center justify-center text-accent border border-accent/10">
                                            {setting.icon && <setting.icon size={18} />}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">{setting.label}</span>
                                        <div className="h-px bg-accent/10 flex-1"></div>
                                    </div>
                                );
                            }

                            if (setting.type === 'separator') {
                                return <div key={setting.id} className="w-full h-px bg-white/[0.03] my-4"></div>;
                            }

                            const isActive = settings[setting.id] ?? setting.default;

                            return (
                                <div key={setting.id} className="flex items-center justify-between p-8 bg-surface/30 border border-white/[0.03] rounded-premium hover:border-accent/20 transition-all group shadow-sm">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-500 ${isActive ? 'bg-accent/10 text-accent border-accent/20 shadow-inner' : 'bg-background/40 text-muted border-white/5'}`}>
                                            {setting.icon && <setting.icon size={20} />}
                                        </div>
                                        <div>
                                            <div className="text-base font-bold text-primary mb-1 group-hover:text-accent transition-colors tracking-tight">{setting.label}</div>
                                            <div className="text-[9px] text-muted font-black uppercase tracking-widest font-mono">Segment: {setting.id}</div>
                                        </div>
                                    </div>

                                    <div className="w-56 flex justify-end">
                                        {setting.type === 'info' && (
                                            <div className="px-5 py-2 rounded-instrument bg-background/60 border border-white/10 text-primary font-mono font-black text-sm tracking-tighter shadow-inner">
                                                {setting.value}
                                            </div>
                                        )}

                                        {setting.type === 'checkbox' && (
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={isActive}
                                                    onChange={(e) => handleChange(setting.id, e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-14 h-7 bg-background border border-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-accent after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent peer-checked:shadow-[0_0_15px_rgba(197,160,89,0.4)]"></div>
                                            </label>
                                        )}

                                        {setting.type === 'number' && (
                                            <input
                                                type="number"
                                                value={isActive}
                                                onChange={(e) => handleChange(setting.id, parseFloat(e.target.value))}
                                                min={setting.min}
                                                max={setting.max}
                                                step={setting.step || 1}
                                                className="w-24 bg-background/60 border border-white/10 rounded-instrument px-4 py-2.5 text-right font-mono font-black text-primary text-sm focus:border-accent outline-none transition-all shadow-inner"
                                            />
                                        )}

                                        {setting.type === 'select' && (
                                            <select
                                                value={isActive}
                                                onChange={(e) => handleChange(setting.id, e.target.value)}
                                                className="w-full bg-background/60 border border-white/10 rounded-instrument px-5 py-2.5 text-primary font-bold text-[10px] uppercase tracking-widest focus:border-accent outline-none appearance-none transition-all shadow-inner text-right"
                                            >
                                                {setting.options.map(opt => (
                                                    <option key={opt} value={opt} className="bg-surface">{opt}</option>
                                                ))}
                                            </select>
                                        )}

                                        {setting.type === 'color' && (
                                            <div className="relative group/color">
                                                <input
                                                    type="color"
                                                    value={isActive}
                                                    onChange={(e) => handleChange(setting.id, e.target.value)}
                                                    className="w-12 h-12 bg-transparent cursor-pointer rounded-instrument p-0 overflow-hidden border-2 border-white/10 hover:border-accent transition-all"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="p-10 border-t border-white/[0.03] flex justify-between items-center bg-background/50 backdrop-blur-md relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_#C50022]" />
                            <span className="text-[10px] text-muted font-black uppercase tracking-[0.3em]">Synapse Auto-Save Active</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="px-10 py-4 bg-primary text-background font-black rounded-instrument text-[10px] uppercase tracking-[0.2em] shadow-premium hover:bg-accent transition-all flex items-center gap-3 group"
                        >
                            Commit Changes <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
