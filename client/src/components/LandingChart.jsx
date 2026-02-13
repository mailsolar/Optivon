import React, { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { useTheme } from '../context/ThemeContext';

const ChartInstance = ({ symbol, color, title, data, forcedTheme }) => {
    const chartContainerRef = useRef(null);
    const { theme: globalTheme } = useTheme();
    const theme = forcedTheme || globalTheme;
    const chartRef = useRef(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Cleanup previous chart if exists (double safety for Strict Mode)
        if (chartRef.current) {
            chartRef.current.remove();
        }

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: theme === 'dark' ? '#9ca3af' : '#4b5563',
            },
            grid: {
                vertLines: { color: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
                horzLines: { color: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
            },
            width: chartContainerRef.current.clientWidth || 300, // Fallback width
            height: 300,
            rightPriceScale: {
                borderVisible: false,
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1,
                },
            },
            timeScale: {
                borderVisible: false,
                secondsVisible: true,
                timeVisible: true,
            },
            crosshair: {
                vertLine: { labelVisible: false },
                horzLine: { labelVisible: false },
            },
            handleScroll: false,
            handleScale: false,
        });

        chartRef.current = chart;

        try {
            const areaSeries = chart.addAreaSeries({
                topColor: color,
                bottomColor: `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.0)`,
                lineColor: color,
                lineWidth: 2,
                crosshairMarkerVisible: false,
            });

            if (data && data.length > 0) {
                // Ensure data is sorted by time just in case
                const sortedData = [...data].sort((a, b) => a.time - b.time);
                areaSeries.setData(sortedData);
            }
            chart.timeScale().fitContent();
        } catch (err) {
            console.error("Error adding series to chart:", err);
        }

        // ResizeObserver implementation
        const handleResize = (entries) => {
            if (entries.length === 0 || !chart) return;
            const newRect = entries[0].contentRect;
            chart.applyOptions({ width: newRect.width, height: newRect.height });
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
    }, [theme, color, data]); // Re-create if essential props change

    return (
        <div className="relative w-full h-[300px] border border-border rounded-xl bg-surface/50 backdrop-blur-sm overflow-hidden group">
            <div className="absolute top-4 left-4 z-10 flex flex-col pointer-events-none">
                <span className="text-xs font-black text-secondary uppercase tracking-wider">{title}</span>
                <span className="text-xl font-mono font-bold text-primary">
                    {data && data.length > 0 ? data[data.length - 1].value.toFixed(2) : '0.00'}
                </span>
            </div>
            <div ref={chartContainerRef} className="w-full h-full opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
    );
};

export default function LandingChart({ forcedTheme }) {
    // Generate simulated data only once
    const niftyData = React.useMemo(() => {
        let data = [];
        let price = 22500;
        let date = new Date();
        date.setHours(9, 15, 0, 0);

        for (let i = 0; i < 100; i++) {
            price = price + (Math.random() - 0.5) * 10;
            data.push({ time: date.getTime() / 1000, value: price });
            date = new Date(date.getTime() + 60000); // Add 1 minute
        }
        return data;
    }, []);

    const bankNiftyData = React.useMemo(() => {
        let data = [];
        let price = 47500;
        let date = new Date();
        date.setHours(9, 15, 0, 0);

        for (let i = 0; i < 100; i++) {
            price = price + (Math.random() - 0.5) * 20;
            data.push({ time: date.getTime() / 1000, value: price });
            date = new Date(date.getTime() + 60000);
        }
        return data;
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-[1400] mx-auto opacity-80 hover:opacity-100 transition-opacity duration-700 h-full">
            <ChartInstance symbol="NIFTY" title="NIFTY 50" color="#22c55e" data={niftyData} forcedTheme={forcedTheme} />
            <ChartInstance symbol="BANKNIFTY" title="BANK NIFTY" color="#3b82f6" data={bankNiftyData} forcedTheme={forcedTheme} />
        </div>
    );
}

