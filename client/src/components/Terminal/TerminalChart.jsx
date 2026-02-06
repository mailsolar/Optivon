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
import { useTheme } from '../../context/ThemeContext';

export default function TerminalChart({ data, symbol, onChartReady, chartType = 'candlestick' }) {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);
    const { theme } = useTheme();

    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Cleanup
        if (chartRef.current) {
            chartRef.current.remove();
            chartRef.current = null;
        }

        const isDark = theme === 'dark';
        const bgColor = isDark ? '#0a0e27' : '#ffffff';
        const textColor = isDark ? '#9CA3AF' : '#111827';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

        // 1. Create Chart
        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth || 800,
            height: chartContainerRef.current.clientHeight || 500,
            layout: {
                background: { type: ColorType.Solid, color: bgColor },
                textColor: textColor,
            },
            grid: {
                vertLines: { color: gridColor },
                horzLines: { color: gridColor },
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
            timeScale: {
                borderColor: gridColor,
                timeVisible: true,
                secondsVisible: true, // Show seconds for Hyper Mode
            },
            rightPriceScale: {
                borderColor: gridColor,
                autoScale: true,
                mode: 1, // PriceScaleMode.Normal
            },
        });

        chartRef.current = chart;

        // 2. Add Series using v5 API: addSeries(SeriesClass, options)
        let SeriesClass;
        let options = {
            upColor: '#26a69a',
            downColor: '#ef5350',
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
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

                series.setData(validData);
                chart.timeScale().fitContent();
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
    }, [data, theme, chartType]);

    return (
        <div
            ref={chartContainerRef}
            className="w-full h-full relative"
            style={{ minHeight: '400px' }}
        />
    );
}
