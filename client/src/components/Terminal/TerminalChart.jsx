import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';
import { formatChartTime } from '../../utils/timezone';
import DrawingCanvas from './DrawingCanvas';
import { useTheme } from '../../context/ThemeContext';

// Helper to render different chart types
const renderChartType = (chart, type, data, candlestickSeriesRef) => {
    // console.log("Rendering Chart:", type, "Data Points:", data?.length);
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
                        if (!d) return false;
                        // Support capitalization variants
                        const o = d.open ?? d.Open;
                        const h = d.high ?? d.High;
                        const l = d.low ?? d.Low;
                        const c = d.close ?? d.Close;
                        return o !== undefined && !isNaN(parseFloat(o)) &&
                            h !== undefined && !isNaN(parseFloat(h)) &&
                            l !== undefined && !isNaN(parseFloat(l)) &&
                            c !== undefined && !isNaN(parseFloat(c));
                    })
                    .map(d => {
                        // Intelligent time conversion (Detect ms vs seconds)
                        // If time > 10000000000 (year 2286), it's likely MS
                        let t = d.time ?? d.Time;
                        // Handle ISO strings if passed
                        if (typeof t === 'string' && isNaN(t)) {
                            t = new Date(t).getTime() / 1000;
                        } else if (typeof t === 'number' && t > 10000000000) {
                            t = t / 1000;
                        }

                        return {
                            time: t,
                            open: parseFloat(d.open ?? d.Open),
                            high: parseFloat(d.high ?? d.High),
                            low: parseFloat(d.low ?? d.Low),
                            close: parseFloat(d.close ?? d.Close)
                        };
                    })
                    .sort((a, b) => a.time - b.time); // Ensure sorted order for library safety
            }
        }

        if (formattedData.length > 0) {
            series.setData(formattedData);
            chart.timeScale().fitContent();
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
    const { theme } = useTheme();

    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Theme Configuration
        const isDark = theme === 'dark';
        const bgColor = isDark ? '#0a0e27' : '#ffffff';
        const textColor = isDark ? '#9CA3AF' : '#111827';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
        const crosshairColor = isDark ? '#2962FF' : '#2563eb';

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
            layout: {
                background: { type: ColorType.Solid, color: bgColor },
                textColor: textColor,
                fontFamily: 'Inter, -apple-system, sans-serif',
            },
            grid: {
                vertLines: { color: gridColor },
                horzLines: { color: gridColor },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: {
                    color: crosshairColor,
                    width: 1,
                    style: 3,
                    labelBackgroundColor: crosshairColor,
                },
                horzLine: {
                    color: crosshairColor,
                    width: 1,
                    style: 3,
                    labelBackgroundColor: crosshairColor,
                },
            },
            rightPriceScale: {
                borderColor: gridColor,
                visible: true,
            },
            timeScale: {
                borderColor: gridColor,
                timeVisible: true,
                secondsVisible: false,
                tickMarkFormatter: (time) => formatChartTime(time),
            },
            handleScroll: { vertTouchDrag: activeTool === 'cursor' },
        });

        chartRef.current = chart;

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight,
                });
            }
        };

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(chartContainerRef.current);

        // Render initial chart type
        // Note: dataRef.current is not defined in the original code, assuming 'data' prop should be used.
        const series = renderChartType(chart, chartType, data || [], candlestickSeriesRef);

        if (onChartReady) {
            onChartReady(chart, series);
        }
        setIsChartReady(true);

        return () => {
            resizeObserver.disconnect();
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
        };
    }, [theme]); // Dependencies for chart creation and theme changes

    // Effect for updating chart type, data, and activeTool
    useEffect(() => {
        if (chartRef.current) {
            // Apply theme options if theme changes after initial render
            const isDark = theme === 'dark';
            const bgColor = isDark ? '#0a0e27' : '#ffffff';
            const textColor = isDark ? '#9CA3AF' : '#111827';
            const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
            const crosshairColor = isDark ? '#2962FF' : '#2563eb';

            chartRef.current.applyOptions({
                layout: {
                    background: { type: ColorType.Solid, color: bgColor },
                    textColor: textColor,
                },
                grid: {
                    vertLines: { color: gridColor },
                    horzLines: { color: gridColor },
                },
                crosshair: {
                    vertLine: { color: crosshairColor, labelBackgroundColor: crosshairColor },
                    horzLine: { color: crosshairColor, labelBackgroundColor: crosshairColor },
                },
                rightPriceScale: { borderColor: gridColor },
                timeScale: { borderColor: gridColor },
            });

            renderChartType(chartRef.current, chartType, data || [], candlestickSeriesRef);
            // Also update drag behavior
            chartRef.current.applyOptions({
                handleScroll: { vertTouchDrag: activeTool === 'cursor', pressedMouseMove: activeTool === 'cursor' }
            });
        }
    }, [chartType, data, activeTool, theme]); // Dependencies for chart updates

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
            {/* Header Legend */}
            <div className="absolute top-5 left-5 pointer-events-none flex flex-col gap-1.5 z-10">
                <div className="flex items-center gap-3">
                    <span className="text-primary font-black text-sm tracking-tighter uppercase">{symbol}</span>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                        <span className="text-[9px] text-accent font-black uppercase tracking-widest opacity-80">Live Node Active</span>
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
                <h1 className="text-9xl font-black italic text-primary tracking-tighter leading-none">OPTIVON</h1>
            </div>
        </div>
    );
}
