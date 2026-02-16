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
    const volumeSeriesRef = useRef(null); // Added
    const { settings } = useSettings();
    const { theme } = useTheme(); // Keep for backward compat or sync? 
    // Actually, settings.theme should override.

    const prevSymbolRef = useRef(null);

    // 1. Chart Initialization & Settings (Runs only when visual settings change)
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

        // Create Chart
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
                mode: 1,
                vertLine: {
                    width: 1,
                    color: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                    style: 3,
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
                secondsVisible: true,
                barSpacing: 6,
                minBarSpacing: 0.5,
                tickMarkFormatter: (time) => {
                    const date = new Date(time * 1000);
                    return date.toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                    });
                },
            },
            rightPriceScale: {
                borderColor: gridColor,
                autoScale: true,
                mode: 1,
            },
        });

        chartRef.current = chart;

        // Add Series
        let SeriesClass;
        let options = {
            upColor: settings?.['bull-color'] || '#26a69a',
            downColor: settings?.['bear-color'] || '#ef5350',
            wickUpColor: settings?.['bull-color'] || '#26a69a',
            wickDownColor: settings?.['bear-color'] || '#ef5350',
            borderVisible: false,
        };

        switch (chartType) {
            case 'candlestick': SeriesClass = CandlestickSeries; break;
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
            case 'line-markers':
                SeriesClass = LineSeries;
                options = { color: '#2962FF', lineWidth: 2 };
                break;
            case 'bars':
            case 'hlc':
                SeriesClass = BarSeries;
                options = { upColor: '#26a69a', downColor: '#ef5350', thinBars: false };
                break;
            case 'baseline':
                SeriesClass = BaselineSeries;
                options = {
                    topLineColor: '#26a69a',
                    bottomLineColor: '#ef5350',
                    baseValue: { type: 'price', price: 0 } // Updated dynamically via data if needed
                };
                break;
            default: SeriesClass = CandlestickSeries;
        }

        const series = chart.addSeries(SeriesClass, options);
        seriesRef.current = series;

        // Volume Series Logic
        if (settings?.['show-volumes']) {
            const volumeSeries = chart.addSeries(HistogramSeries, {
                color: '#26a69a',
                priceFormat: {
                    type: 'volume',
                },
                priceScaleId: '', // Overlay on same scale? Or separate? 
                // Creating a simplified look: separate scale or overlay at bottom.
                // scaleMargins: { top: 0.8, bottom: 0 }
            });
            volumeSeries.priceScale().applyOptions({
                scaleMargins: {
                    top: 0.8, // Highest volume bar will be 20% height from bottom
                    bottom: 0,
                },
            });
            volumeSeriesRef.current = volumeSeries;
        } else {
            volumeSeriesRef.current = null;
        }

        // Volume Series Logic




        // Ask Line Logic
        if (settings?.['show-askline']) {
            series.applyOptions({ lastValueVisible: true, priceLineVisible: true });
        } else {
            series.applyOptions({ lastValueVisible: false, priceLineVisible: false });
        }

        if (onChartReady) onChartReady(chart, series);

        // Resize Hook with Debounce/RAF
        const handleResize = () => {
            if (!chart || !chartContainerRef.current) return;

            requestAnimationFrame(() => {
                if (!chartContainerRef.current) return;
                const { clientWidth, clientHeight } = chartContainerRef.current;

                // Only resize if dimensions are valid and changed (Lightweight charts handles changes internally, 
                // but we check to avoid unnecessary calls if 0)
                if (clientWidth > 0 && clientHeight > 0) {
                    chart.applyOptions({ width: clientWidth, height: clientHeight });
                }
            });
        };

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(chartContainerRef.current);

        return () => {
            resizeObserver.disconnect();
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
                seriesRef.current = null;
                volumeSeriesRef.current = null;
            }
        };
    }, [theme, chartType, settings?.['chart-bg'], settings?.['grid-color'], settings?.['bull-color'], settings?.['bear-color'], settings?.['show-askline'], settings?.['show-period-sep'], settings?.['show-volumes']]);


    // 2. Data Update Logic (Runs when data or symbol changes)
    useEffect(() => {
        if (!seriesRef.current) return;

        // Handle empty data (clear chart)
        if (!data || data.length === 0) {
            seriesRef.current.setData([]);
            return;
        }

        try {
            const validData = data
                .map(d => {
                    const item = { time: d.time ?? d.Time };
                    // Value-based vs OHLC items
                    if (chartType === 'area' || chartType === 'line' || chartType === 'baseline') {
                        item.value = parseFloat(d.close ?? d.Close ?? d.value ?? 0);
                    } else {
                        item.open = parseFloat(d.open ?? d.Open ?? 0);
                        item.high = parseFloat(d.high ?? d.High ?? 0);
                        item.low = parseFloat(d.low ?? d.Low ?? 0);
                        item.close = parseFloat(d.close ?? d.Close ?? 0);
                    }
                    return item;
                })
                .filter(d => (d.value !== undefined ? d.value > 0 : d.open > 0));

            // DEDUPLICATION: Latest timestamp wins
            const uniqueDataMap = new Map();
            validData.forEach(item => uniqueDataMap.set(item.time, item));

            const sortedData = Array.from(uniqueDataMap.values())
                .sort((a, b) => a.time - b.time);

            seriesRef.current.setData(sortedData);

            // Handle Volume if enabled
            if (settings?.['show-volumes'] && volumeSeriesRef.current) {
                const volumeData = validData.map(d => ({
                    time: d.time,
                    value: d.volume || (d.close - d.open) * 100, // Mock volume if missing, or use real
                    color: (d.close >= d.open) ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)'
                }));
                volumeSeriesRef.current.setData(volumeData);
            }

            // AUTO SCROLL LOGIC
            // If auto-scroll is enabled, and we added a new candle (last item is new), scroll to it.
            // However, lightweight-charts handles this by default unless user scrolled back.
            // If settings['auto-scroll'] is TRUE, we force it.
            if (settings?.['auto-scroll']) {
                // We can force reset TimeScale
                // But better to just check if we should scroll
                if (chartRef.current) {
                    chartRef.current.timeScale().scrollToRealTime();
                }
            }

        } catch (e) {
            console.error("TerminalChart Data Error:", e);
        }
    }, [data, symbol, chartType, settings]);

    return (
        <div className="absolute inset-0" ref={chartContainerRef} />
    );
}

