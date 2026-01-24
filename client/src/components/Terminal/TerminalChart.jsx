
import React, { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';

export default function TerminalChart({ symbol, data, onChartReady }) {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);

    const [activeTool, setActiveTool] = useState('cursor');
    const activeToolRef = useRef(activeTool); // Sync with activeTool
    const [drawings, setDrawings] = useState([]);

    // Sync Ref with State
    useEffect(() => { activeToolRef.current = activeTool; }, [activeTool]);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: 'solid', color: '#000000' },
                textColor: '#9ca3af',
            },
            grid: {
                vertLines: { color: '#1f2937' },
                horzLines: { color: '#1f2937' },
            },
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
            rightPriceScale: { borderColor: '#374151' },
            timeScale: { borderColor: '#374151', timeVisible: true },
            crosshair: { mode: 1 }
        });

        const series = chart.addSeries(CandlestickSeries, {
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444',
        });

        chartRef.current = chart;
        seriesRef.current = series;

        if (data && data.length > 0) series.setData(data);

        // Click Handler for Drawings
        chart.subscribeClick((param) => {
            if (!param.point || !series) return;
            const tool = activeToolRef.current;

            if (tool === 'horizontal') {
                const price = series.coordinateToPrice(param.point.y);
                if (price) {
                    const line = series.createPriceLine({
                        price: price,
                        color: '#3b82f6',
                        lineWidth: 2,
                        lineStyle: 2, // Dashed
                        axisLabelVisible: true,
                        title: '',
                    });
                    setDrawings(prev => [...prev, line]);
                }
            }
        });

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth, height: chartContainerRef.current.clientHeight });
            }
        };

        window.addEventListener('resize', handleResize);
        if (onChartReady) onChartReady(chart, series);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []); // Init once

    // Update data when props change
    useEffect(() => {
        if (seriesRef.current && data && data.length > 0) {
            seriesRef.current.setData(data);
        }
    }, [data]);

    return (
        <div className="relative w-full h-full flex flex-col bg-black">
            {/* Chart Toolbar (Top or Left, usually internal) */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
                <div className="bg-[#1f2937] text-gray-300 text-xs px-2 py-1 rounded border border-gray-700 font-bold flex items-center gap-2">
                    <span>{symbol}</span>
                    <span className="text-gray-500 font-normal">5m</span>
                </div>
                {/* Indicators Mock */}
                <button className="bg-[#1f2937] text-gray-300 text-xs px-2 py-1 rounded border border-gray-700 hover:bg-gray-700">
                    fx Indicators
                </button>
            </div>

            {/* Chart Container */}
            <div ref={chartContainerRef} className="flex-1 w-full h-full" />

            {/* Left Drawing Tools Simulator (Absolute position over chart) */}
            <div className="absolute top-12 left-2 z-10 flex flex-col gap-2 bg-[#1f2937] p-1 rounded border border-gray-700 shadow-lg text-gray-400">
                <button
                    onClick={() => setActiveTool('cursor')}
                    className={`w-8 h-8 flex items-center justify-center rounded transition-colors text-xs ${activeTool === 'cursor' ? 'bg-blue-600 text-white' : 'hover:bg-white/10'}`}
                    title="Cursor"
                >
                    ✜
                </button>
                <button
                    onClick={() => setActiveTool('horizontal')}
                    className={`w-8 h-8 flex items-center justify-center rounded transition-colors text-xs ${activeTool === 'horizontal' ? 'bg-blue-600 text-white' : 'hover:bg-white/10'}`}
                    title="Horizontal Line"
                >
                    —
                </button>
                <button
                    onClick={() => {
                        // Clear All
                        if (seriesRef.current && drawings.length > 0) {
                            drawings.forEach(line => seriesRef.current.removePriceLine(line));
                            setDrawings([]);
                        }
                    }}
                    className="w-8 h-8 flex items-center justify-center hover:bg-red-900/50 hover:text-red-400 rounded transition-colors text-xs"
                    title="Clear All"
                >
                    🗑
                </button>
            </div>
        </div>
    );
}
