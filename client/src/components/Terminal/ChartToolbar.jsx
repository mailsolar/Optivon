import React from 'react';
import {
    MousePointer2,
    Type,
    Ruler,
    Slash,
    Square,
    Circle,
    Eraser,
    Triangle,
    Minus,
    Bell,
    Maximize2,
    Crosshair,
    TrendingUp,
    Layers,
    Activity,
    BarChart2,
} from 'lucide-react';

const DRAWING_TOOLS = [
    { id: 'cursor', icon: MousePointer2, label: 'Select' },
    { id: 'crosshair', icon: Crosshair, label: 'Crosshair' },
    { id: 'line', icon: Slash, label: 'Trend Line' },
    { id: 'horizontal', icon: Minus, label: 'H-Line' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Ellipse' },
    { id: 'triangle', icon: Triangle, label: 'Polyline' },
    { id: 'fib', icon: Layers, label: 'Fibonacci' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'measure', icon: Ruler, label: 'Measure' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
];

const INDICATORS = [
    { id: 'ema20', label: 'EMA 20', icon: TrendingUp, color: '#f59e0b' },
    { id: 'vwap', label: 'VWAP', icon: Activity, color: '#a78bfa' },
    { id: 'rsi', label: 'RSI', icon: BarChart2, color: '#34d399' },
    { id: 'macd', label: 'MACD', icon: BarChart2, color: '#60a5fa' },
];

export default function ChartToolbar({
    activeTool,
    onToolChange,
    activeIndicators = {},
    onIndicatorToggle,
    onOpenAlerts,
}) {
    return (
        <div className="w-12 bg-background border-r border-white/10 flex flex-col items-center py-3 shrink-0 z-30">
            {/* Drawing Tools */}
            <div className="flex flex-col gap-1.5 w-full px-1.5">
                {DRAWING_TOOLS.map(tool => {
                    const Icon = tool.icon;
                    const active = activeTool === tool.id;
                    return (
                        <button
                            key={tool.id}
                            onClick={() => onToolChange && onToolChange(tool.id)}
                            title={tool.label}
                            className={`
                                group relative w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-150 active:scale-90
                                ${active
                                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                    : 'text-gray-600 hover:text-gray-300 hover:bg-white/5'
                                }
                            `}
                        >
                            <Icon className="w-[16px] h-[16px]" strokeWidth={active ? 2.5 : 1.8} />
                            {/* Tooltip */}
                            <span className="
                                absolute left-11 px-2 py-1 bg-surface border border-white/10
                                text-white text-[9px] font-bold uppercase tracking-widest rounded-lg
                                opacity-0 invisible group-hover:opacity-100 group-hover:visible
                                transition-all whitespace-nowrap shadow-xl pointer-events-none z-50
                            ">
                                {tool.label}
                                <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-surface rotate-45 border-l border-b border-white/10" />
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Divider */}
            <div className="w-6 h-px bg-white/[0.05] my-3 mx-auto" />

            {/* Indicator Toggles */}
            <div className="flex flex-col gap-1.5 w-full px-1.5">
                {INDICATORS.map(ind => {
                    const Icon = ind.icon;
                    const active = activeIndicators?.[ind.id];
                    return (
                        <button
                            key={ind.id}
                            onClick={() => onIndicatorToggle && onIndicatorToggle(ind.id)}
                            title={ind.label}
                            className={`
                                group relative w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-150 active:scale-90
                                ${active
                                    ? 'text-white border'
                                    : 'text-gray-600 hover:text-gray-300 hover:bg-white/5 border border-transparent'
                                }
                            `}
                            style={active ? { backgroundColor: ind.color + '22', borderColor: ind.color + '55', color: ind.color } : {}}
                        >
                            <Icon className="w-[15px] h-[15px]" strokeWidth={2} />
                            <span className="
                                absolute left-11 px-2 py-1 bg-surface border border-white/10
                                text-white text-[9px] font-bold uppercase tracking-widest rounded-lg
                                opacity-0 invisible group-hover:opacity-100 group-hover:visible
                                transition-all whitespace-nowrap shadow-xl pointer-events-none z-50
                            ">
                                {ind.label}
                                <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-surface rotate-45 border-l border-b border-white/10" />
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Bottom Utilities */}
            <div className="mt-auto flex flex-col gap-1.5 w-full px-1.5">
                <button
                    onClick={onOpenAlerts}
                    className="group relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all"
                    title="Price Alert"
                >
                    <Bell className="w-[16px] h-[16px]" />
                </button>
                <button className="group relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-all">
                    <Maximize2 className="w-[16px] h-[16px]" />
                </button>
            </div>
        </div>
    );
}
