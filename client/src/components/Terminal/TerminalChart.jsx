import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import { formatChartTime } from '../../utils/timezone';
import DrawingCanvas from './DrawingCanvas';

// Helper to render different chart types
const renderChartType = (chart, type, data, candlestickSeriesRef) => {
    try {
        // Remove existing series
        try {
            if (candlestickSeriesRef.current) {
                chart.removeSeries(candlestickSeriesRef.current);
                candlestickSeriesRef.current = null;
            }
        } catch (e) {
            candlestickSeriesRef.current = null;
        }

        let series;
        const upColor = '#00C853';
        const downColor = '#FF1744';

        switch (type) {
            case 'candlestick':
                series = chart.addCandlestickSeries({
                    upColor, downColor,
                    borderUpColor: upColor, borderDownColor: downColor,
                    wickUpColor: upColor, wickDownColor: downColor,
                });
                break;
            case 'bars':
                series = chart.addBarSeries({
                    upColor, downColor,
                    openVisible: true, thinBars: false,
                });
                break;
            case 'hollow-candles':
                series = chart.addCandlestickSeries({
                    upColor: 'transparent', downColor,
                    borderUpColor: upColor, borderDownColor: downColor,
                    wickUpColor: upColor, wickDownColor: downColor,
                });
                break;
            case 'hlc':
                series = chart.addBarSeries({
                    upColor, downColor,
                    openVisible: false, thinBars: true,
                });
                break;
            case 'line':
                series = chart.addLineSeries({ color: '#2962FF', lineWidth: 2 });
                break;
            case 'line-markers':
                series = chart.addLineSeries({ color: '#2962FF', lineWidth: 2, pointMarkersVisible: true });
                break;
            case 'step':
                series = chart.addLineSeries({ color: '#2962FF', lineWidth: 2, lineType: 2 });
                break;
            case 'area':
                series = chart.addAreaSeries({
                    topColor: 'rgba(41, 98, 255, 0.4)', bottomColor: 'rgba(41, 98, 255, 0.0)',
                    lineColor: '#2962FF', lineWidth: 2,
                });
                break;
            case 'baseline':
                if (data && data.length > 0) {
                    series = chart.addBaselineSeries({
                        topLineColor: upColor, bottomLineColor: downColor,
                        topFillColor1: 'rgba(0, 200, 83, 0.28)', topFillColor2: 'rgba(0, 200, 83, 0.05)',
                        bottomFillColor1: 'rgba(255, 23, 68, 0.05)', bottomFillColor2: 'rgba(255, 23, 68, 0.28)',
                        baseValue: { type: 'price', price: data[0]?.close || data[0]?.value || 0 },
                    });
                } else {
                    series = chart.addBaselineSeries({
                        topLineColor: upColor, bottomLineColor: downColor,
                        baseValue: { type: 'price', price: 0 },
                    });
                }
                break;
            default:
                series = chart.addCandlestickSeries({
                    upColor, downColor,
                    borderUpColor: upColor, borderDownColor: downColor,
                    wickUpColor: upColor, wickDownColor: downColor,
                });
        }


        // Format and Validate data based on series type
        let formattedData = [];

        if (Array.isArray(data)) {
            if (['line', 'line-markers', 'step', 'area', 'baseline'].includes(type)) {
                formattedData = data
                    .filter(d => {
                        if (!d || d.time === undefined) return false;
                        const val = d.close !== undefined ? d.close : d.value;
                        return val !== undefined && !isNaN(parseFloat(val));
                    })
                    .map(d => ({
                        time: d.time,
                        value: parseFloat(d.close !== undefined ? d.close : d.value)
                    }));
            } else {
                // Candlestick / Bar
                formattedData = data
                    .filter(d => {
                        if (!d || d.time === undefined) return false;
                        return d.open !== undefined && !isNaN(parseFloat(d.open)) &&
                            d.high !== undefined && !isNaN(parseFloat(d.high)) &&
                            d.low !== undefined && !isNaN(parseFloat(d.low)) &&
                            d.close !== undefined && !isNaN(parseFloat(d.close));
                    })
                    .map(d => ({
                        time: d.time,
                        open: parseFloat(d.open),
                        high: parseFloat(d.high),
                        low: parseFloat(d.low),
                        close: parseFloat(d.close)
                    }));
            }
        }

        if (formattedData.length > 0) {
            series.setData(formattedData);
        }

        candlestickSeriesRef.current = series;
        return series;

    } catch (e) {
        console.error("CRITICAL CHART ERROR:", e);
        return null;
    }
};

export default function TerminalChart({ symbol, data, onChartReady, chartType = 'candlestick', activeTool }) {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const candlestickSeriesRef = useRef(null);
    const [isChartReady, setIsChartReady] = useState(false);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Resize Handling with ResizeObserver
        const resizeObserver = new ResizeObserver(entries => {
            if (entries.length === 0 || !entries[0].contentRect) return;
            const { width, height } = entries[0].contentRect;

            if (chartRef.current) {
                chartRef.current.applyOptions({ width, height });
            }
        });

        resizeObserver.observe(chartContainerRef.current);

        // Create chart with proper configuration
        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
            layout: {
                backgroundColor: '#0a0e27',
                textColor: '#9CA3AF',
                fontFamily: 'Inter, -apple-system, sans-serif',
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
            },
            crosshair: {
                mode: 1,
                vertLine: {
                    color: '#2962FF',
                    width: 1,
                    style: 3,
                    labelBackgroundColor: '#2962FF',
                },
                horzLine: {
                    color: '#2962FF',
                    width: 1,
                    style: 3,
                    labelBackgroundColor: '#2962FF',
                },
            },
            timeScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
                timeVisible: true,
                secondsVisible: false,
                tickMarkFormatter: (time) => formatChartTime(time),
            },
            rightPriceScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            handleScroll: { vertTouchDrag: activeTool === 'cursor' }, // Allow drag only if cursor
        });

        chartRef.current = chart;

        // Initialize with correct chart type
        const series = renderChartType(chart, chartType, data || [], candlestickSeriesRef);

        if (onChartReady) {
            onChartReady(chart, series);
        }

        setIsChartReady(true);

        return () => {
            resizeObserver.disconnect();
            chart.remove();
        };
    }, []); // Only run once on mount

    // Update data or chart type when they change
    useEffect(() => {
        if (chartRef.current) {
            renderChartType(chartRef.current, chartType, data || [], candlestickSeriesRef);
            // Also update drag behavior
            chartRef.current.applyOptions({
                handleScroll: { vertTouchDrag: activeTool === 'cursor', pressedMouseMove: activeTool === 'cursor' }
            });
        }
    }, [chartType, data, activeTool]);

    return (
        <div
            ref={chartContainerRef}
            className="w-full h-full relative"
            style={{
                width: '100%',
                height: '100%',
                minHeight: '400px',
            }}
        >
            {/* Header Legend */}
            <div className="absolute top-5 left-5 pointer-events-none flex flex-col gap-1.5 z-10">
                <div className="flex items-center gap-3">
                    <span className="text-white font-black text-sm tracking-tighter uppercase">{symbol}</span>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[9px] text-emerald-400/80 font-black uppercase tracking-widest">Live Node Active</span>
                    </div>
                </div>
            </div>

            {/* Drawing Layer */}
            {isChartReady && chartRef.current && candlestickSeriesRef.current && (
                <DrawingCanvas
                    chart={chartRef.current}
                    series={candlestickSeriesRef.current}
                    activeTool={activeTool}
                />
            )}

            {/* Subtle Watermark */}
            <div className="absolute bottom-16 right-8 pointer-events-none opacity-[0.04] select-none">
                <h1 className="text-9xl font-black italic text-white tracking-tighter leading-none">OPTIVON</h1>
            </div>
        </div>
    );
}
