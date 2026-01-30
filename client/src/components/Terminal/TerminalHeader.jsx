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
        <div className="h-14 bg-[#070b1a] border-b border-white/5 flex items-center px-4 justify-between font-sans shrink-0 z-40 relative shadow-2xl">
            {/* Left Section: Branding & Metrics */}
            <div className="flex items-center gap-10">
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#00c853] via-blue-600 to-[#2962ff] flex items-center justify-center shadow-lg shadow-blue-900/20 group-hover:scale-110 transition-transform">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-white text-[13px] tracking-tighter uppercase leading-none">
                            Optivon <span className="text-[#00c853]">Terminal</span>
                        </span>
                        <div className="flex items-center gap-1.5 mt-1 border-t border-white/5 pt-1">
                            <span className="text-[7.5px] text-white/40 font-black tracking-[2px] uppercase">PHASE {account?.phase || 1} • VERIFIED</span>
                        </div>
                    </div>
                </div>

                {/* Account Metrics */}
                {account ? (
                    <div className="flex items-center gap-8 border-l border-white/10 pl-10 hidden sm:flex">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Live Balance</span>
                            <span className="text-xs font-mono font-black text-white">
                                ${parseFloat(account?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Floating Equity</span>
                            <span className={`text-xs font-mono font-black ${(account?.equity >= account?.balance) ? 'text-[#00c853]' : 'text-[#ff1744]'}`}>
                                ${parseFloat(account?.equity || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="flex flex-col bg-white/[0.03] px-3 py-1 rounded-lg border border-white/5">
                            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Session Expiry</span>
                            <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3 text-blue-400" />
                                <span className={`text-[11px] font-mono font-black ${timeLeft === 'EXPIRED' ? 'text-[#ff1744]' : 'text-white'}`}>
                                    {timeLeft || "24:00:00"}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <Shield className="w-3.5 h-3.5 text-[#ff1744]" />
                        <span className="text-[9px] font-black text-[#ff1744] uppercase tracking-widest">Account Required for Stream</span>
                    </div>
                )}
            </div>

            {/* Right Section: Tooling */}
            <div className="flex items-center gap-3">
                {/* Time Display (IST) */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-lg hidden xl:flex">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[11px] font-mono font-bold text-gray-300">{currentTime}</span>
                </div>

                {/* Search Bar */}
                <div className="relative group hidden lg:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search symbols..."
                        onChange={(e) => onSearch(e.target.value)}
                        className="bg-[#1a1e2e] border border-white/5 text-[11px] text-white rounded-xl pl-10 pr-4 py-2 w-48 focus:outline-none focus:border-blue-500/50 transition-all font-bold tracking-tight shadow-inner"
                    />
                </div>

                <div className="w-px h-8 bg-white/5 mx-2"></div>

                {/* New Pro Chart Selector */}
                <ChartTypeSelector currentType={chartType} onChange={setChartType} />

                <div className="w-px h-8 bg-white/5 mx-2"></div>

                {/* System Tools */}
                <div className="flex items-center gap-1.5">
                    {/* ALERT BELL */}
                    <button
                        onClick={onOpenAlerts}
                        className={`p-2.5 rounded-xl transition-all relative ${activeAlertsCount > 0 ? 'text-blue-400 bg-blue-400/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                        title="Set Price Alert"
                    >
                        <Bell className="w-5 h-5" />
                        {activeAlertsCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-[#070b1a]">
                                {activeAlertsCount}
                            </span>
                        )}
                    </button>

                    <button onClick={toggleFullScreen} className="p-2.5 text-gray-500 hover:text-blue-400 hover:bg-blue-400/5 rounded-xl transition-all" title="Fullscreen">
                        <Maximize2 className="w-5 h-5" />
                    </button>
                    <button onClick={onOpenSettings} className="p-2.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all" title="Settings">
                        <SettingsIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onToggleRightPanel}
                        className={`p-2.5 rounded-xl transition-all ${isPanelOpen ? 'text-blue-400 bg-blue-400/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                        title={isPanelOpen ? "Close Panel" : "Open Panel"}
                    >
                        {isPanelOpen ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
