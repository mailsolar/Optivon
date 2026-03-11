import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';
import { io } from 'socket.io-client';

export default function UpstoxChart({ symbol = 'NIFTY' }) {
    const chartContainerRef = useRef();
    const [chart, setChart] = useState(null);
    const [series, setSeries] = useState(null);
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    // 1. Initialize Chart
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chartInstance = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: '#1a1a1a' },
                textColor: '#d1d5db',
            },
            grid: {
                vertLines: { color: '#333' },
                horzLines: { color: '#333' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 500,
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            }
        });

        const candlestickSeries = chartInstance.addSeries(CandlestickSeries, {
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });

        setChart(chartInstance);
        setSeries(candlestickSeries);

        // Resize handler
        const handleResize = () => {
            chartInstance.applyOptions({ width: chartContainerRef.current.clientWidth });
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chartInstance.remove();
        };
    }, []);

    // 2. Fetch History & Connect Socket
    useEffect(() => {
        if (!series) return;

        // Fetch Intraday History
        const fetchHistory = async () => {
            try {
                // TODO: Replace with real API URL
                const response = await fetch(`/api/upstox/intraday?symbol=${symbol}`);
                const data = await response.json();

                if (Array.isArray(data)) {
                    series.setData(data); // Expects { time, open, high, low, close }
                }
            } catch (err) {
                console.error("Failed to fetch Upstox history", err);
            }
        };

        fetchHistory();

        // Connect Socket
        const newSocket = io(window.location.origin.replace('5173', '5000'), { // Dev hack for port 5000
            path: '/socket.io'
        });

        newSocket.on('connect', () => {
            console.log('Socket Connected');
            setIsConnected(true);
        });

        newSocket.on('stock_update', (tick) => {
            if (tick.symbol !== symbol) return;

            // Update or Add Candle
            // Logic: Update current candle if time matches, else add new
            // Simplified: Lightweight charts 'update' handles tick updates to current candle automatically if time is same
            // Ensure 'time' format matches (seconds unix)

            // Tick data usually is LTP. We need to formulate a candle update.
            // For simplicity, we are receiving ticks. 
            // We need to maintain the "current candle" state if we are building it from ticks.
            // OR, if the backend sends OHLCV updates, we just pass it.
            // Assuming UpstoxService sends simulation text which is just { ltp, time }
            // We'll update the CLOSE price of current candle

            // series.update({ time: tick.time, close: tick.ltp }); // This might flatten open/high/low?
            // Better: Get last candle, update High/Low/Close.
            // Since we don't have last candle easily without tracking, let's assume backend sends FULL CANDLE update or we just update close.

            // For simulation tick: { time, ltp }
            series.update({
                time: Math.floor(tick.time),
                close: tick.ltp,
                open: tick.ltp, // Simplification for tick chart
                high: tick.ltp,
                low: tick.ltp
            });
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };

    }, [series, symbol]);

    return (
        <div className="p-4 bg-gray-900 text-white">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Live Upstox Chart ({symbol})</h2>
                <div className={`px-2 py-1 rounded ${isConnected ? 'bg-green-600' : 'bg-red-600'}`}>
                    {isConnected ? 'Live' : 'Disconnect'}
                </div>
            </div>

            <div ref={chartContainerRef} className="w-full border border-gray-700 rounded-lg shadow-lg" />

            <div className="mt-4">
                <a href="/api/upstox/login" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-semibold">
                    Login with Upstox
                </a>
            </div>
        </div>
    );
}
