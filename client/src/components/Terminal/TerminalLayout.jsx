import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import TerminalChart from './TerminalChart';
import UnifiedRightPanel from './UnifiedRightPanel';
import TerminalHeader from './TerminalHeader';
import TimeframeSelector from './TimeframeSelector';
import ChartToolbar from './ChartToolbar';
import AlertModal from './AlertModal';
import PositionOverlay from './PositionOverlay';
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
    const [timeframe, setTimeframe] = useState('1M');

    // UI State
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
    const [activeTool, setActiveTool] = useState('cursor');
    const [chartType, setChartType] = useState('candlestick');
    const [showSettings, setShowSettings] = useState(false);
    const [showAlertModal, setShowAlertModal] = useState(false);

    // Chart Refs
    const chartAPI = useRef(null);
    const seriesAPI = useRef(null);

    // WebSocket for Optivon Market Data
    const wsRef = useRef(null);
    const sessionIdRef = useRef(null);

    // Ref to accumulate data without re-rendering
    const chartDataRef = useRef([]);

    // specific effect to sync data when chart type changes (forcing a remount)
    useEffect(() => {
        if (chartDataRef.current.length > 0) {
            setChartData([...chartDataRef.current]);
        }
    }, [chartType, timeframe]);

    // Track current symbol ref to avoid stale closures in WS callbacks
    const selectedSymbolRef = useRef(selectedSymbol);

    useEffect(() => {
        selectedSymbolRef.current = selectedSymbol;
    }, [selectedSymbol]);

    // ===== OPTIVON MARKET DATA WEBSOCKET =====
    useEffect(() => {
        // Cleanup previous connection
        if (wsRef.current) {
            wsRef.current.close();
        }

        // Connect to Optivon Market Data API
        const ws = new WebSocket('ws://localhost:5000/market');
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('[Optivon] Market Data WebSocket connected');

            // Subscribe to market data
            ws.send(JSON.stringify({
                type: 'subscribe',
                payload: {
                    symbol: selectedSymbol,
                    accountId: account?.id || 1,
                    speed: 1  // 1x speed (real-time simulation)
                }
            }));
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);

                // GUARD: Ignore messages from other sessions/symbols
                // SessionID format: `${accountId}_${symbol}`
                // Check if message belongs to current user/symbol context
                if (message.sessionId) {
                    const expectedSessionId = `${account?.id || 1}_${selectedSymbolRef.current}`;
                    if (message.sessionId !== expectedSessionId) {
                        console.warn(`[Optivon] Ignored stale packet: ${message.sessionId} (Expected: ${expectedSessionId})`);
                        return;
                    }
                }

                switch (message.type) {
                    case 'connected':
                        console.log('[Optivon]', message.message);
                        break;
                    // ... (rest of the switch)

                    case 'subscribed':
                        sessionIdRef.current = message.sessionId;
                        console.log('[Optivon] Subscribed:', message);
                        addToast(`Market session started: ${message.symbol}`, 'success');
                        break;

                    case 'candle':
                        // New candle received
                        const candleData = message.data;

                        // Update quotes for header/panel
                        setQuotes(prev => ({
                            ...prev,
                            [selectedSymbol]: {
                                symbol: selectedSymbol,
                                ltp: candleData.close,
                                time: candleData.time,
                                change: 0,
                                changePercent: 0
                            }
                        }));

                        // Update chart directly via API (No re-render)
                        if (seriesAPI.current) {
                            seriesAPI.current.update(candleData);
                        }

                        // SYNC STATE: Append to chartData to prevent stale state on re-render
                        // Using functional update to ensure we have latest state
                        setChartData(prev => {
                            const newData = [...prev, candleData];
                            // Keep last 2000 to avoid memory issues
                            if (newData.length > 2000) return newData.slice(-2000);
                            return newData;
                        });

                        // Accumulate in Ref (Silent update)
                        if (chartDataRef.current) {
                            chartDataRef.current.push(candleData);
                            if (chartDataRef.current.length > 2000) chartDataRef.current.shift();
                        }

                        // CHECK ALERTS
                        if (message.data && checkAlerts) {
                            // Create a temporary quotes object for checking
                            checkAlerts({
                                [selectedSymbol]: {
                                    ltp: candleData.close
                                }
                            });
                        }
                        break;

                    case 'history':
                        console.log(`[Optivon] Received history: ${message.data.length} candles`);

                        // Update ref and state
                        if (chartDataRef.current) {
                            chartDataRef.current = [...message.data];
                        }

                        // Bulk update chart
                        if (seriesAPI.current) {
                            seriesAPI.current.setData(message.data);
                        }

                        // Update state (Initial Load)
                        setChartData(message.data);

                        // Explicitly fit content only on history load
                        if (chartAPI.current) {
                            chartAPI.current.timeScale().fitContent();
                        }

                        addToast('Session restored', 'success');
                        break;

                    case 'session_end':
                        console.log('[Optivon] Session ended');
                        addToast('Market session complete', 'info');
                        break;

                    case 'error':
                        console.error('[Optivon] Error:', message.message);
                        addToast(`Market data error: ${message.message}`, 'error');
                        break;

                    default:
                        console.log('[Optivon] Unknown message:', message);
                }
            } catch (error) {
                console.error('[Optivon] Message parse error:', error);
            }
        };

        ws.onerror = (error) => {
            console.error('[Optivon] WebSocket error:', error);
            addToast('Market data connection error', 'error');
        };

        ws.onclose = () => {
            console.log('[Optivon] WebSocket disconnected');
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'unsubscribe' }));
            }
            ws.close();
        };
    }, [selectedSymbol, account?.id]);

    // Fetch Account State & Positions
    // NEW: Fetch ALL accounts to handle switching and auto-selection
    const [allAccounts, setAllAccounts] = useState([]);

    const fetchAccountData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            // If we have a selected account, refresh its details specifically
            const accId = account?.id;

            const headers = { 'Authorization': `Bearer ${token}` };

            // Always fetch list of accounts to support switching
            const accountsRes = await fetch('/api/trade/accounts', { headers });

            let currentPositions = [];
            let currentAccountData = null;

            if (accountsRes.ok) {
                const accountsData = await accountsRes.json();
                setAllAccounts(accountsData);

                // Auto-Select logic if no account is selected
                if (!accId && accountsData.length > 0) {
                    // Prefer 'active' accounts, then 'pending', then latest
                    const active = accountsData.find(a => a.status === 'active') ||
                        accountsData.find(a => a.status === 'pending') ||
                        accountsData[0];
                    setAccount(active);
                    // Return here, next cycle will fetch positions for this new ID
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
                    currentAccountData = await accRes.json();
                    setAccount(currentAccountData);
                }
            }
        } catch (e) {
            console.error("Fetch Account Data Error:", e);
        }
    }, [account?.id]);

    useEffect(() => {
        fetchAccountData();
        // Poll every 5 seconds for account updates
        const interval = setInterval(fetchAccountData, 5000);
        return () => clearInterval(interval);
    }, [fetchAccountData]);

    // Close Position
    const handleClosePosition = async (positionId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/trade/close', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ accountId: account.id, positionId })
            });

            if (res.ok) {
                addToast('Position Closed', 'success');
                fetchAccountData(); // Refresh account data
                if (onTrade) onTrade();
            } else {
                const data = await res.json();
                addToast(data.error || 'Failed to close position', 'error');
            }
        } catch (error) {
            console.error('[Optivon] Close position error:', error);
            addToast('Network Error', 'error');
        }
    };

    // Trade Handlers (keeping existing logic)
    const handleOrder = async (symbol, side, lots, type, price, limitPrice, sl, tp, isClose = false) => {
        if (!isClose && accountLocked) {
            addToast(`BLOCKED: ${lockReason}`, 'error');
            return;
        }

        if (!account && !isClose) {
            addToast("No Active Account Selected", "error");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const endpoint = isClose ? '/api/trade/close' : '/api/trade/place';

            const body = isClose
                ? { accountId: account.id, positionId: lots }
                : {
                    accountId: account.id,
                    symbol,
                    side,
                    lots,
                    type,
                    price,
                    limitPrice,
                    sl,
                    tp
                };

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            const result = await res.json();

            if (res.ok) {
                addToast(result.message || 'Order executed', 'success');
                fetchAccountData(); // Refresh account data
                if (onTrade) onTrade();
            } else {
                addToast(result.error || 'Order failed', 'error');
            }
        } catch (error) {
            console.error('Order error:', error);
            addToast('Failed to execute order', 'error');
        }
    };

    const handleChartReady = useCallback((chart, series) => {
        chartAPI.current = chart;
        seriesAPI.current = series;
    }, []);

    const handleSymbolChange = (symbol) => {
        if (symbol === selectedSymbol) return;
        setChartData([]); // Clear chart immediately to prevent "stuck" old data
        setSelectedSymbol(symbol);
    };

    return (
        <div className="h-screen flex flex-col bg-[#0a0e27] overflow-hidden">
            {/* Risk Status Banner */}
            <RiskStatusBanner />

            {/* Terminal Header */}
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

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* Chart Toolbar (Sidebar) */}
                <ChartToolbar
                    activeTool={activeTool}
                    onToolChange={setActiveTool}
                    chartType={chartType}
                    onChartTypeChange={setChartType}
                    onSettingsClick={() => setShowSettings(true)}
                />

                {/* Chart Area */}
                <div className="flex-1 flex flex-col overflow-hidden relative min-h-0 min-w-0">

                    {/* Timeframe Selector */}
                    <div className="shrink-0 z-20">
                        <TimeframeSelector
                            timeframe={timeframe}
                            onTimeframeChange={setTimeframe}
                        />
                    </div>

                    {/* Chart */}
                    <div className="flex-1 relative min-h-0 min-w-0">
                        <TerminalChart
                            key={selectedSymbol}
                            data={chartData}
                            symbol={selectedSymbol}
                            onChartReady={handleChartReady}
                            chartType={chartType}
                        />

                        {/* Position Overlays */}
                        {positions.map(pos => (
                            <PositionOverlay
                                key={pos.id}
                                position={pos}
                                currentPrice={quotes[pos.symbol]?.ltp}
                            />
                        ))}
                    </div>
                </div>

                {/* Right Panel */}
                <UnifiedRightPanel
                    isOpen={isRightPanelOpen}
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

            {/* Modals */}
            {showSettings && (
                <SettingsPanel isOpen={true} onClose={() => setShowSettings(false)} />
            )}

            {showAlertModal && (
                <AlertModal
                    isOpen={true}
                    symbol={selectedSymbol}
                    currentPrice={quotes[selectedSymbol]?.ltp}
                    quotes={quotes}
                    onClose={() => setShowAlertModal(false)}
                />
            )}
        </div>
    );
}

// Wrapper with Providers
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
