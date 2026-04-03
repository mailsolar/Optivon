import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const MODELS = [
    { id: 'standard', label: 'Optivon Challenge', desc: 'Prove your skills. Get funded.' },
];

export const SIZES = [
    { id: '5L', label: '₹5L', value: 500000, price: 3000, maxLots: 3 },
    { id: '10L', label: '₹10L', value: 1000000, price: 5000, maxLots: 5 },
    { id: '20L', label: '₹20L', value: 2000000, price: 12000, maxLots: 8 },
    { id: '50L', label: '₹50L', value: 5000000, price: 22000, maxLots: 12 },
];

export const DATA = {
    'standard': {
        target: '8%',
        minDays: '5 Days',
        dailyDrawdown: '2%',
        maxDrawdown: '3%',
        leverage: '1:1',
        profitSplit: '80/20',
    }
};

export default function ChallengeSelector() {
    const navigate = useNavigate();
    const [selectedModel, setSelectedModel] = useState('standard');
    const [selectedSizeId, setSelectedSizeId] = useState('10L');

    const handleSelect = () => {
        navigate('/checkout', { state: { modelId: selectedModel, sizeId: selectedSizeId } });
    };

    const activeData = DATA[selectedModel];
    const activeSize = SIZES.find(s => s.id === selectedSizeId);

    const calculateValue = (percentageStr) => {
        const pct = parseInt(percentageStr) / 100;
        return `₹${(activeSize.value * pct).toLocaleString()}`;
    };

    return (
        <div className="w-full">
            
            {/* Account Size Selection - Editorial Tabular Format */}
            <div className="border-t border-black/15 flex flex-col md:flex-row">
                <div className="w-full md:w-1/3 py-8 px-6 border-b md:border-b-0 md:border-r border-black/15">
                    <span className="text-caption text-secondary">Capital Size</span>
                </div>
                <div className="w-full md:w-2/3 flex overflow-x-auto hide-scrollbar">
                    {SIZES.map((size) => (
                        <button
                            key={size.id}
                            onClick={() => setSelectedSizeId(size.id)}
                            className={`flex-1 min-w-[120px] py-8 text-center text-caption transition-all duration-500 border-b md:border-b-0 border-black/15 md:border-r last:border-r-0 ${
                                selectedSizeId === size.id ? 'bg-accent text-background' : 'text-primary hover:bg-black/5'
                            }`}
                        >
                            {size.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Details Visualizer - Stark Table format */}
            <div className="border-t border-black/15 border-b">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    
                    {/* Left Specs */}
                    <div className="p-12 md:p-16 border-b md:border-b-0 md:border-r border-black/15 grid grid-cols-1 sm:grid-cols-2 gap-y-16 gap-x-12">
                        <SpecItem label="Phase 1 Target" value={activeData.target} subValue={calculateValue(activeData.target)} />
                        <SpecItem label="Daily Loss Limit" value={activeData.dailyDrawdown} subValue={calculateValue(activeData.dailyDrawdown)} />
                        <SpecItem label="Maximum Breach" value={activeData.maxDrawdown} subValue={calculateValue(activeData.maxDrawdown)} />
                        <SpecItem label="Performance Split" value={activeData.profitSplit} />
                        <SpecItem label="Risk Scaling" value={`${activeSize.maxLots} Lots`} />
                        <SpecItem label="Minimum Period" value={activeData.minDays} />
                        
                        <div className="sm:col-span-2 flex flex-wrap gap-x-8 gap-y-4 pt-8 border-t border-black/15">
                            {['Refundable Capital', 'Infinite Duration', 'News Protocol Active', 'EA Authorized'].map((tag, i) => (
                                <span key={i} className="text-caption text-secondary">{tag}</span>
                            ))}
                        </div>
                    </div>

                    {/* Right Fee */}
                    <div className="p-12 md:p-16 flex flex-col justify-between">
                        <div>
                            <div className="text-caption text-secondary mb-6">Allocation Fee</div>
                            <div className="text-[clamp(4rem,8vw,7rem)] font-display text-primary leading-none tracking-[-0.03em] mb-4">
                                <span className="text-3xl align-top mr-2 font-sans tracking-normal">₹</span>
                                {activeSize.price.toLocaleString()}
                            </div>
                            <p className="text-caption text-secondary">Standard Refund Protocol</p>
                        </div>

                        <div className="mt-16 sm:mt-32">
                            <button
                                onClick={handleSelect}
                                className="w-full py-6 bg-accent text-background text-caption transition-colors duration-500 hover:bg-primary/80"
                            >
                                Initialize Position
                            </button>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
}

function SpecItem({ label, value, subValue }) {
    return (
        <div className="flex flex-col gap-4">
            <span className="text-caption text-secondary">{label}</span>
            <div className="flex items-baseline gap-3">
                <span className="text-4xl md:text-5xl font-display text-primary">{value}</span>
                {subValue && <span className="text-sm font-sans text-secondary">({subValue})</span>}
            </div>
        </div>
    );
}
