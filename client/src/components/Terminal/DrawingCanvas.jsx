import React, { useState, useEffect, useRef } from 'react';

export default function DrawingCanvas({ chart, series, activeTool, width, height }) {
    const [drawings, setDrawings] = useState([]);
    const [currentDrawing, setCurrentDrawing] = useState(null);
    const [hoveredDrawing, setHoveredDrawing] = useState(null);

    // We need to re-render SVG when chart scrolls/zooms
    const [version, setVersion] = useState(0);

    useEffect(() => {
        if (!chart) return;

        const handleTimeRangeChange = () => {
            setVersion(v => v + 1);
        };

        chart.timeScale().subscribeVisibleTimeRangeChange(handleTimeRangeChange);
        chart.timeScale().subscribeVisibleLogicalRangeChange(handleTimeRangeChange); // More frequent

        return () => {
            chart.timeScale().unsubscribeVisibleTimeRangeChange(handleTimeRangeChange);
            chart.timeScale().unsubscribeVisibleLogicalRangeChange(handleTimeRangeChange);
        };
    }, [chart]);

    // Mouse Handlers
    const handleMouseDown = (e) => {
        if (activeTool === 'cursor' || !chart || !series) {
            // Check if clicking on existing drawing to select/delete?
            if (activeTool === 'eraser' && hoveredDrawing) {
                setDrawings(d => d.filter(item => item.id !== hoveredDrawing));
            }
            return;
        }

        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Convert to Logical
        const time = chart.timeScale().coordinateToTime(x);
        const price = series.coordinateToPrice(y);

        if (!time || !price) return;

        if (!currentDrawing) {
            // Start Drawing
            const id = Math.random().toString(36).substr(2, 9);
            setCurrentDrawing({
                id,
                type: activeTool,
                p1: { time, price },
                p2: { time, price }, // Initially same point
            });
        } else {
            // Finish Drawing (for 2-point tools)
            setDrawings(prev => [...prev, { ...currentDrawing, p2: { time, price } }]);
            setCurrentDrawing(null);
        }
    };

    const handleMouseMove = (e) => {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (currentDrawing) {
            const time = chart.timeScale().coordinateToTime(x);
            const price = series.coordinateToPrice(y);
            if (time && price) {
                setCurrentDrawing(prev => ({ ...prev, p2: { time, price } }));
            }
        }
    };

    // Helper to get coordinates
    const getCoords = (point) => {
        if (!chart || !series || !point) return null;
        const x = chart.timeScale().timeToCoordinate(point.time);
        const y = series.priceToCoordinate(point.price);
        return { x, y };
    };

    return (
        <svg
            className="absolute inset-0 z-30 pointer-events-auto"
            style={{ width: '100%', height: '100%' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
        >
            {/* Render Finished Drawings */}
            {drawings.map(d => {
                const start = getCoords(d.p1);
                const end = getCoords(d.p2);
                if (!start || !end) return null;

                if (d.type === 'line' || d.type === 'horizontal') {
                    // Force horizontal if horizontal tool
                    const y2 = d.type === 'horizontal' ? start.y : end.y;

                    return (
                        <line
                            key={d.id}
                            x1={start.x} y1={start.y}
                            x2={end.x} y2={y2}
                            stroke="#2962FF"
                            strokeWidth="2"
                            onMouseEnter={() => setHoveredDrawing(d.id)}
                            onMouseLeave={() => setHoveredDrawing(null)}
                            style={{ cursor: activeTool === 'eraser' ? 'not-allowed' : 'pointer' }}
                        />
                    );
                }
                // Add more shapes here (rect, circle, etc)
                return null;
            })}

            {/* Render Current (Active) Drawing */}
            {currentDrawing && (() => {
                const start = getCoords(currentDrawing.p1);
                const end = getCoords(currentDrawing.p2);
                if (!start || !end) return null;

                if (currentDrawing.type === 'line' || currentDrawing.type === 'horizontal') {
                    const y2 = currentDrawing.type === 'horizontal' ? start.y : end.y;
                    return (
                        <line
                            x1={start.x} y1={start.y}
                            x2={end.x} y2={y2}
                            stroke="#2962FF"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                        />
                    );
                }
                return null;
            })()}
        </svg>
    );
}

