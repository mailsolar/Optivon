import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    ChevronDown,
    Activity,
    BarChart3,
    LineChart,
    CandlestickChart,
    PanelRightClose,
    PanelRightOpen,
    TrendingUp,
    Settings as SettingsIcon,
    Maximize2,
    Clock,
    Shield,
    Bell,
    LayoutGrid,
    CheckCircle2,
    ArrowLeft
} from 'lucide-react';
import { useAlerts } from '../../context/AlertContext';
import ChartTypeSelector from './ChartTypeSelector';
import { getCurrentTimeIST } from '../../utils/timezone';

export default function TerminalHeader({
    account,
    quotes = {},
    selectedSymbol,
    onSelectSymbol,
    onSearch,
    onToggleRightPanel,
    chartType,
    setChartType,
    isPanelOpen,
    onOpenSettings,
    onOpenAlerts,
    allAccounts = [],
    onSelectAccount,
}) {
    const navigate = useNavigate();
    const [showChartMenu, setShowChartMenu] = useState(false);
    const { alerts } = useAlerts();
    const [currentTime, setCurrentTime] = useState(getCurrentTimeIST());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(getCurrentTimeIST());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Badge for active (untriggered) alerts
    const activeAlertsCount = alerts.filter(a => !a.triggered).length;

    const chartTypes = [
        { id: 'candlestick', label: 'Candlesticks', icon: CandlestickChart },
        { id: 'hollow', label: 'Hollow Candles', icon: CandlestickChart },
        { id: 'bars', label: 'OHLC Bars', icon: BarChart3 },
        { id: 'hlc', label: 'HLC Bars', icon: BarChart3 },
        { id: 'line', label: 'Line Chart', icon: LineChart },
        { id: 'area', label: 'Area Chart', icon: TrendingUp },
        { id: 'baseline', label: 'Baseline', icon: Activity },
    ];

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(e => console.error(e));
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    };

    return (
        <div className="h-14 bg-surface border-b border-white/[0.02] flex items-center px-4 justify-between font-sans shrink-0 z-40 relative transition-colors duration-300">
            {/* Left Section: Branding & Metrics */}
            <div className="flex items-center gap-10">
                <button
                    className="flex items-center gap-3 group px-4 py-2 border-r border-white/[0.02] hover:bg-white/5 transition-colors"
                    onClick={() => navigate('/dashboard')}
                    title="Back to Dashboard"
                >
                    <ArrowLeft className="w-4 h-4 text-secondary group-hover:text-primary group-hover:-translate-x-1 transition-all" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary group-hover:text-primary">Back to Hub</span>
                </button>

                {/* Account Selector & Metrics */}
                {account ? (
                    <div className="flex items-center gap-8 border-l border-white/[0.02] pl-10 hidden sm:flex">
                        {/* Account Selector */}
                        <div className="relative group/acc">
                            <button className="flex flex-col items-start gap-1 group-hover/acc:opacity-80 transition-opacity">
                                <span className="text-[8px] font-black text-secondary uppercase tracking-widest flex items-center gap-1">
                                    Account #{account.id} <ChevronDown className="w-3 h-3" />
                                </span>
                                <span className="text-xs font-mono font-black text-white bg-white/5 px-2 py-0.5 rounded border border-white/[0.02]">
                                    {account.type}
                                </span>
                            </button>

                            {/* Dropdown */}
                            <div className="absolute top-full left-0 mt-2 w-48 bg-background border border-white/10 rounded-none shadow-xl overflow-hidden hidden group-hover/acc:block z-50">
                                <div className="py-1">
                                    {(allAccounts || []).map(acc => (
                                        <button
                                            key={acc.id}
                                            onClick={() => onSelectAccount && onSelectAccount(acc)}
                                            className={`w-full text-left px-4 py-2 text-xs flex justify-between items-center hover:bg-white/5 transition-colors ${account.id === acc.id ? 'bg-accent/10 text-accent' : 'text-gray-400'}`}
                                        >
                                            <span className="font-mono">#{acc.id}</span>
                                            <span className="font-bold">{acc.type}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-secondary uppercase tracking-widest mb-0.5">Live Balance</span>
                            <span className="text-xs font-mono font-black text-white">
                                ₹{parseFloat(account?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-secondary uppercase tracking-widest mb-0.5">Floating Equity</span>
                            <span className={`text-xs font-mono font-black ${(account?.equity >= account?.balance) ? 'text-green-500' : 'text-red-500'}`}>
                                ₹{parseFloat(account?.equity || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <Shield className="w-3.5 h-3.5 text-red-500" />
                        <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">No Active Account</span>
                    </div>
                )}
            </div>

            {/* Right Section: Tooling */}
            <div className="flex items-center gap-3">
                {/* Time Display (IST) */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-background/50 border border-white/[0.02] rounded-lg hidden xl:flex min-w-[100px] justify-center">
                    <Clock className="w-3.5 h-3.5 text-accent" />
                    <span className="text-[11px] font-mono font-bold text-secondary">{currentTime}</span>
                </div>

                {/* Upstox Login Button */}
                <a 
                    href="http://localhost:5000/api/upstox/login"
                    className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 text-accent rounded-lg hover:bg-accent hover:text-background transition-all font-bold text-[11px] uppercase tracking-wider"
                >
                    Login Upstox
                </a>

                {/* Symbol Toggle Tabs (NIFTY / BANKNIFTY) */}
                <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-white/[0.02]">
                    <button
                        onClick={() => onSelectSymbol('NIFTY')}
                        className={`px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${selectedSymbol === 'NIFTY'
                            ? 'bg-accent text-brand-dark shadow-lg shadow-accent/20'
                            : 'text-secondary hover:text-white hover:bg-white/5'
                            }`}
                    >
                        NIFTY
                    </button>
                    <button
                        onClick={() => onSelectSymbol('BANKNIFTY')}
                        className={`px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${selectedSymbol === 'BANKNIFTY'
                            ? 'bg-accent text-brand-dark shadow-lg shadow-accent/20'
                            : 'text-secondary hover:text-white hover:bg-white/5'
                            }`}
                    >
                        BANKNIFTY
                    </button>
                </div>

                <div className="w-px h-8 bg-white/[0.02] mx-2"></div>

                {/* New Pro Chart Selector */}
                <ChartTypeSelector currentType={chartType} onChange={setChartType} />

                <div className="w-px h-8 bg-white/[0.02] mx-2"></div>

                {/* System Tools */}
                <div className="flex items-center gap-1.5">
                    {/* ALERT BELL */}
                    <button
                        onClick={onOpenAlerts}
                        className={`p-2.5 rounded-xl transition-all relative ${activeAlertsCount > 0 ? 'text-accent bg-accent/10' : 'text-secondary hover:text-primary hover:bg-surface'}`}
                        title="Set Price Alert"
                    >
                        <Bell className="w-5 h-5" />
                        {activeAlertsCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-accent text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-surface">
                                {activeAlertsCount}
                            </span>
                        )}
                    </button>

                    <button onClick={toggleFullScreen} className="p-2.5 text-secondary hover:text-accent hover:bg-accent/5 rounded-xl transition-all" title="Fullscreen">
                        <Maximize2 className="w-5 h-5" />
                    </button>
                    <button onClick={onOpenSettings} className="p-2.5 text-secondary hover:text-primary hover:bg-surface rounded-xl transition-all" title="Settings">
                        <SettingsIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onToggleRightPanel}
                        className={`p-2.5 rounded-xl transition-all ${isPanelOpen ? 'text-accent bg-accent/10' : 'text-secondary hover:text-primary hover:bg-surface'}`}
                        title={isPanelOpen ? "Close Panel" : "Open Panel"}
                    >
                        {isPanelOpen ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>
    );
}

