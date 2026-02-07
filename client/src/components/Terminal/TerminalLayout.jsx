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
import { useAlerts } from '../../context/AlertContext';
import { RiskManagementProvider, useRiskManagement, RiskStatusBanner } from '../../context/RiskManagementContext';
import { AlgoProvider } from '../../context/AlgoContext';

function TerminalLayoutContent({ user, quotes: initialQuotes, account, setAccount, onTrade }) {
    const { addToast } = useToast();
    const { alerts } = useAlerts();
    const { accountLocked, lockReason } = useRiskManagement();

    // Data State
    const [quotes, setQuotes] = useState(initialQuotes || {});
    // Account state is managed by parent wrapper to sync with RiskProvider
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

    // 1. WebSocket / EventSource for Price Updates
    // 1. WebSocket / EventSource for Price Updates
    // We use a Ref to track the "Live" candle so we don't depend on stale closures
    const activeBarRef = useRef(null);

    // Sync Ref with History when chartData loads initially
    useEffect(() => {
        if (chartData && chartData.length > 0) {
            activeBarRef.current = chartData[chartData.length - 1];
        }
    }, [chartData]);

    useEffect(() => {
        const eventSource = new EventSource('http://localhost:5000/api/market/stream');

        eventSource.onmessage = (event) => {
            try {
                const tick = JSON.parse(event.data);
                if (tick && tick.symbol) {
                    setQuotes(prev => ({ ...prev, [tick.symbol]: tick }));

                    // Only process chart updates if this is the selected symbol AND chart is ready
                    if (tick.symbol === selectedSymbol && seriesAPI.current) {
                        const tickTime = Math.floor(new Date(tick.timestamp).getTime() / 1000); // Current Tick Unix
                        const price = tick.ltp;

                        // Initialize if missing (rare, but possible if history empty)
                        if (!activeBarRef.current) {
                            activeBarRef.current = {
                                time: tickTime,
                                open: price, high: price, low: price, close: price
                            };
                            seriesAPI.current.update(activeBarRef.current);
                            return;
                        }

                        const currentBar = activeBarRef.current;
                        const barTime = currentBar.time; // This is the start of the current bar (e.g. 12:00:00)

                        // Timeframe logic (Assuming 1 Minute for now)
                        // If tickTime is in the NEXT minute, we close current and start new
                        // Note: TerminalChart expects seconds if we are using TimeScale
                        const isNewBar = tickTime >= barTime + 60;

                        if (isNewBar) {
                            // CREATE NEW CANDLE
                            const newBar = {
                                time: Math.floor(tickTime / 60) * 60, // Snap to minute grid
                                open: currentBar.close, // Open at previous close (gapless)
                                high: price,
                                low: price,
                                close: price
                            };
                            activeBarRef.current = newBar;
                            seriesAPI.current.update(newBar);
                        } else {
                            // UPDATE EXISTING CANDLE
                            const updatedBar = {
                                ...currentBar,
                                high: Math.max(currentBar.high, price),
                                low: Math.min(currentBar.low, price),
                                close: price
                            };
                            activeBarRef.current = updatedBar;
                            seriesAPI.current.update(updatedBar);
                        }
                    }
                }
            } catch (e) {
                console.warn("Tick Error:", e);
            }
        };
        return () => eventSource.close();
    }, [selectedSymbol]); // Remove chartData dependency so we don't reconnect constantly

    // 2. Fetch Historical Data & Account State
    const fetchData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const accId = account?.id;

            // Always fetch chart data, even without account
            console.log('[Layout] Fetching history for', selectedSymbol);
            const dataRes = await fetch(`http://localhost:5000/api/market/history/${selectedSymbol}?timeframe=${timeframe}`);

            if (dataRes.ok) {
                const history = await dataRes.json();
                console.log('[Layout] Received', history.length, 'candles');
                if (history && history.length > 0) {
                    setChartData(history);
                } else {
                    throw new Error("Empty Data");
                }
            }

            // Fetch positions and account only if logged in
            if (!accId) return;

            const [posRes, accRes] = await Promise.all([
                fetch('http://localhost:5000/api/trade/positions', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`http://localhost:5000/api/trade/account/${accId}`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (posRes.ok) {
                const pos = await posRes.json();
                setPositions(pos.filter(p => p.account_id === accId));
            }

            if (accRes.ok) {
                const acc = await accRes.json();
                setAccount(acc);
            }
        } catch (e) {
            console.error("Fetch Data Error:", e);
            // Fallback: Generate mock data if API fails to prevent blank screen
            // Fallback: Generate mock data if API fails to prevent blank screen
            const now = Math.floor(Date.now() / 1000);
            const fallbackData = [];
            let price = selectedSymbol === 'NIFTY' ? 22000 : 46000;
            const BAR_INTERVAL = 3; // Match the Live "Hyper Speed" interval

            for (let i = 300; i >= 0; i--) {
                const time = now - (i * BAR_INTERVAL);
                // Dynamic volatility for history seeds
                const change = (Math.random() - 0.5) * (price * 0.0005);
                const close = price + change;
                const high = Math.max(price, close) + Math.random() * 2;
                const low = Math.min(price, close) - Math.random() * 2;

                fallbackData.push({
                    time,
                    open: price,
                    high,
                    low,
                    close
                });
                price = close;
            }
            setChartData(fallbackData);
        }
    }, [selectedSymbol, timeframe, account?.id]);

    useEffect(() => {
        // Initial fetch only
        fetchData();
        // Polling removed to rely on SSE streaming for smoother charts
    }, [fetchData]);

    // 3. Trade Handlers
    const handleOrder = async (symbol, side, lots, type, price, limitPrice, sl, tp, isClose = false) => {
        // GLOBAL RISK LOCK CHECK
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
            const body = isClose ? { tradeId: symbol.id } : { accountId: account.id, symbol, side, lots, type, price: limitPrice, sl, tp };

            const res = await fetch(`http://localhost:5000${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            const result = await res.json();
            if (res.ok) {
                addToast(isClose ? 'Position Closed' : 'Order Executed', 'success');
                fetchData();
                if (onTrade) onTrade();
            } else {
                addToast(result.error || 'Execution Error', 'error');
            }
        } catch (e) {
            addToast('Pipeline Connection Lost', 'error');
        }
    };

    const handleChartReady = (chart, series) => {
        chartAPI.current = chart;
        seriesAPI.current = series;
    };

    // Chart Control Handlers
    const handleZoomIn = () => chartAPI.current?.timeScale().zoomIn();
    const handleZoomOut = () => chartAPI.current?.timeScale().zoomOut();
    const handleReset = () => chartAPI.current?.timeScale().fitContent();

    return (
        <div className="flex flex-col h-full bg-background overflow-hidden font-sans relative transition-colors duration-300">
            {/* Risk Banner Injection */}
            <RiskStatusBanner />

            <TerminalHeader
                account={account}
                quotes={quotes}
                selectedSymbol={selectedSymbol}
                onSelectSymbol={setSelectedSymbol}
                onSearch={setSearchTerm}
                onToggleRightPanel={() => setIsRightPanelOpen(!isRightPanelOpen)}
                chartType={chartType}
                setChartType={setChartType}
                isPanelOpen={isRightPanelOpen}
                onOpenSettings={() => setShowSettings(true)}
                onOpenAlerts={() => setShowAlertModal(true)}
            />

            <div className="flex-1 flex min-h-0 relative overflow-hidden">
                <div
                    className={`flex-1 relative flex flex-col min-w-0 bg-background border-r border-border transition-all duration-300 ease-in-out ${isRightPanelOpen ? 'mr-0' : 'flex-1'}`}
                >
                    {/* CHART AREA with proper Flex container */}
                    <div className="flex-1 flex overflow-hidden relative">
                        <div className="flex-none">
                            <ChartToolbar
                                activeTool={activeTool}
                                setActiveTool={setActiveTool}
                                onOpenAlerts={() => setShowAlertModal(true)}
                            />
                        </div>

                        <div className="flex-1 relative h-full min-h-0 min-w-0">
                            <TerminalChart
                                symbol={selectedSymbol}
                                data={chartData}
                                chartType={chartType}
                                onChartReady={handleChartReady}
                            />

                            {/* LIVE POSITION OVERLAYS */}
                            <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                                {positions
                                    .filter(p => p.symbol === selectedSymbol)
                                    .map(pos => {
                                        let topPosition = '50%';
                                        try {
                                            if (chartAPI.current && chartAPI.current.priceScale) {
                                                const entry = parseFloat(pos.entry_price || pos.price || 0);
                                                const coordinate = chartAPI.current.priceScale('right').priceToCoordinate(entry);
                                                if (coordinate !== null) {
                                                    topPosition = `${coordinate}px`;
                                                }
                                            }
                                        } catch (e) {
                                            // Fallback to center if chart is not ready
                                        }

                                        return (
                                            <div
                                                key={pos.id}
                                                className="absolute w-full"
                                                style={{ top: topPosition }}
                                            >
                                                <PositionOverlay
                                                    position={pos}
                                                    currentPrice={quotes[selectedSymbol]?.ltp}
                                                />
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    </div>

                    <TimeframeSelector
                        timeframe={timeframe}
                        setTimeframe={setTimeframe}
                        onZoomIn={handleZoomIn}
                        onZoomOut={handleZoomOut}
                        onReset={handleReset}
                    />

                    {/* ALERT MODAL OVERLAY */}
                    <AlertModal
                        isOpen={showAlertModal}
                        onClose={() => setShowAlertModal(false)}
                        symbol={selectedSymbol}
                        quotes={quotes}
                        currentPrice={quotes[selectedSymbol]?.ltp}
                    />
                </div>

                {/* Right Panel with Slide Animation */}
                <div
                    className={`transition-all duration-300 ease-in-out bg-surface border-l border-border ${isRightPanelOpen ? 'w-[360px] translate-x-0 opacity-100' : 'w-0 translate-x-full opacity-0 overflow-hidden'
                        }`}
                >
                    <UnifiedRightPanel
                        isOpen={true} // Always mounted but hidden by CSS width
                        account={account}
                        quotes={quotes}
                        positions={positions}
                        selectedSymbol={selectedSymbol}
                        onSelectSymbol={setSelectedSymbol}
                        searchTerm={searchTerm}
                        onOrder={handleOrder}
                        onClosePosition={(pos) => handleOrder(pos, null, null, null, null, null, null, null, true)}
                        onOpenSettings={() => setShowSettings(true)}
                    />
                </div>
            </div>

            {/* NEW GLOBAL SETTINGS PANEL */}
            <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
        </div>
    );
}

// Wrapper for Provider
export default function TerminalLayout(props) {
    const location = useLocation();
    const accountFromState = location.state?.account;

    // Priority: Props > Location State > Undefined (will fetch in wrapper)
    const initialAccount = props.account || accountFromState;

    return (
        <TerminalLayoutStateWrapper {...props} account={initialAccount} />
    );
}



function TerminalLayoutStateWrapper(props) {
    const [account, setAccount] = useState(props.account);
    const { addToast } = useToast();

    // Sync with props
    useEffect(() => {
        if (props.account) setAccount(props.account);
    }, [props.account]);

    // Fallback: If no account provided, fetch the most recent active account
    useEffect(() => {
        if (!account) {
            const fetchLastAccount = async () => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) return;

                    const res = await fetch('http://localhost:5000/api/trade/accounts', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (res.ok) {
                        const accounts = await res.json();
                        // Find first active, or just the most recent one
                        const lastAccount = accounts.find(a => a.status === 'active') || accounts[0];

                        if (lastAccount) {
                            setAccount(lastAccount);
                            console.log("Restored account from API:", lastAccount);
                        } else {
                            addToast('No Trading Accounts Found', 'warning');
                        }
                    }
                } catch (e) {
                    console.error("Account Restore Error:", e);
                }
            };
            fetchLastAccount();
        }
    }, [account]);

    // We also need to be able to UPDATE this account from inside.
    const updateAccount = (newAcc) => setAccount(newAcc);

    return (
        <RiskManagementProvider
            initialBalance={account?.daily_start_balance || props.account?.daily_start_balance || account?.balance || 100000}
            currentBalance={account?.equity || account?.balance || 100000}
        >
            <AlgoProvider>
                <TerminalLayoutContent
                    {...props}
                    account={account}
                    setAccount={updateAccount}
                />
            </AlgoProvider>
        </RiskManagementProvider>
    );
}
