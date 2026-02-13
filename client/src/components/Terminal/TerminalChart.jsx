import React, { useEffect, useRef, useState } from 'react';
import {
    createChart,
    ColorType,
    CandlestickSeries,
    AreaSeries,
    LineSeries,
    BarSeries,
    BaselineSeries,
    HistogramSeries
} from 'lightweight-charts';
import './HideTV.css'; // Hide TradingView Logo
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';

export default function TerminalChart({ data, symbol, onChartReady, chartType = 'candlestick' }) {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);
    const { settings } = useSettings();
    const { theme } = useTheme(); // Keep for backward compat or sync? 
    // Actually, settings.theme should override.

    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Cleanup
        if (chartRef.current) {
            chartRef.current.remove();
            chartRef.current = null;
        }

        // Determine Colors from Settings or Theme
        const activeTheme = settings?.theme || (theme === 'dark' ? 'OptiVon Dark' : 'Light');
        const isDark = activeTheme !== 'Light';

        const bgColor = settings?.['chart-bg'] || (isDark ? '#0a0e27' : '#ffffff');
        const textColor = isDark ? '#9CA3AF' : '#111827';
        const gridColor = settings?.['grid-color'] || (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)');

        // 1. Clear Container (Prevent Double Graph)
        chartContainerRef.current.innerHTML = '';

        // 2. Create Chart
        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth || 800,
            height: chartContainerRef.current.clientHeight || 500,
            layout: {
                background: { type: ColorType.Solid, color: bgColor },
                textColor: textColor,
            },
            grid: {
                vertLines: { color: gridColor, visible: settings?.['show-period-sep'] ?? true },
                horzLines: { color: gridColor, visible: true },
            },
            crosshair: {
                mode: 1, // CrosshairMode.Normal
                vertLine: {
                    width: 1,
                    color: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                    style: 3, // LineStyle.Dashed
                    labelBackgroundColor: isDark ? '#4c525e' : '#9ca3af',
                },
                horzLine: {
                    width: 1,
                    color: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                    style: 3,
                    labelBackgroundColor: isDark ? '#4c525e' : '#9ca3af',
                },
            },
            localization: {
                locale: 'en-IN',
                dateFormat: 'dd MMM yyyy',
                timeFormatter: (time) => {
                    const date = new Date(time * 1000);
                    // Force IST (UTC+5:30)
                    return date.toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false,
                    });
                },
            },
            timeScale: {
                borderColor: gridColor,
                timeVisible: true,
                secondsVisible: true, // User wants accurate time
                barSpacing: 6, // Better spacing
                minBarSpacing: 0.5,
                tickMarkFormatter: (time, tickMarkType, locale) => {
                    const date = new Date(time * 1000);
                    return date.toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                    }); // Custom tick formatting
                },
            },
            rightPriceScale: {
                borderColor: gridColor,
                autoScale: true,
                mode: 1, // PriceScaleMode.Normal
            },
            // Attribution Hiding (Attempt via API - works in some versions or ignores)
            // CSS is the primary method, this is backup
        });

        chartRef.current = chart;

        // 2. Add Series using v5 API: addSeries(SeriesClass, options)
        let SeriesClass;
        let options = {
            upColor: settings?.['bull-color'] || '#26a69a',
            downColor: settings?.['bear-color'] || '#ef5350',
            wickUpColor: settings?.['bull-color'] || '#26a69a',
            wickDownColor: settings?.['bear-color'] || '#ef5350',
            borderVisible: false,
        };

        // Select Series Type
        switch (chartType) {
            case 'candlestick':
                SeriesClass = CandlestickSeries;
                break;
            case 'area':
                SeriesClass = AreaSeries;
                options = {
                    topColor: 'rgba(41, 98, 255, 0.4)',
                    bottomColor: 'rgba(41, 98, 255, 0.0)',
                    lineColor: '#2962FF',
                    lineWidth: 2
                };
                break;
            case 'line':
            case 'line-markers': // Fallback to Line
                SeriesClass = LineSeries;
                options = { color: '#2962FF', lineWidth: 2 };
                break;
            case 'bars':
            case 'hlc': // Fallback to Bar
                SeriesClass = BarSeries;
                options = { upColor: '#26a69a', downColor: '#ef5350', thinBars: false };
                break;
            case 'baseline':
                SeriesClass = BaselineSeries;
                options = {
                    topLineColor: '#26a69a',
                    bottomLineColor: '#ef5350',
                    baseValue: { type: 'price', price: data?.[0]?.close || 0 }
                };
                break;
            default:
                SeriesClass = CandlestickSeries;
        }

        try {
            const series = chart.addSeries(SeriesClass, options);
            seriesRef.current = series;

            // 3. Set Data
            if (data && data.length > 0) {
                const validData = data
                    .map(d => {
                        // Normalize data based on type
                        const item = {
                            time: d.time ?? d.Time,
                        };

                        // Value-based series (Line, Area, Baseline) vs OHLC
                        if ([AreaSeries, LineSeries, BaselineSeries, HistogramSeries].includes(SeriesClass)) {
                            item.value = parseFloat(d.close ?? d.Close ?? d.value ?? 0);
                        } else {
                            item.open = parseFloat(d.open ?? d.Open ?? 0);
                            item.high = parseFloat(d.high ?? d.High ?? 0);
                            item.low = parseFloat(d.low ?? d.Low ?? 0);
                            item.close = parseFloat(d.close ?? d.Close ?? 0);
                        }
                        return item;
                    })
                    .filter(d => {
                        // STRICT VALIDATION: Filter out 0 or negative prices to prevent scale collapse
                        if (d.value !== undefined) return d.value > 100;
                        return d.open > 100 && d.close > 100;
                    })
                    .sort((a, b) => a.time - b.time);

                console.log('[TerminalChart] Setting', validData.length, 'candles');
                series.setData(validData);
                chart.timeScale().fitContent();
                console.log('[TerminalChart] fitContent called');
            }

            // 5. Add Volume Series (Histogram) if enabled
            if (settings?.['show-volumes']) {
                const volumeSeries = chart.addSeries(HistogramSeries, {
                    color: '#26a69a',
                    priceFormat: { type: 'volume' },
                    priceScaleId: '', // Overlay on main chart? Or separate pane? Usually separate pane.
                    // But lightweight-charts v4+ handles pane via logic. 
                    // Let's overlay at bottom for simplicity or use 'overlay'.
                    // Actually, let's keep it simple: separate pane logic requires complex layout.
                    // Overlay at bottom using scale margins.
                    priceScaleId: 'volume',
                });

                chart.priceScale('volume').applyOptions({
                    scaleMargins: { top: 0.85, bottom: 0 }, // Push volume to bottom 15%
                    visible: false,
                });

                const volumeData = data.map(d => ({
                    time: d.time ?? d.Time,
                    value: d.volume || (Math.random() * 1000), // Mock volume if missing
                    color: (d.close >= d.open) ? '#26a69a' : '#ef5350'
                }));

                volumeSeries.setData(volumeData);
            }

            // 6. Show Ask Line if enabled
            // Since we only have historical data here, we can't show live Ask.
            // But we can show the "Last Price" line which is default.
            // To simulate Ask Line, we'd need live tick updates passed here.
            // For now, let's just ensure the 'LastPriceAnimation' is on.
            if (settings?.['show-askline']) {
                // Enable Price Line
                series.applyOptions({
                    lastValueVisible: true,
                    priceLineVisible: true,
                });
            } else {
                series.applyOptions({
                    lastValueVisible: false,
                    priceLineVisible: false,
                });
            }

            if (onChartReady) onChartReady(chart, series);

        } catch (e) {
            console.error("TerminalChart v5 Error:", e);
        }

        // 4. Resize Observer
        const handleResize = (entries) => {
            if (!chart || entries.length === 0) return;
            const { width, height } = entries[0].contentRect;
            chart.applyOptions({ width, height });
        };
        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(chartContainerRef.current);

        return () => {
            resizeObserver.disconnect();
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
        };
    }, [data, theme, chartType, settings]); // Re-render on settings change

    return (
        <div
            ref={chartContainerRef}
            className="w-full h-full relative"
            style={{ minHeight: '400px' }}
        />
    );
}

