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

        if (chartRef.current) {
            chartRef.current.remove();
        }

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#646466',
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.02)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.02)' },
            },
            width: chartContainerRef.current.clientWidth || 300,
            height: 300,
            rightPriceScale: {
                borderVisible: false,
                scaleMargins: {
                    top: 0.2,
                    bottom: 0.2,
                },
            },
            timeScale: {
                borderVisible: false,
                secondsVisible: false,
            },
            crosshair: {
                vertLine: { labelVisible: false, color: '#C50022' },
                horzLine: { labelVisible: false, color: '#C50022' },
            },
            handleScroll: false,
            handleScale: false,
        });

        chartRef.current = chart;

        try {
            const areaSeries = chart.addAreaSeries({
                topColor: 'rgba(197, 160, 89, 0.2)',
                bottomColor: 'rgba(197, 160, 89, 0.0)',
                lineColor: '#C50022',
                lineWidth: 3,
                crosshairMarkerVisible: true,
            });

            if (data && data.length > 0) {
                const sortedData = [...data].sort((a, b) => a.time - b.time);
                areaSeries.setData(sortedData);
            }
            chart.timeScale().fitContent();
        } catch (err) {
            console.error("Error adding series to chart:", err);
        }

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
    }, [theme, color, data]);

    return (
        <div className="relative w-full h-[320px] border border-white/5 rounded-premium bg-surface shadow-2xl overflow-hidden group">
            <div className="absolute top-6 left-8 z-10 flex flex-col pointer-events-none">
                <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] mb-1">{title}</span>
                <span className="text-2xl font-bold text-primary tracking-tighter">
                    {data && data.length > 0 ? data[data.length - 1].value.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
                </span>
            </div>
            <div ref={chartContainerRef} className="w-full h-full opacity-40 group-hover:opacity-100 transition-opacity duration-700" />
        </div>
    );
};

export default function LandingChart({ forcedTheme }) {
    const niftyData = React.useMemo(() => {
        let data = [];
        let price = 22500;
        let date = new Date();
        date.setHours(9, 15, 0, 0);

        for (let i = 0; i < 100; i++) {
            price = price + (Math.random() - 0.5) * 15;
            data.push({ time: date.getTime() / 1000, value: price });
            date = new Date(date.getTime() + 60000);
        }
        return data;
    }, []);

    const bankNiftyData = React.useMemo(() => {
        let data = [];
        let price = 47500;
        let date = new Date();
        date.setHours(9, 15, 0, 0);

        for (let i = 0; i < 100; i++) {
            price = price + (Math.random() - 0.5) * 25;
            data.push({ time: date.getTime() / 1000, value: price });
            date = new Date(date.getTime() + 60000);
        }
        return data;
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-[1400px] mx-auto opacity-90 hover:opacity-100 transition-all duration-700">
            <ChartInstance symbol="PROTOCOL_ALPHA" title="Alpha Index SYNC" color="#C50022" data={niftyData} forcedTheme={forcedTheme} />
            <ChartInstance symbol="PROTOCOL_BETA" title="Beta Cluster SYNC" color="#A6A6A6" data={bankNiftyData} forcedTheme={forcedTheme} />
        </div>
    );
}
