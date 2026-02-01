import React, { useState, useEffect } from 'react';
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
    CheckCircle2
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
    onOpenAlerts
}) {
    const [showChartMenu, setShowChartMenu] = useState(false);
    const { alerts } = useAlerts();
    const [timeLeft, setTimeLeft] = useState("");
    const [currentTime, setCurrentTime] = useState(getCurrentTimeIST());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(getCurrentTimeIST());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Badge for active (untriggered) alerts
    const activeAlertsCount = alerts.filter(a => !a.triggered).length;

    useEffect(() => {
        if (!account?.session_expires) return;
        const timer = setInterval(() => {
            const diff = new Date(account.session_expires) - new Date();
            if (diff <= 0) {
                setTimeLeft("EXPIRED");
                clearInterval(timer);
            } else {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const secs = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [account]);

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
        <div className="h-14 bg-surface border-b border-border flex items-center px-4 justify-between font-sans shrink-0 z-40 relative shadow-md transition-colors duration-300">
            {/* Left Section: Branding & Metrics */}
            <div className="flex items-center gap-10">
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-brand-dark border border-brand-lime/20 flex items-center justify-center shadow-[0_0_15px_rgba(var(--accent-primary),0.1)] group-hover:scale-105 transition-transform">
                        <Activity className="w-5 h-5 text-brand-lime" />
                    </div>
                </div>

                {/* Account Metrics */}
                {account ? (
                    <div className="flex items-center gap-8 border-l border-border pl-10 hidden sm:flex">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-secondary uppercase tracking-widest mb-0.5">Live Balance</span>
                            <span className="text-xs font-mono font-black text-white">
                                ${parseFloat(account?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-secondary uppercase tracking-widest mb-0.5">Floating Equity</span>
                            <span className={`text-xs font-mono font-black ${(account?.equity >= account?.balance) ? 'text-green-500' : 'text-red-500'}`}>
                                ${parseFloat(account?.equity || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="flex flex-col bg-background/50 px-3 py-1 rounded-lg border border-border">
                            <span className="text-[8px] font-black text-secondary uppercase tracking-widest mb-0.5">Session Expiry</span>
                            <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3 text-accent" />
                                <span className={`text-[11px] font-mono font-black ${timeLeft === 'EXPIRED' ? 'text-red-500' : 'text-primary'}`}>
                                    {timeLeft || "24:00:00"}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <Shield className="w-3.5 h-3.5 text-red-500" />
                        <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Account Required for Stream</span>
                    </div>
                )}
            </div>

            {/* Right Section: Tooling */}
            <div className="flex items-center gap-3">
                {/* Time Display (IST) */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-background/50 border border-border rounded-lg hidden xl:flex">
                    <Clock className="w-3.5 h-3.5 text-accent" />
                    <span className="text-[11px] font-mono font-bold text-secondary">{currentTime}</span>
                </div>

                {/* Symbol Toggle Tabs (NIFTY / BANKNIFTY) */}
                <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border">
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

                <div className="w-px h-8 bg-border mx-2"></div>

                {/* New Pro Chart Selector */}
                <ChartTypeSelector currentType={chartType} onChange={setChartType} />

                <div className="w-px h-8 bg-border mx-2"></div>

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
