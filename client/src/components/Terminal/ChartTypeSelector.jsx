import React, { useState, useRef, useEffect } from 'react';
import {
    CandlestickChart, BarChart3, TrendingUp, Activity,
    LineChart as LineChartIcon, Waves
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
        <div className="relative z-50" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-[#1a1e2e] hover:bg-[#2a2e3e] border border-white/5 hover:border-white/10 rounded-xl transition-all shadow-inner"
            >
                <Icon className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] uppercase font-black tracking-widest text-gray-300 hidden xl:block">{currentChartType.label}</span>
                <svg
                    className={`w-3 h-3 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className="absolute top-full right-0 mt-2 w-56 bg-[#1a1e2e] border border-white/10 rounded-xl shadow-2xl z-[100] py-2 animate-in fade-in zoom-in-95 duration-200"
                >
                    <div className="px-4 py-2 text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 border-b border-white/5 mx-2 pb-2">Visualization Mode</div>
                    {CHART_TYPES.map((type) => {
                        const TypeIcon = type.icon;
                        const isActive = type.id === currentType;

                        return (
                            <button
                                key={type.id}
                                onClick={() => handleSelect(type.id)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all relative
                           ${isActive
                                        ? 'bg-blue-500/10 text-blue-400'
                                        : 'hover:bg-[#2a2e3e] text-gray-400 hover:text-white'
                                    }`}
                            >
                                <TypeIcon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-gray-500'}`} />
                                <span className="text-[11px] font-bold uppercase tracking-tight">{type.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(41,98,255,0.8)]"></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

