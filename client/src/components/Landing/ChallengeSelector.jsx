import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Zap, Scroll, ShieldCheck, Trophy, Sparkles } from 'lucide-react';

export const MODELS = [
    { id: 'standard', label: 'Optivon Challenge', icon: ShieldCheck, desc: 'Prove your skills. Get funded.' },
];

export const SIZES = [
    { id: '5L', label: '₹5L', value: 500000, price: 3000, maxLots: 3 },
    { id: '10L', label: '₹10L', value: 1000000, price: 5000, maxLots: 5 },
    { id: '20L', label: '₹20L', value: 2000000, price: 12000, maxLots: 8 },
    { id: '50L', label: '₹50L', value: 5000000, price: 22000, maxLots: 12 },
];

// Data Configuration
export const DATA = {
    'standard': {
        target: '8%',
        minDays: '5 Days',
        dailyDrawdown: '2%',
        maxDrawdown: '3%',
        leverage: '1:1', // As per lot size restriction
        profitSplit: '80/20',
    }
};

export default function ChallengeSelector() {
    const navigate = useNavigate();
    const [selectedModel, setSelectedModel] = useState('standard');
    const [selectedSizeId, setSelectedSizeId] = useState('10L');

    const handleSelect = () => {
        navigate('/checkout', {
            state: {
                modelId: selectedModel,
                sizeId: selectedSizeId
            }
        });
    };

    const activeData = DATA[selectedModel];
    const activeSize = SIZES.find(s => s.id === selectedSizeId);

    // Calculate values based on percentages for display
    const calculateValue = (percentageStr) => {
        const pct = parseInt(percentageStr) / 100;
        return `₹${(activeSize.value * pct).toLocaleString()}`;
    };

    return (
        <div className="max-w-[1400px] mx-auto font-sans">

            {/* 1. Model Selection */}
            <div className="flex justify-center mb-12">
                <div className="bg-surface border border-white/5 rounded-instrument p-1 inline-flex shadow-soft">
                    {MODELS.map((model) => (
                        <button
                            key={model.id}
                            onClick={() => setSelectedModel(model.id)}
                            className={`flex items-center gap-4 px-10 py-3 rounded-instrument transition-all ${selectedModel === model.id
                                ? 'bg-accent text-background font-bold shadow-soft'
                                : 'text-secondary hover:text-primary'
                                }`}
                        >
                            <model.icon size={18} />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{model.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Account Size Selection */}
            <div className="mb-12">
                <div className="flex justify-between items-end mb-6 px-2">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-[0.3em]">Selection / Capital</span>
                    <span className="text-accent font-bold text-2xl tracking-tighter">{activeSize.label}</span>
                </div>
                <div className="bg-background/50 p-2 rounded-instrument flex flex-wrap gap-2 border border-white/5 relative shadow-inner">
                    {SIZES.map((size) => (
                        <button
                            key={size.id}
                            onClick={() => setSelectedSizeId(size.id)}
                            className={`flex-1 min-w-[100px] py-4 rounded-instrument font-bold text-[10px] tracking-[0.2em] uppercase transition-all relative z-10 ${selectedSizeId === size.id ? 'text-background' : 'text-muted hover:text-primary'
                                }`}
                        >
                            <span className="whitespace-nowrap">{size.label}</span>
                            {selectedSizeId === size.id && (
                                <motion.div
                                    layoutId="sizePill"
                                    className="absolute inset-0 bg-accent rounded-instrument -z-10 shadow-soft"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. Details Visualizer */}
            <div className="relative bg-surface rounded-premium border border-white/5 overflow-hidden shadow-2xl">
                {/* Subtle Accent Glow */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none -mr-20 -mt-20" />

                <div className="grid grid-cols-1 lg:grid-cols-3">

                    {/* Left: Specs Grid */}
                    <div className="lg:col-span-2 p-12 grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-16 relative z-10">
                        <SpecItem
                            label="Phase 1 Target"
                            value={activeData.target}
                            subValue={calculateValue(activeData.target)}
                        />
                        <SpecItem
                            label="Daily Loss Limit"
                            value={activeData.dailyDrawdown}
                            subValue={calculateValue(activeData.dailyDrawdown)}
                            highlight
                        />
                        <SpecItem
                            label="Maximum Breach"
                            value={activeData.maxDrawdown}
                            subValue={calculateValue(activeData.maxDrawdown)}
                            highlight
                        />
                        <SpecItem label="Performance Split" value={activeData.profitSplit} />
                        <SpecItem label="Risk Scaling" value={`${activeSize.maxLots} Lots Max`} highlight />
                        <SpecItem label="Minimum Period" value={activeData.minDays} />

                        <div className="md:col-span-2 mt-8 pt-12 border-t border-white/5 flex gap-4 overflow-x-auto pb-4 scrollbar-none">
                            {['Refundable Capital', 'Infinite Duration', 'News Protocol Active', 'EA Authorized'].map((tag, i) => (
                                <div key={i} className="flex items-center gap-3 whitespace-nowrap bg-white/[0.03] px-6 py-3 rounded-full border border-white/5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                                    <Sparkles size={12} className="text-accent" />
                                    {tag}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Fee & Action */}
                    <div className="lg:col-span-1 bg-background/20 backdrop-blur-md border-l border-white/5 p-12 flex flex-col justify-between relative">
                        <div>
                            <div className="text-[12px] font-bold text-white/50 uppercase tracking-[0.3em] mb-4">Master Allocation Fee</div>
                            <div className="text-7xl font-display font-black text-white tracking-tighter mb-4">
                                <span className="text-3xl text-white/50 font-bold align-top mr-1">₹</span>
                                {activeSize.price.toLocaleString()}
                            </div>
                            <p className="text-[11px] text-accent font-bold uppercase tracking-[0.15em] opacity-90">
                                Standard Refund Protocol Enabled
                            </p>
                        </div>

                        <div className="mt-16 space-y-6">
                            <button
                                onClick={handleSelect}
                                className="w-full py-6 bg-white text-black font-bold uppercase tracking-[0.3em] text-[13px] hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-4 group border border-white/10"
                            >
                                Initialize Node 
                                <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                            </button>
                            <p className="text-[10px] text-center text-white/50 font-bold uppercase tracking-[0.4em]">
                                Secured by Optivon Vault
                            </p>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
}

function SpecItem({ label, value, subValue, highlight }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={label + value}
            className="flex flex-col gap-2"
        >
            <span className="text-[11px] font-bold text-white/50 uppercase tracking-[0.3em]">{label}</span>
            <div className="flex items-baseline gap-3">
                <span className={`text-5xl font-display font-black tracking-tighter ${highlight ? 'text-accent' : 'text-white'}`}>{value}</span>
                {subValue && <span className="text-sm text-white/50 font-medium">({subValue})</span>}
            </div>
        </motion.div>
    );
}
