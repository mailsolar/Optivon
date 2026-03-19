import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import TerminalChart from './TerminalChart';
import ChartOverlay from './ChartOverlay';
import UnifiedRightPanel from './UnifiedRightPanel';
import TerminalHeader from './TerminalHeader';
import TimeframeSelector from './TimeframeSelector';
import ChartToolbar from './ChartToolbar';
import AlertModal from './AlertModal';
import SettingsPanel from './SettingsPanel';
import { useToast } from '../../context/ToastContext';

import { RiskManagementProvider, useRiskManagement, RiskStatusBanner } from '../../context/RiskManagementContext';
import { AlgoProvider } from '../../context/AlgoContext';
import { AlertProvider, useAlerts } from '../../context/AlertContext';

function TerminalLayoutContent({ user, quotes: initialQuotes, account, setAccount, onTrade }) {
    const { addToast } = useToast();
    const { alerts, checkAlerts } = useAlerts();
    const { accountLocked, lockReason } = useRiskManagement();

    // Data State
    const [quotes, setQuotes] = useState(initialQuotes || {});
    const [positions, setPositions] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [selectedSymbol, setSelectedSymbol] = useState('NIFTY');
    const [searchTerm, setSearchTerm] = useState('');
    const [timeframe, setTimeframe] = useState('1m');

    // UI State
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
    const [activeTool, setActiveTool] = useState('cursor');
    const [chartType, setChartType] = useState('candlestick');
    const [showSettings, setShowSettings] = useState(false);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [activeIndicators, setActiveIndicators] = useState({ ema20: false, vwap: false, rsi: false, macd: false });

    const handleIndicatorToggle = useCallback((id) => {
        setActiveIndicators(prev => ({ ...prev, [id]: !prev[id] }));
    }, []);

    // Chart Refs
    const chartAPI = useRef(null);
    const seriesAPI = useRef(null);
    const chartContainerRef = useRef(null);
    const [chartInstance, setChartInstance] = useState(null);

    // WebSocket for Optivon Market Data
    const wsRef = useRef(null);
    const [socketStatus, setSocketStatus] = useState('Disconnected');
    const [isLive, setIsLive] = useState(false);
    const [lastTickMessage, setLastTickMessage] = useState('Wait for data...');
    const [lastTickTime, setLastTickTime] = useState(null);
    const [upstoxStatus, setUpstoxStatus] = useState({ authenticated: false, polling: false, symbol: null, error: null });

    // Ref to accumulate data without re-rendering
    const chartDataRef = useRef([]);

    useEffect(() => {
        chartDataRef.current = [];
        setChartData([]);
    }, [timeframe]);

    useEffect(() => {
        if (chartDataRef.current.length > 0) {
            setChartData([...chartDataRef.current]);
        }
    }, [chartType]);

    const selectedSymbolRef = useRef(selectedSymbol);
    const timeframeRef = useRef(timeframe);

    useEffect(() => {
        selectedSymbolRef.current = selectedSymbol;
    }, [selectedSymbol]);

    useEffect(() => {
        timeframeRef.current = timeframe;
    }, [timeframe]);

    const TIMEFRAME_SECONDS = {
        '1m': 60,
        '5m': 300,
        '15m': 900,
        '1h': 3600,
        '4h': 14400,
        '1D': 86400,
        '1W': 604800,
        '1M': 2592000
    };

    const aggregateCandles = (candles, seconds) => {
        if (!candles || candles.length === 0) return [];
        if (seconds === 60) return candles;

        const aggregated = [];
        let currentCandle = null;

        for (const candle of candles) {
            const candleTime = Math.floor(candle.time / seconds) * seconds;

            if (!currentCandle) {
                currentCandle = { ...candle, time: candleTime };
            } else if (currentCandle.time === candleTime) {
                currentCandle.high = Math.max(currentCandle.high, candle.high);
                currentCandle.low = Math.min(currentCandle.low, candle.low);
                currentCandle.close = candle.close;
                currentCandle.volume += candle.volume || 0;
            } else {
                aggregated.push(currentCandle);
                currentCandle = { ...candle, time: candleTime };
            }
        }
        if (currentCandle) aggregated.push(currentCandle);
        return aggregated;
    };


    const getBackendUrl = () => {
        const currentOrigin = window.location.origin;
        return currentOrigin.includes('5173') ? currentOrigin.replace('5173', '5000') : currentOrigin;
    };

    useEffect(() => {
        const backendUrl = getBackendUrl();
        const socket = io(backendUrl, {
            path: '/socket.io',
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
        });
        wsRef.current = socket;

        socket.on('connect', () => {
            setSocketStatus('Connected');
            setIsLive(true);
            socket.emit('subscribe', selectedSymbolRef.current);
        });

        socket.on('stock_update', (tick) => {
            const activeSymbol = selectedSymbolRef.current;
            if (tick.symbol !== activeSymbol) return;

            setLastTickMessage(`${tick.symbol}: ${tick.ltp}`);
            setLastTickTime(Date.now());
            setIsLive(true);

            setQuotes(prev => ({
                ...prev,
                [activeSymbol]: { symbol: activeSymbol, ltp: tick.ltp, time: tick.time, change: 0, changePercent: 0 }
            }));

            const seconds = TIMEFRAME_SECONDS[timeframeRef.current] || 60;
            const candleTime = Math.floor(tick.time / seconds) * seconds;

            const currentData = chartDataRef.current;
            const lastCandle = currentData.length > 0 ? currentData[currentData.length - 1] : null;

            let updatedCandle;
            if (lastCandle && lastCandle.time === candleTime) {
                updatedCandle = {
                    ...lastCandle,
                    high: Math.max(lastCandle.high, tick.ltp),
                    low: Math.min(lastCandle.low, tick.ltp),
                    close: tick.ltp
                };
                currentData[currentData.length - 1] = updatedCandle;
            } else {
                updatedCandle = { time: candleTime, open: tick.ltp, high: tick.ltp, low: tick.ltp, close: tick.ltp };
                currentData.push(updatedCandle);
                if (currentData.length > 2000) currentData.shift();
            }

            if (seriesAPI.current) {
                seriesAPI.current.update(updatedCandle);
            }

            chartDataRef.current = currentData;
            setChartData([...currentData]);

            if (checkAlerts) checkAlerts({ [activeSymbol]: { ltp: tick.ltp } });
        });

        return () => socket.disconnect();
    }, []);

    useEffect(() => {
        if (wsRef.current && wsRef.current.connected) {
            wsRef.current.emit('subscribe', selectedSymbol);
        }
    }, [selectedSymbol]);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await fetch(`${getBackendUrl()}/api/upstox/status`);
                if (res.ok) {
                    const data = await res.json();
                    setUpstoxStatus(data);
                } else {
                    setUpstoxStatus(prev => ({ ...prev, error: `Protocol ${res.status}` }));
                }
            } catch (e) {
                setUpstoxStatus(prev => ({ ...prev, error: 'Link Down' }));
            }
        };
        checkStatus();
        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const isIntraday = ['1m', '5m', '15m', '1h', '4h'].includes(timeframe);
                const fetchInterval = isIntraday ? '1m' : timeframe;
                const apiSymbol = selectedSymbol;

                const res = await fetch(`/api/upstox/intraday?symbol=${encodeURIComponent(apiSymbol)}&interval=${fetchInterval}`);
                if (res.ok) {
                    let data = await res.json();
                    if (Array.isArray(data)) {
                        if (isIntraday && timeframe !== '1m') {
                            const seconds = TIMEFRAME_SECONDS[timeframe] || 60;
                            data = aggregateCandles(data, seconds);
                        }
                        chartDataRef.current = [...data];
                        setChartData([...data]);
                        if (seriesAPI.current) {
                            seriesAPI.current.setData(data);
                            chartAPI.current?.timeScale().fitContent();
                        }
                    }
                }
            } catch (e) {
                console.error("History fetch error:", e);
            }
        };
        fetchHistory();
    }, [selectedSymbol, timeframe]);

    useEffect(() => {
        setIsLive(false);
    }, [selectedSymbol]);

    const [allAccounts, setAllAccounts] = useState([]);

    const fetchAccountData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const accId = account?.id;
            const headers = { 'Authorization': `Bearer ${token}` };
            const accountsRes = await fetch('/api/trade/accounts', { headers });

            if (accountsRes.ok) {
                const accountsData = await accountsRes.json();
                setAllAccounts(accountsData);
                if (!accId && accountsData.length > 0) {
                    const active = accountsData.find(a => a.status === 'active') || accountsData.find(a => a.status === 'pending') || accountsData[0];
                    setAccount(active);
                    return;
                }
            }

            if (accId) {
                const [posRes, accRes] = await Promise.all([
                    fetch('/api/trade/positions', { headers }),
                    fetch(`/api/trade/account/${accId}`, { headers })
                ]);
                if (posRes.ok) {
                    const pos = await posRes.json();
                    setPositions(pos.filter(p => p.account_id === accId));
                }
                if (accRes.ok) {
                    const currentAccountData = await accRes.json();
                    setAccount(currentAccountData);
                }
            }
        } catch (e) {
            console.error("Fetch Account Data Error:", e);
        }
    }, [account?.id]);

    useEffect(() => {
        fetchAccountData();
        const interval = setInterval(fetchAccountData, 5000);
        return () => clearInterval(interval);
    }, [fetchAccountData]);

    const handleClosePosition = async (positionId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/trade/close', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ accountId: account.id, positionId })
            });

            if (res.ok) {
                addToast('Position Terminated', 'success');
                fetchAccountData();
                if (onTrade) onTrade();
            } else {
                const data = await res.json();
                addToast(data.error || 'Termination Failed', 'error');
            }
        } catch (error) {
            addToast('Protocol Error', 'error');
        }
    };

    const handleOrder = async (symbol, side, lots, type, price, limitPrice, sl, tp, isClose = false) => {
        if (!isClose && accountLocked) {
            addToast(`BLOCKED: ${lockReason}`, 'error');
            return;
        }

        if (!account && !isClose) {
            addToast("Node Inactive", "error");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const endpoint = isClose ? '/api/trade/close' : '/api/trade/place';
            const body = isClose ? { accountId: account.id, positionId: lots } : { accountId: account.id, symbol, side, lots, type, price, limitPrice, sl, tp };

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body)
            });

            const result = await res.json();
            if (res.ok) {
                addToast(result.message || 'Sequence Executed', 'success');
                fetchAccountData();
                if (onTrade) onTrade();
            } else {
                addToast(result.error || 'Execution Failed', 'error');
            }
        } catch (error) {
            addToast('Critical Logic Error', 'error');
        }
    };

    const handleChartReady = useCallback((chart, series) => {
        chartAPI.current = chart;
        seriesAPI.current = series;
        setChartInstance(chart);
    }, []);

    const handleSymbolChange = (symbol) => {
        if (symbol === selectedSymbol) return;
        chartDataRef.current = [];
        setChartData([]);
        setSelectedSymbol(symbol);
    };

    return (
        <div className="h-screen flex flex-col bg-background overflow-hidden text-secondary font-sans selection:bg-accent/30">
            <RiskStatusBanner />

            <TerminalHeader
                selectedSymbol={selectedSymbol}
                quote={quotes[selectedSymbol]}
                account={account}
                allAccounts={allAccounts}
                onSelectAccount={setAccount}
                onSelectSymbol={handleSymbolChange}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                isPanelOpen={isRightPanelOpen}
                onToggleRightPanel={() => setIsRightPanelOpen(prev => !prev)}
                chartType={chartType}
                setChartType={setChartType}
                onOpenSettings={() => setShowSettings(true)}
                onOpenAlerts={() => setShowAlertModal(true)}
            />

            <div className="flex-1 flex overflow-hidden min-h-0 relative">
                <div className="w-14 border-r border-white/[0.02] flex flex-col items-center py-6 bg-surface shrink-0 z-30 shadow-2xl">
                    <ChartToolbar
                        activeTool={activeTool}
                        onToolChange={setActiveTool}
                        activeIndicators={activeIndicators}
                        onIndicatorToggle={handleIndicatorToggle}
                        onOpenAlerts={() => setShowAlertModal(true)}
                    />
                </div>

                <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-background">
                    <div className="h-10 border-b border-white/[0.02] flex items-center justify-between px-4 bg-surface/50 backdrop-blur-md shrink-0 z-20">
                        <TimeframeSelector timeframe={timeframe} setTimeframe={setTimeframe} />

                        <div className="flex items-center gap-6 pr-4">
                            {upstoxStatus.error && (
                                <span className="text-[10px] text-red-500 font-bold animate-pulse uppercase tracking-[0.2em] flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-red-500" /> {upstoxStatus.error}
                                </span>
                            )}
                            <div className="flex items-center gap-3 opacity-50 hover:opacity-100 transition-all cursor-default group">
                                <span className={`w-2 h-2 rounded-full ${socketStatus === 'Connected' ? 'bg-accent shadow-soft' : 'bg-red-500 animate-ping'}`} />
                                <span className="text-[9px] font-bold text-primary uppercase tracking-[0.3em] group-hover:text-accent transition-colors">{socketStatus}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 relative overflow-hidden" ref={chartContainerRef}>
                        <TerminalChart
                            data={chartData}
                            symbol={selectedSymbol}
                            onChartReady={handleChartReady}
                            chartType={chartType}
                            positions={positions}
                            quotes={quotes}
                            timeframe={timeframe}
                            activeIndicators={activeIndicators}
                        />
                        <ChartOverlay
                            chartInstance={chartInstance}
                            containerRef={chartContainerRef}
                            symbol={selectedSymbol}
                            quotes={quotes}
                            onOrder={handleOrder}
                            onClosePosition={handleClosePosition}
                            positions={positions}
                        />
                    </div>
                </div>

                {isRightPanelOpen && (
                    <div className="w-[320px] shrink-0 border-l border-white/[0.02] bg-surface z-30 shadow-2xl">
                        <UnifiedRightPanel
                            isOpen={true}
                            selectedSymbol={selectedSymbol}
                            quotes={quotes}
                            account={account}
                            positions={positions}
                            user={user}
                            onOrder={handleOrder}
                            onClosePosition={handleClosePosition}
                            onOpenSettings={() => setShowSettings(true)}
                        />
                    </div>
                )}
            </div>

            {showSettings && <SettingsPanel isOpen={true} onClose={() => setShowSettings(false)} />}
            {showAlertModal && <AlertModal isOpen={true} symbol={selectedSymbol} currentPrice={quotes[selectedSymbol]?.ltp} quotes={quotes} onClose={() => setShowAlertModal(false)} />}
        </div>
    );
}

export default function TerminalLayout({ user, account: initialAccount, onTrade }) {
    const [account, setAccount] = useState(initialAccount);
    return (
        <RiskManagementProvider accountId={account?.id}>
            <AlgoProvider accountId={account?.id}>
                <AlertProvider>
                    <TerminalLayoutContent
                        user={user}
                        account={account}
                        setAccount={setAccount}
                        onTrade={onTrade}
                    />
                </AlertProvider>
            </AlgoProvider>
        </RiskManagementProvider>
    );
}
