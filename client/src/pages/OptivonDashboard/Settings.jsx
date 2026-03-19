import React, { useState } from 'react';
import { Monitor, Smartphone, Volume2, Globe, Shield, Bell, Moon, Sun, Layout } from 'lucide-react';

export default function Settings() {
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
        <div className="flex flex-col gap-10 max-w-4xl mx-auto font-sans">

            <div className="flex flex-col gap-2">
                <div className="text-[10px] font-bold text-accent uppercase tracking-[0.4em]">Configuration</div>
                <h1 className="text-3xl font-bold text-primary uppercase tracking-tight">Platform Preferences</h1>
                <p className="text-secondary font-medium text-sm">Calibrate your workspace aesthetics and system behavior.</p>
            </div>

            <div className="space-y-10">

                {/* Appearance */}
                <div className="bg-surface rounded-premium overflow-hidden border border-white/5 shadow-2xl">
                    <div className="px-10 py-6 bg-surface/50 border-b border-white/5 flex items-center gap-4">
                        <Monitor size={18} className="text-accent" />
                        <h3 className="font-bold text-primary text-[10px] uppercase tracking-[0.3em]">Aesthetics & Theme</h3>
                    </div>

                    <div className="divide-y divide-white/[0.03]">
                        <div className="p-10 flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <h4 className="text-primary font-bold text-sm uppercase tracking-widest">Theme Protocol</h4>
                                <p className="text-[10px] text-muted font-bold uppercase">Locked to 'Optivon Graphite' for precision.</p>
                            </div>
                            <div className="flex p-1 bg-background rounded-instrument border border-white/5">
                                <button className="px-6 py-2 bg-accent/10 border border-accent/20 rounded-instrument text-accent text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                                    <Moon size={14} /> Graphite
                                </button>
                                <button className="px-6 py-2 text-muted text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 cursor-not-allowed opacity-30">
                                    <Sun size={14} /> Ivory
                                </button>
                            </div>
                        </div>

                        <SettingToggle 
                            label="Compact Mode" 
                            sub="Increase information density across the terminal matrix."
                            active={settings.compactMode}
                            onToggle={() => toggle('compactMode')}
                        />

                        <SettingToggle 
                            label="Kinetic Effects" 
                            sub="Enable smooth transitions and micro-interactions."
                            active={settings.animations}
                            onToggle={() => toggle('animations')}
                        />
                    </div>
                </div>

                {/* Trading & Workspace */}
                <div className="bg-surface rounded-premium overflow-hidden border border-white/5 shadow-2xl">
                    <div className="px-10 py-6 bg-surface/50 border-b border-white/5 flex items-center gap-4">
                        <Layout size={18} className="text-accent" />
                        <h3 className="font-bold text-primary text-[10px] uppercase tracking-[0.3em]">Workspace Synchronization</h3>
                    </div>

                    <div className="divide-y divide-white/[0.03]">
                        <SettingToggle 
                            label="Auditory Feedback" 
                            sub="Initialize audio signals for order execution and system alerts."
                            active={settings.soundEnabled}
                            onToggle={() => toggle('soundEnabled')}
                        />

                        <SettingToggle 
                            label="Temporal P&L Stream" 
                            sub="Project real-time yield status to the global application header."
                            active={settings.showLivePnl}
                            onToggle={() => toggle('showLivePnl')}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}

function SettingToggle({ label, sub, active, onToggle }) {
    return (
        <div className="p-10 flex items-center justify-between">
            <div className="flex flex-col gap-1">
                <h4 className="text-primary font-bold text-sm uppercase tracking-widest">{label}</h4>
                <p className="text-[10px] text-muted font-bold uppercase">{sub}</p>
            </div>
            <button
                onClick={onToggle}
                className={`w-14 h-7 rounded-full transition-all relative border border-white/10 ${active ? 'bg-accent shadow-soft' : 'bg-background'}`}
            >
                <div className={`absolute top-1 left-1.5 w-4.5 h-4.5 bg-primary rounded-full transition-all flex items-center justify-center ${active ? 'translate-x-6 bg-background' : 'translate-x-0'}`}>
                    {active && <div className="w-1.5 h-1.5 bg-accent rounded-full" />}
                </div>
            </button>
        </div>
    );
}
