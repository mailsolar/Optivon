import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Zap, Scroll, ShieldCheck, Trophy, Sparkles } from 'lucide-react';

export const MODELS = [
    { id: 'standard', label: 'Optivon Challenge', icon: ShieldCheck, desc: 'Prove your skills. Get funded.' },
];

export const SIZES = [
    { id: '5L', label: '₹5L', value: 500000, price: 3000 },
    { id: '10L', label: '₹10L', value: 1000000, price: 5000 },
    { id: '20L', label: '₹20L', value: 2000000, price: 12000 },
    { id: '50L', label: '₹50L', value: 5000000, price: 22000 },
];

// Data Configuration
export const DATA = {
    'standard': {
        target: '8%',
        minDays: '5 Days',
        dailyDrawdown: '2%',
        maxDrawdown: '3%',
        leverage: '1:1', // As per lot size restriction
        maxLots: '1 Lot', // User specified
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
    // e.g. 8% of 5L = 40k
    const calculateValue = (percentageStr) => {
        const pct = parseInt(percentageStr) / 100;
        return `₹${(activeSize.value * pct).toLocaleString()}`;
    };

    return (
        <div className="max-w-[1400px] mx-auto">

            {/* 1. Model Selection (Single Header for now) */}
            <div className="flex justify-center mb-12">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-1 inline-flex">
                    {MODELS.map((model) => (
                        <button
                            key={model.id}
                            onClick={() => setSelectedModel(model.id)}
                            className={`flex items-center gap-3 px-8 py-3 rounded-xl transition-all ${selectedModel === model.id
                                ? 'bg-brand-lime text-brand-dark font-bold shadow-[0_0_20px_rgba(204,255,0,0.3)]'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <model.icon size={20} />
                            <span className="uppercase tracking-wider text-sm">{model.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Account Size Selection (Bar) */}
            <div className="mb-12">
                <div className="flex justify-between items-end mb-4 px-2">
                    <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Select Capital</span>
                    <span className="text-brand-lime font-bold font-display text-xl">{activeSize.label}</span>
                </div>
                <div className="bg-[#0f0f1a] p-2 rounded-xl flex flex-wrap gap-2 border border-white/10 relative">
                    {SIZES.map((size) => (
                        <button
                            key={size.id}
                            onClick={() => setSelectedSizeId(size.id)}
                            className={`flex-1 min-w-[100px] py-4 rounded-lg font-bold text-sm tracking-widest uppercase transition-all relative z-10 ${selectedSizeId === size.id ? 'text-brand-dark' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {/* Mobile line break prevention */}
                            <span className="whitespace-nowrap">{size.label}</span>
                            {selectedSizeId === size.id && (
                                <motion.div
                                    layoutId="sizePill"
                                    className="absolute inset-0 bg-brand-lime rounded-lg -z-10 shadow-[0_0_20px_rgba(204,255,0,0.4)]"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. Details Visualizer (The "Spec Sheet") */}
            <div className="relative bg-[#1F1F35] rounded-[40px] border border-white/10 overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-lime/5 rounded-full blur-[120px] pointer-events-none -mr-20 -mt-20" />

                <div className="grid grid-cols-1 lg:grid-cols-3">

                    {/* Left: Specs Grid */}
                    <div className="lg:col-span-2 p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 relative z-10">
                        <SpecItem
                            label="Profit Target"
                            value={activeData.target}
                            subValue={calculateValue(activeData.target)}
                        />
                        <SpecItem
                            label="Max Daily Loss"
                            value={activeData.dailyDrawdown}
                            subValue={calculateValue(activeData.dailyDrawdown)}
                            highlight
                        />
                        <SpecItem
                            label="Max Total Loss"
                            value={activeData.maxDrawdown}
                            subValue={calculateValue(activeData.maxDrawdown)}
                            highlight
                        />
                        <SpecItem label="Profit Split" value={activeData.profitSplit} />
                        <SpecItem label="Max Lot Size" value={activeData.maxLots} highlight />
                        <SpecItem label="Min Trading Days" value={activeData.minDays} />

                        <div className="md:col-span-2 mt-4 pt-8 border-t border-white/5 flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                            {['Refundable Fee', 'No Time Limit', 'News Trading Allowed', 'EAs Enabled'].map((tag, i) => (
                                <div key={i} className="flex items-center gap-2 whitespace-nowrap bg-white/5 px-4 py-2 rounded-full border border-white/5 text-xs font-mono text-gray-400">
                                    <Sparkles size={12} className="text-brand-lime" />
                                    {tag}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Price & CTA (Glass Panel) */}
                    <div className="lg:col-span-1 bg-black/20 backdrop-blur-md border-l border-white/5 p-8 md:p-12 flex flex-col justify-between relative">
                        <div>
                            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">One-Time Fee</div>
                            <div className="text-5xl font-black text-white tracking-tight mb-2">
                                <span className="text-2xl text-gray-500 align-top mr-1">₹</span>
                                {activeSize.price.toLocaleString()}
                            </div>
                            <p className="text-xs text-brand-lime/80 font-mono">100% Refundable with first payout.</p>
                        </div>

                        <div className="mt-12 space-y-4">
                            <button
                                onClick={handleSelect}
                                className="w-full py-5 bg-brand-lime text-brand-dark rounded-xl font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(204,255,0,0.3)] flex items-center justify-center gap-3 group"
                            >
                                Select Challenge <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <p className="text-[10px] text-center text-gray-600 font-mono uppercase tracking-widest">
                                Instant Credentials Delivery
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
            key={label + value} // Re-animate on change
            className="flex flex-col gap-1"
        >
            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">{label}</span>
            <div className="flex items-baseline gap-2">
                <span className={`text-2xl md:text-3xl font-bold ${highlight ? 'text-brand-lime' : 'text-white'}`}>{value}</span>
                {subValue && <span className="text-sm text-gray-400 font-mono">({subValue})</span>}
            </div>
        </motion.div>
    );
}
