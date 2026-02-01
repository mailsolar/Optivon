import React from 'react';
import {
    MousePointer2,
    Type,
    Ruler,
    Move,
    Slash,
    Square,
    Circle,
    Eraser,
    Triangle,
    Minus,
    Bell,
    Layers,
    Maximize2,
    Crosshair
} from 'lucide-react';

export default function ChartToolbar({ activeTool, setActiveTool, onOpenAlerts }) {
    const drawingTools = [
        { id: 'cursor', icon: MousePointer2, label: 'Selection Tool' },
        { id: 'crosshair', icon: Crosshair, label: 'Crosshair' },
        { id: 'line', icon: Slash, label: 'Trend Line' },
        { id: 'horizontal', icon: Minus, label: 'Horizontal Line' },
        { id: 'rectangle', icon: Square, label: 'Rectangle' },
        { id: 'circle', icon: Circle, label: 'Ellipse' },
        { id: 'triangle', icon: Triangle, label: 'Polyline' },
        { id: 'fib', icon: Layers, label: 'Fibonacci' },
        { id: 'text', icon: Type, label: 'Text Annotation' },
        { id: 'measure', icon: Ruler, label: 'Measure Distance' },
        { id: 'eraser', icon: Eraser, label: 'Eraser' },
    ];

    return (
        <div className="w-12 bg-[#1a1e2e] border-r border-white/5 flex flex-col items-center py-4 shrink-0 z-30 shadow-2xl">
            {/* Top section: Drawing Tools */}
            <div className="flex flex-col gap-2 w-full px-1.5 overflow-y-auto custom-scrollbar no-scrollbar">
                {drawingTools.map((tool) => {
                    const Icon = tool.icon;
                    const isActive = activeTool === tool.id;

                    return (
                        <button
                            key={tool.id}
                            onClick={() => setActiveTool(tool.id)}
                            className={`group relative w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 active:scale-90 ${isActive
                                ? 'bg-accent text-brand-dark shadow-[0_0_10px_rgba(var(--accent-primary),0.3)] translate-x-1'
                                : 'text-secondary hover:text-white hover:bg-white/5'
                                }`}
                            title={tool.label}
                        >
                            <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.5 : 2} />

                            {/* Tooltip */}
                            <div className="absolute left-12 px-2 py-1.5 bg-[#1a1e2e] text-white text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-2xl border border-white/10 z-50 pointer-events-none">
                                {tool.label}
                                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#1a1e2e] rotate-45 border-l border-b border-white/10"></div>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="w-6 h-px bg-white/5 my-4 mx-auto"></div>

            {/* Bottom section: Utilities */}
            <div className="mt-auto flex flex-col gap-2 w-full px-1.5">
                <button
                    onClick={onOpenAlerts}
                    className="group relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-400/5 transition-all"
                    title="Price Alert"
                >
                    <Bell className="w-[18px] h-[18px]" />
                </button>
                <button className="group relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all">
                    <Maximize2 className="w-[18px] h-[18px]" />
                </button>
            </div>
        </div>
    );
}
