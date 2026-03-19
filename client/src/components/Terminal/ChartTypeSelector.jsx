import React, { useState, useRef, useEffect } from 'react';
import {
    CandlestickChart, BarChart3, TrendingUp, Activity,
    LineChart as LineChartIcon, Waves, ChevronDown
} from 'lucide-react';

const CHART_TYPES = [
    { id: 'candlestick', label: 'Candlesticks', icon: CandlestickChart },
    { id: 'bars', label: 'OHLC Bars', icon: BarChart3 },
    { id: 'hollow-candles', label: 'Hollow Candles', icon: CandlestickChart },
    { id: 'hlc', label: 'HLC Bars', icon: BarChart3 },
    { id: 'line', label: 'Line', icon: TrendingUp },
    { id: 'line-markers', label: 'Line with Markers', icon: Activity },
    { id: 'step', label: 'Step Line', icon: LineChartIcon },
    { id: 'area', label: 'Area', icon: Waves },
    { id: 'baseline', label: 'Baseline', icon: Activity },
];

export default function ChartTypeSelector({ currentType, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const currentChartType = CHART_TYPES.find(t => t.id === currentType) || CHART_TYPES[0];
    const Icon = currentChartType.icon;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (type) => {
        onChange(type);
        setIsOpen(false);
    };

    return (
        <div className="relative z-[100]" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-2.5 bg-surface/30 hover:bg-surface border border-white/10 hover:border-accent/30 rounded-instrument transition-all shadow-sm group"
            >
                <Icon size={16} className="text-accent group-hover:scale-110 transition-transform" />
                <span className="text-[10px] uppercase font-black tracking-[0.2em] text-primary hidden xl:block">{currentChartType.label}</span>
                <ChevronDown size={14} className={`text-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className="absolute top-full right-0 mt-3 w-64 bg-background border border-white/[0.05] rounded-premium shadow-premium z-[200] py-3 animate-in fade-in zoom-in-95 duration-200"
                >
                    <div className="px-6 py-3 text-[9px] font-black text-accent uppercase tracking-[0.4em] mb-2 border-b border-white/[0.03] mx-2 pb-3">Projection Model</div>
                    {CHART_TYPES.map((type) => {
                        const TypeIcon = type.icon;
                        const isActive = type.id === currentType;

                        return (
                            <button
                                key={type.id}
                                onClick={() => handleSelect(type.id)}
                                className={`w-full flex items-center gap-4 px-6 py-3 text-left transition-all relative group
                           ${isActive
                                        ? 'bg-accent/5 text-accent border-l-2 border-accent'
                                        : 'hover:bg-white/[0.02] text-secondary hover:text-primary'
                                    }`}
                            >
                                <TypeIcon size={16} className={`${isActive ? 'text-accent' : 'text-muted group-hover:text-primary'} transition-colors`} />
                                <span className="text-[11px] font-bold uppercase tracking-tight">{type.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_#C50022] animate-pulse"></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
