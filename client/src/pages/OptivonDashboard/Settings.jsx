
import React, { useState } from 'react';
import { Monitor, Smartphone, Volume2, Globe, Shield, Bell, Moon, Sun, Layout } from 'lucide-react';

export default function Settings() {
    // Dummy state for UI toggles
    const [settings, setSettings] = useState({
        soundEnabled: true,
        animations: true,
        compactMode: false,
        showLivePnl: true,
        notifications: true,
        language: 'English (US)'
    });

    const toggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="flex flex-col gap-8 max-w-4xl mx-auto">

            <div>
                <h1 className="text-3xl font-display font-black text-white uppercase tracking-tight mb-2">Platform Settings</h1>
                <p className="text-gray-400">Configure your workspace aesthetics and system preferences.</p>
            </div>

            {/* PREFERENCES GROUPS */}
            <div className="space-y-6">

                {/* APPEARANCE */}
                <div className="bg-[#1F1F35] rounded-2xl overflow-hidden border border-white/5">
                    <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center gap-2">
                        <Monitor size={18} className="text-brand-lime" />
                        <h3 className="font-bold text-white text-sm uppercase tracking-widest">Interface & Theme</h3>
                    </div>

                    <div className="divide-y divide-white/5">
                        <div className="p-6 flex items-center justify-between">
                            <div>
                                <h4 className="text-white font-medium mb-1">Theme Mode</h4>
                                <p className="text-xs text-gray-500">Currently locked to 'Optivon Dark' for optimal contrast.</p>
                            </div>
                            <div className="flex p-1 bg-[#121220] rounded-lg border border-white/10">
                                <button className="px-4 py-2 bg-white/10 rounded-md text-white text-xs font-bold flex items-center gap-2">
                                    <Moon size={14} /> Dark
                                </button>
                                <button className="px-4 py-2 text-gray-600 text-xs font-bold flex items-center gap-2 cursor-not-allowed opacity-50">
                                    <Sun size={14} /> Light
                                </button>
                            </div>
                        </div>

                        <div className="p-6 flex items-center justify-between">
                            <div>
                                <h4 className="text-white font-medium mb-1">Compact Mode</h4>
                                <p className="text-xs text-gray-500">Reduce padding for higher information density.</p>
                            </div>
                            <button
                                onClick={() => toggle('compactMode')}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.compactMode ? 'bg-brand-lime' : 'bg-gray-700'}`}
                            >
                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.compactMode ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        <div className="p-6 flex items-center justify-between">
                            <div>
                                <h4 className="text-white font-medium mb-1">Reduce Motion</h4>
                                <p className="text-xs text-gray-500">Disable heavy animations and blurs.</p>
                            </div>
                            <button
                                onClick={() => toggle('animations')}
                                className={`w-12 h-6 rounded-full transition-colors relative ${!settings.animations ? 'bg-brand-lime' : 'bg-gray-700'}`}
                            >
                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${!settings.animations ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* TRADING & SYSTEM */}
                <div className="bg-[#1F1F35] rounded-2xl overflow-hidden border border-white/5">
                    <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center gap-2">
                        <Layout size={18} className="text-brand-blue" />
                        <h3 className="font-bold text-white text-sm uppercase tracking-widest">Workspace</h3>
                    </div>

                    <div className="divide-y divide-white/5">
                        <div className="p-6 flex items-center justify-between">
                            <div>
                                <h4 className="text-white font-medium mb-1">Trade Sounds</h4>
                                <p className="text-xs text-gray-500">Play confirmation sounds on order execution.</p>
                            </div>
                            <button
                                onClick={() => toggle('soundEnabled')}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.soundEnabled ? 'bg-brand-lime' : 'bg-gray-700'}`}
                            >
                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        <div className="p-6 flex items-center justify-between">
                            <div>
                                <h4 className="text-white font-medium mb-1">Show Un-realized PnL in Title</h4>
                                <p className="text-xs text-gray-500">Display current profit/loss in browser tab title.</p>
                            </div>
                            <button
                                onClick={() => toggle('showLivePnl')}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.showLivePnl ? 'bg-brand-lime' : 'bg-gray-700'}`}
                            >
                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.showLivePnl ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

