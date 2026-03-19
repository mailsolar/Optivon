import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    createChart,
    ColorType,
    CandlestickSeries,
    LineSeries,
    AreaSeries,
    BarSeries,
    LineStyle,
} from 'lightweight-charts';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const IST_OFFSET = 5.5 * 60 * 60 * 1000;

function toIST(timestamp) {
    return new Date(timestamp * 1000 + IST_OFFSET);
}

function formatTickIST(timestamp, isIntraday) {
    const d = toIST(timestamp);
    const hh = d.getUTCHours().toString().padStart(2, '0');
    const mm = d.getUTCMinutes().toString().padStart(2, '0');
    const DD = d.getUTCDate().toString().padStart(2, '0');
    const MM = (d.getUTCMonth() + 1).toString().padStart(2, '0');
    return isIntraday ? `${hh}:${mm}` : `${DD}/${MM}`;
}

// Compute EMA series data
function computeEMA(data, period) {
    if (!data || data.length < period) return [];
    const k = 2 / (period + 1);
    const result = [];
    let ema = data.slice(0, period).reduce((s, c) => s + c.close, 0) / period;
    result.push({ time: data[period - 1].time, value: ema });
    for (let i = period; i < data.length; i++) {
        ema = data[i].close * k + ema * (1 - k);
        result.push({ time: data[i].time, value: ema });
    }
    return result;
}

// Compute VWAP series data (intraday reset — approximation via cumulative)
function computeVWAP(data) {
    if (!data || data.length === 0) return [];
    let cumTPV = 0, cumVol = 0;
    return data.map(c => {
        const tp = (c.high + c.low + c.close) / 3;
        const vol = c.volume || 1;
        cumTPV += tp * vol;
        cumVol += vol;
        return { time: c.time, value: cumTPV / cumVol };
    });
}

// Convert candles to Heikin-Ashi
function toHeikinAshi(data) {
    if (!data || data.length === 0) return [];
    const result = [];
    let prevHA = null;
    for (const c of data) {
        const haClose = (c.open + c.high + c.low + c.close) / 4;
        const haOpen = prevHA ? (prevHA.open + prevHA.close) / 2 : (c.open + c.close) / 2;
        const haHigh = Math.max(c.high, haOpen, haClose);
        const haLow = Math.min(c.low, haOpen, haClose);
        const ha = { time: c.time, open: haOpen, high: haHigh, low: haLow, close: haClose };
        result.push(ha);
        prevHA = ha;
    }
    return result;
}

// ─── Chart Config ─────────────────────────────────────────────────────────────

const BAR_SPACING = { '1m': 8, '5m': 6, '15m': 5, '1h': 5, '4h': 4, '1D': 4 };

function buildChartOptions(container, timeframe) {
    const isIntraday = !['1D', '1W', '1M'].includes(timeframe);
    return {
        layout: {
            background: { type: ColorType.Solid, color: '#0F0F10' },
            textColor: '#A6A6A6', // Stone
            fontSize: 11,
            fontFamily: "'Inter', sans-serif",
            attributionLogo: false,
        },
        grid: {
            vertLines: { color: 'rgba(255,255,255,0.01)', style: LineStyle.Solid }, 
            horzLines: { color: 'rgba(255,255,255,0.01)', style: LineStyle.Solid },
        },
        crosshair: {
            mode: 1, // CrosshairMode.Normal
            vertLine: {
                color: '#646466', // Slate
                width: 1,
                style: LineStyle.Dashed,
                labelBackgroundColor: '#1C1C1E', // Quartz
            },
            horzLine: {
                color: '#646466', // Slate
                width: 1,
                style: LineStyle.Dashed,
                labelBackgroundColor: '#1C1C1E', // Quartz
            },
        },
        rightPriceScale: {
            borderColor: 'rgba(255,255,255,0.02)',
            textColor: '#A6A6A6',
            autoScale: true,
            scaleMargins: {
                top: 0.1,
                bottom: 0.1,
            },
            alignLabels: true,
            borderVisible: true,
        },
        timeScale: {
            borderColor: 'rgba(255,255,255,0.02)',
            timeVisible: true,
            secondsVisible: false,
            barSpacing: BAR_SPACING[timeframe] || 6,
            minBarSpacing: 2,
            rightOffset: 12,
            fixLeftEdge: true,
            tickMarkFormatter: (ts) => formatTickIST(ts, isIntraday),
        },
        localization: {
            priceFormatter: (p) => p.toFixed(2),
        },
        handleScroll: {
            mouseWheel: true,
            pressedMouseMove: true,
            horzTouchDrag: true,
            vertTouchDrag: true,
        },
        handleScale: {
            mouseWheel: true,
            pinch: true,
            axisPressedMouseMove: true,
        },
    };
}

// ─── Series Factories ─────────────────────────────────────────────────────────

function createMainSeries(chart, chartType) {
    switch (chartType) {
        case 'line':
            return chart.addSeries(LineSeries, {
                color: '#6366f1',
                lineWidth: 2,
                crosshairMarkerVisible: true,
                crosshairMarkerRadius: 4,
                crosshairMarkerBorderColor: '#fff',
                crosshairMarkerBackgroundColor: '#6366f1',
                lastValueVisible: false,
                priceLineVisible: false,
            });
        case 'area':
            return chart.addSeries(AreaSeries, {
                lineColor: '#6366f1',
                topColor: 'rgba(99,102,241,0.3)',
                bottomColor: 'rgba(99,102,241,0.01)',
                lineWidth: 2,
                lastValueVisible: false,
                priceLineVisible: false,
            });
        case 'bars':
        case 'hlc':
            return chart.addSeries(BarSeries, {
                upColor: '#26a69a',
                downColor: '#ef5350',
                thinBars: chartType === 'hlc',
                lastValueVisible: false,
                priceLineVisible: false,
            });
        case 'hollow':
            return chart.addSeries(CandlestickSeries, {
                upColor: 'transparent',
                downColor: '#ef5350',
                borderUpColor: '#26a69a',
                borderDownColor: '#ef5350',
                wickUpColor: '#26a69a',
                wickDownColor: '#ef5350',
                borderVisible: true,
                lastValueVisible: false,
                priceLineVisible: false,
            });
        case 'heikinashi':
            return chart.addSeries(CandlestickSeries, {
                upColor: '#26a69a',
                downColor: '#ef5350',
                borderVisible: false,
                wickUpColor: '#26a69a',
                wickDownColor: '#ef5350',
                lastValueVisible: false,
                priceLineVisible: false,
            });
        case 'candlestick':
        default:
            return chart.addSeries(CandlestickSeries, {
                upColor: '#26a69a',
                downColor: '#ef5350',
                borderVisible: false,
                wickUpColor: '#26a69a',
                wickDownColor: '#ef5350',
                lastValueVisible: false,
                priceLineVisible: false,
            });
    }
}

function prepareData(data, chartType) {
    if (!data || data.length === 0) return [];
    if (chartType === 'line' || chartType === 'area') {
        return data.map(c => ({ time: c.time, value: c.close }));
    }
    if (chartType === 'heikinashi') {
        return toHeikinAshi(data);
    }
    return data;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TerminalChart({
    data,
    symbol = 'NIFTY',
    onChartReady,
    chartType = 'candlestick',
    positions = [],
    quotes = {},
    timeframe = '1m',
    activeIndicators = {},
    onClosePosition, // New prop for exiting positions from the chart
}) {
    const containerRef = useRef(null);
    const [hoveredPosition, setHoveredPosition] = useState(null); // Track which position is being hovered
    const [positionCoordinates, setPositionCoordinates] = useState({}); // Store Y coordinates mapped by position ID

    // Dragging state for TP/SL interactive setup
    const [draggingOrder, setDraggingOrder] = useState(null); // { posId, type: 'tp'|'sl', price }
    const draggingOrderRef = useRef(null);
    const [optimisticOverrides, setOptimisticOverrides] = useState({}); // { [posId_type]: price }

    useEffect(() => {
        draggingOrderRef.current = draggingOrder;
    }, [draggingOrder]);

    // Stable refs so effects don't need them as dependencies
    const chartRef = useRef(null);
    const seriesRef = useRef(null);
    const priceLinesRef = useRef([]);
    const emaSeriesRef = useRef(null);
    const vwapSeriesRef = useRef(null);
    const prevChartTypeRef = useRef(chartType);
    const prevTimeframeRef = useRef(timeframe);

    // ── 1. Mount chart once ───────────────────────────────────────────────────
    useEffect(() => {
        if (!containerRef.current) return;

        const chart = createChart(containerRef.current, buildChartOptions(containerRef.current, timeframe));
        const series = createMainSeries(chart, chartType);

        chartRef.current = chart;
        seriesRef.current = series;
        prevChartTypeRef.current = chartType;
        prevTimeframeRef.current = timeframe;

        if (onChartReady) onChartReady(chart, series);

        // Resize observer — more reliable than window resize
        const ro = new ResizeObserver(() => {
            if (containerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight,
                });
            }
        });
        ro.observe(containerRef.current);

        return () => {
            ro.disconnect();
            chart.remove();
            chartRef.current = null;
            seriesRef.current = null;
        };
    }, []); // mount once

    // ── 2. Swap series when chartType changes ─────────────────────────────────
    useEffect(() => {
        if (!chartRef.current || chartType === prevChartTypeRef.current) return;

        const chart = chartRef.current;

        // Remove old indicators (they're attached to the old series context)
        if (emaSeriesRef.current) { try { chart.removeSeries(emaSeriesRef.current); } catch (_) { } emaSeriesRef.current = null; }
        if (vwapSeriesRef.current) { try { chart.removeSeries(vwapSeriesRef.current); } catch (_) { } vwapSeriesRef.current = null; }

        // Remove old main series
        if (seriesRef.current) { try { chart.removeSeries(seriesRef.current); } catch (_) { } }

        // Create new series
        const newSeries = createMainSeries(chart, chartType);
        seriesRef.current = newSeries;
        prevChartTypeRef.current = chartType;

        if (onChartReady) onChartReady(chart, newSeries);

        // Re-push data
        if (data && data.length > 0) {
            newSeries.setData(prepareData(data, chartType));
            chart.timeScale().fitContent();
        }
    }, [chartType]);

    // ── 3. Update timeframe options (no series swap needed) ───────────────────
    useEffect(() => {
        if (!chartRef.current || timeframe === prevTimeframeRef.current) return;
        const isIntraday = !['1D', '1W', '1M'].includes(timeframe);
        chartRef.current.applyOptions({
            timeScale: {
                barSpacing: BAR_SPACING[timeframe] || 6,
                tickMarkFormatter: (ts) => formatTickIST(ts, isIntraday),
            },
        });
        prevTimeframeRef.current = timeframe;
    }, [timeframe]);

    // ── 4. Sync data on symbol/timeframe switch ───────────────────────────────
    const lastContextRef = useRef('');
    const lastLenRef = useRef(0);

    useEffect(() => {
        if (!chartRef.current || !seriesRef.current || !data || data.length === 0) return;

        const ctx = `${symbol}-${timeframe}-${chartType}`;
        const grew = data.length > lastLenRef.current;

        if (ctx !== lastContextRef.current || grew) {
            seriesRef.current.setData(prepareData(data, chartType));
            if (ctx !== lastContextRef.current) {
                chartRef.current.timeScale().fitContent();
            }
            lastContextRef.current = ctx;
        }
        lastLenRef.current = data.length;
    }, [data, symbol, timeframe, chartType]);

    const ltpLineRef = useRef(null);

    // ── 5. LTP + Position price lines ──────────────────────────────────────────
    useEffect(() => {
        if (!seriesRef.current) return;

        // Clear old lines
        priceLinesRef.current.forEach(l => { try { seriesRef.current.removePriceLine(l); } catch (_) { } });
        priceLinesRef.current = [];

        if (ltpLineRef.current) {
            try { seriesRef.current.removePriceLine(ltpLineRef.current); } catch (_) { }
            ltpLineRef.current = null;
        }

        // 1. Mandatory Live Price Line (Institutional Standard)
        const q = quotes[symbol];
        if (q && q.ltp && data && data.length > 0) {
            const currentPrice = parseFloat(q.ltp);
            const currentCandle = data[data.length - 1];

            // Logic: Color matches the candle sentiment (Bullish/Bearish)
            // If current price > candle open = Green
            const isBullish = currentPrice >= currentCandle.open;
            const ltpColor = isBullish ? '#22c55e' : '#ef4444';

            ltpLineRef.current = seriesRef.current.createPriceLine({
                price: currentPrice,
                color: ltpColor,
                lineWidth: 1,
                lineStyle: LineStyle.Dotted,
                axisLabelVisible: true,
                title: '',
            });
        }

        // 2. Position lines (Solid Entry, Red SL, Green TP)
        positions.forEach(pos => {
            if (pos.symbol !== symbol) return;
            const entry = parseFloat(pos.entry_price || pos.price || pos.entryPrice || 0);
            if (!entry) return;

            const q = quotes[pos.symbol];
            const curr = q ? parseFloat(q.ltp) : entry;
            const lot = pos.symbol === 'BANKNIFTY' ? 15 : pos.symbol === 'NIFTY' ? 75 : 1;
            const pnl = (pos.side === 'buy' ? curr - entry : entry - curr) * pos.lots * lot;
            const sign = pnl >= 0 ? '+' : '-';
            const color = pos.side === 'buy' ? '#22c55e' : '#ef4444';

            // ENTRY LINE (Sleek Professional)
            const line = seriesRef.current.createPriceLine({
                price: entry,
                color,
                lineWidth: 1,
                lineStyle: LineStyle.Dashed,
                axisLabelVisible: true,
                title: '', // Text is handled by HTML overlay
            });
            priceLinesRef.current.push(line);
        });

        // Setup coordinate tracking for interactive HTML overlays
        const updateCoordinates = () => {
            if (!seriesRef.current || positions.length === 0) return;
            const newCoords = {};
            positions.forEach(pos => {
                if (pos.symbol !== symbol) return;
                const entry = parseFloat(pos.entry_price || pos.price || pos.entryPrice || 0);
                if (entry) {
                    const yCoordinate = seriesRef.current.priceToCoordinate(entry);
                    if (yCoordinate !== null) newCoords[pos.id] = yCoordinate;
                }
                const tp = parseFloat(pos.tp);
                if (tp) {
                    const yTp = seriesRef.current.priceToCoordinate(tp);
                    if (yTp !== null) newCoords[`${pos.id}_tp`] = yTp;
                }
                const sl = parseFloat(pos.sl);
                if (sl) {
                    const ySl = seriesRef.current.priceToCoordinate(sl);
                    if (ySl !== null) newCoords[`${pos.id}_sl`] = ySl;
                }
            });
            setPositionCoordinates(newCoords);
        };

        // Setup coordinate tracking for interactive HTML overlays
        updateCoordinates();

        const chart = chartRef.current;
        if (chart) {
            chart.timeScale().subscribeVisibleTimeRangeChange(updateCoordinates);
        }

        return () => {
            if (chart) {
                chart.timeScale().unsubscribeVisibleTimeRangeChange(updateCoordinates);
            }
        };

    }, [quotes, positions, symbol]);

    // Isolated Event Listeners for Dragging
    useEffect(() => {
        if (!draggingOrder) return;

        const handleDragMove = (e) => {
            const currentDragging = draggingOrderRef.current;
            if (!currentDragging || !seriesRef.current || !chartRef.current) return;
            const container = containerRef.current;
            if (!container) return;

            const rect = container.getBoundingClientRect();
            const y = e.clientY - rect.top;
            const price = seriesRef.current.coordinateToPrice(y);
            if (price) {
                setDraggingOrder(prev => ({ ...prev, price: price }));
            }
        };

        const handleDragEnd = async () => {
            const currentDragging = draggingOrderRef.current;
            if (!currentDragging) return;

            // Optimistically update the position to prevent visual snap-back
            setOptimisticOverrides(prev => ({
                ...prev,
                [`${currentDragging.posId}_${currentDragging.type}`]: currentDragging.price
            }));

            setDraggingOrder(null);

            try {
                const token = localStorage.getItem('token');
                const updateField = currentDragging.type === 'tp' ? { tp: currentDragging.price } : { sl: currentDragging.price };

                await fetch('/api/trade/update-position', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        positionId: currentDragging.posId,
                        ...updateField
                    })
                });
            } catch (err) {
                console.error("Error saving TP/SL on drag end:", err);
            }
        };

        window.addEventListener('mousemove', handleDragMove);
        window.addEventListener('mouseup', handleDragEnd);

        return () => {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
        };
    }, [draggingOrder?.posId, draggingOrder?.type]);

    // Update coordinates constantly on data arrival (tick) as the scale might shift
    useEffect(() => {
        if (!seriesRef.current || positions.length === 0) return;

        let stopRAF = false;
        const loop = () => {
            if (stopRAF || !seriesRef.current) return;

            const newCoords = {};
            positions.forEach(pos => {
                if (pos.symbol !== symbol) return;

                // Entry Price Line
                const entry = parseFloat(pos.entry_price || pos.price || pos.entryPrice || 0);
                if (entry) {
                    const yCoordinate = seriesRef.current.priceToCoordinate(entry);
                    if (yCoordinate !== null) newCoords[pos.id] = yCoordinate;
                }

                // TP Line
                if (draggingOrderRef.current?.posId === pos.id && draggingOrderRef.current?.type === 'tp') {
                    // Use dragged price
                    const yTp = seriesRef.current.priceToCoordinate(draggingOrderRef.current.price);
                    if (yTp !== null) newCoords[`${pos.id}_tp`] = yTp;
                } else {
                    const optimisticTP = optimisticOverrides[`${pos.id}_tp`];
                    const tp = optimisticTP !== undefined ? optimisticTP : parseFloat(pos.tp);
                    if (tp) {
                        const yTp = seriesRef.current.priceToCoordinate(tp);
                        if (yTp !== null) newCoords[`${pos.id}_tp`] = yTp;
                    }
                }

                // SL Line
                if (draggingOrderRef.current?.posId === pos.id && draggingOrderRef.current?.type === 'sl') {
                    // Use dragged price
                    const ySl = seriesRef.current.priceToCoordinate(draggingOrderRef.current.price);
                    if (ySl !== null) newCoords[`${pos.id}_sl`] = ySl;
                } else {
                    const optimisticSL = optimisticOverrides[`${pos.id}_sl`];
                    const sl = optimisticSL !== undefined ? optimisticSL : parseFloat(pos.sl);
                    if (sl) {
                        const ySl = seriesRef.current.priceToCoordinate(sl);
                        if (ySl !== null) newCoords[`${pos.id}_sl`] = ySl;
                    }
                }
            });
            setPositionCoordinates(newCoords);
            requestAnimationFrame(loop);
        };
        loop();

        return () => { stopRAF = true; };
    }, [data, positions, symbol, optimisticOverrides, draggingOrder]);

    // ── 6. Indicator overlays (EMA, VWAP) ────────────────────────────────────
    useEffect(() => {
        if (!chartRef.current || !data || data.length === 0) return;
        const chart = chartRef.current;

        // EMA 20
        if (activeIndicators.ema20) {
            if (!emaSeriesRef.current) {
                emaSeriesRef.current = chart.addSeries(LineSeries, {
                    color: '#f59e0b',
                    lineWidth: 1,
                    priceLineVisible: false,
                    lastValueVisible: false,
                    crosshairMarkerVisible: false,
                });
            }
            emaSeriesRef.current.setData(computeEMA(data, 20));
        } else {
            if (emaSeriesRef.current) {
                try { chart.removeSeries(emaSeriesRef.current); } catch (_) { }
                emaSeriesRef.current = null;
            }
        }

        // VWAP
        if (activeIndicators.vwap) {
            if (!vwapSeriesRef.current) {
                vwapSeriesRef.current = chart.addSeries(LineSeries, {
                    color: '#a78bfa',
                    lineWidth: 1,
                    lineStyle: LineStyle.Dashed,
                    priceLineVisible: false,
                    lastValueVisible: false,
                    crosshairMarkerVisible: false,
                });
            }
            vwapSeriesRef.current.setData(computeVWAP(data));
        } else {
            if (vwapSeriesRef.current) {
                try { chart.removeSeries(vwapSeriesRef.current); } catch (_) { }
                vwapSeriesRef.current = null;
            }
        }
    }, [activeIndicators, data]);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'absolute',
                inset: 0,
                background: '#0a0e1a',
            }}
        >
            {/* Overlay Interactive Position Markers (TradingView/XM Style) */}
            {positions.filter(p => p.symbol === symbol).map(pos => {
                const yPos = positionCoordinates[pos.id];
                if (yPos === undefined || yPos === null) return null;

                const isHovered = hoveredPosition === pos.id;
                const isBuy = pos.side === 'buy';
                const lotMultiplier = pos.symbol === 'BANKNIFTY' ? 15 : pos.symbol === 'NIFTY' ? 75 : 1;
                const entry = parseFloat(pos.entry_price || pos.price || pos.entryPrice || 0);
                const q = quotes[pos.symbol];
                const curr = q ? parseFloat(q.ltp) : entry;
                const pnl = (isBuy ? curr - entry : entry - curr) * pos.lots * lotMultiplier;
                const sign = pnl >= 0 ? '+' : '';

                // Colors per TradingView standard
                const qtyBg = isBuy ? 'bg-[#2962ff]' : 'bg-[#e53935]';
                const qtyBorder = isBuy ? 'border-[#2962ff]' : 'border-[#e53935]';
                const pnlColor = pnl >= 0 ? 'text-[#089981]' : 'text-[#f23645]';

                const actualTP = optimisticOverrides[`${pos.id}_tp`] !== undefined ? optimisticOverrides[`${pos.id}_tp`] : parseFloat(pos.tp);
                const actualSL = optimisticOverrides[`${pos.id}_sl`] !== undefined ? optimisticOverrides[`${pos.id}_sl`] : parseFloat(pos.sl);

                const hasTP = actualTP !== null && actualTP !== undefined && actualTP > 0;
                const hasSL = actualSL !== null && actualSL !== undefined && actualSL > 0;

                const isDraggingTP = draggingOrder?.posId === pos.id && draggingOrder?.type === 'tp';
                const isDraggingSL = draggingOrder?.posId === pos.id && draggingOrder?.type === 'sl';

                return (
                    <div
                        key={pos.id}
                        className="absolute right-[65px] z-50 flex items-center justify-end pointer-events-none"
                        style={{
                            top: `${yPos}px`,
                            transform: 'translateY(-50%)',
                        }}
                    >
                        {/* Container that catches hover and pushes items together */}
                        <div
                            className="flex items-center gap-1 pointer-events-auto"
                            onMouseEnter={() => setHoveredPosition(pos.id)}
                            onMouseLeave={() => setHoveredPosition(null)}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                        >
                            {/* Slide-out TP / SL Controls ONLY IF NOT SET YET */}
                            <div className={`flex items-center gap-1 overflow-hidden transition-all duration-300 ease-out ${isHovered || isDraggingTP || isDraggingSL ? 'w-auto opacity-100 pr-1' : 'w-0 opacity-0'}`}>
                                {!hasTP && !isDraggingTP && (
                                    <div
                                        className="cursor-pointer flex items-center justify-center w-7 h-[22px] bg-background/95 border border-[#089981] text-[#089981] font-mono text-[10px] font-bold rounded-sm select-none hover:bg-[#089981]/20 transition-colors"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            const container = containerRef.current;
                                            if (!container) return;

                                            setDraggingOrder({ posId: pos.id, type: 'tp', price: q ? parseFloat(q.ltp) : entry });
                                        }}
                                    >
                                        TP
                                    </div>
                                )}
                                {!hasSL && !isDraggingSL && (
                                    <div
                                        className="cursor-pointer flex items-center justify-center w-7 h-[22px] bg-background/95 border border-[#f23645] text-[#f23645] font-mono text-[10px] font-bold rounded-sm select-none hover:bg-[#f23645]/20 transition-colors"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            const container = containerRef.current;
                                            if (!container) return;

                                            setDraggingOrder({ posId: pos.id, type: 'sl', price: q ? parseFloat(q.ltp) : entry });
                                        }}
                                    >
                                        SL
                                    </div>
                                )}
                            </div>

                            {/* Main Order Line Badge (Qty | PnL | X) */}
                            <div className={`flex items-stretch shadow-[0_2px_8px_rgba(0,0,0,0.3)] rounded-[3px] overflow-hidden border ${qtyBorder} bg-[#131722]`}>
                                {/* LOTS */}
                                <div className={`flex items-center justify-center px-2 py-0.5 ${qtyBg} text-white font-mono font-bold text-[11px] select-none`}>
                                    {pos.lots}
                                </div>

                                {/* PnL */}
                                <div className="flex flex-col justify-center px-2 py-0.5 select-none text-[11px] font-mono font-bold bg-[#131722] border-x border-[#2a2e39]">
                                    <span className={pnlColor}>
                                        {sign}{pnl.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} INR
                                    </span>
                                </div>

                                {/* Close (✕) */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (onClosePosition) onClosePosition(pos.id);
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    className="flex items-center justify-center px-1.5 hover:bg-[#2a2e39] active:bg-[#363a45] transition-colors text-slate-400 hover:text-white"
                                    title="Close Position"
                                >
                                    <svg width="10" height="10" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Placed TP / SL Markers */}
            {positions.filter(p => p.symbol === symbol).map(pos => {
                const elements = [];

                const optimisticTP = optimisticOverrides[`${pos.id}_tp`];
                const tp = optimisticTP !== undefined ? optimisticTP : parseFloat(pos.tp);

                if (tp) {
                    const yTp = positionCoordinates[`${pos.id}_tp`];
                    if (yTp !== undefined && yTp !== null && (draggingOrder?.posId !== pos.id || draggingOrder?.type !== 'tp')) {
                        elements.push(
                            <div key={`tp-${pos.id}`} className="absolute left-0 right-[65px] z-40 pointer-events-none flex items-center justify-end" style={{ top: `${yTp}px`, transform: 'translateY(-50%)' }}>
                                <div className="w-full h-px border-t border-dashed border-[#089981]/70 relative">
                                    <div
                                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+8px)] px-2 py-0.5 text-[10px] font-mono font-bold rounded-sm border border-[#089981] bg-[#089981]/20 text-[#089981] pointer-events-auto cursor-ns-resize hover:bg-[#089981]/40 flex items-center gap-1"
                                        onMouseDown={(e) => {
                                            e.preventDefault(); e.stopPropagation();
                                            setDraggingOrder({ posId: pos.id, type: 'tp', price: tp });
                                        }}
                                    >
                                        TP
                                        <button
                                            className="text-white/60 hover:text-white font-normal"
                                            onMouseDown={e => e.stopPropagation()}
                                            onClick={async (e) => {
                                                e.preventDefault(); e.stopPropagation();
                                                try {
                                                    setOptimisticOverrides(prev => ({ ...prev, [`${pos.id}_tp`]: null }));
                                                    const token = localStorage.getItem('token');
                                                    await fetch('/api/trade/update-position', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ positionId: pos.id, tp: null }) });
                                                } catch (e) { }
                                            }}
                                        >×</button>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                }

                const optimisticSL = optimisticOverrides[`${pos.id}_sl`];
                const sl = optimisticSL !== undefined ? optimisticSL : parseFloat(pos.sl);

                if (sl) {
                    const ySl = positionCoordinates[`${pos.id}_sl`];
                    if (ySl !== undefined && ySl !== null && (draggingOrder?.posId !== pos.id || draggingOrder?.type !== 'sl')) {
                        elements.push(
                            <div key={`sl-${pos.id}`} className="absolute left-0 right-[65px] z-40 pointer-events-none flex items-center justify-end" style={{ top: `${ySl}px`, transform: 'translateY(-50%)' }}>
                                <div className="w-full h-px border-t border-dashed border-[#f23645]/70 relative">
                                    <div
                                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+8px)] px-2 py-0.5 text-[10px] font-mono font-bold rounded-sm border border-[#f23645] bg-[#f23645]/20 text-[#f23645] pointer-events-auto cursor-ns-resize hover:bg-[#f23645]/40 flex items-center gap-1"
                                        onMouseDown={(e) => {
                                            e.preventDefault(); e.stopPropagation();
                                            setDraggingOrder({ posId: pos.id, type: 'sl', price: sl });
                                        }}
                                    >
                                        SL
                                        <button
                                            className="text-white/60 hover:text-white font-normal"
                                            onMouseDown={e => e.stopPropagation()}
                                            onClick={async (e) => {
                                                e.preventDefault(); e.stopPropagation();
                                                try {
                                                    setOptimisticOverrides(prev => ({ ...prev, [`${pos.id}_sl`]: null }));
                                                    const token = localStorage.getItem('token');
                                                    await fetch('/api/trade/update-position', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ positionId: pos.id, sl: null }) });
                                                } catch (e) { }
                                            }}
                                        >×</button>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                }
                return elements;
            })}

            {/* Render Dragging Line (if active) */}
            {draggingOrder && (
                <div
                    className="absolute left-0 right-[65px] z-40 pointer-events-none flex items-center justify-end"
                    style={{
                        top: `${seriesRef.current?.priceToCoordinate(draggingOrder.price) || 0}px`,
                        transform: 'translateY(-50%)',
                    }}
                >
                    <div className="w-full h-px border-t border-dashed border-[#8b91a8]/70 relative">
                        {/* TradingView style drag badge */}
                        <div className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+8px)] px-2 py-0.5 text-[10px] font-mono font-bold rounded-sm border ${draggingOrder.type === 'tp' ? 'border-[#089981] bg-[#089981]/20 text-[#089981]' : 'border-[#f23645] bg-[#f23645]/20 text-[#f23645]'}`}>
                            {draggingOrder.type === 'tp' ? 'TP' : 'SL'}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .tv-lightweight-charts-attribution { display: none !important; }
            `}</style>
        </div>
    );
}
