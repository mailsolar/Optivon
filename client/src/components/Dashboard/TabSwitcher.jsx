import React from 'react';
import { motion } from 'framer-motion';

export default function TabSwitcher({ tabs, activeTab, onTabChange }) {
    return (
        <div className="flex items-center gap-1 bg-[#151525]/50 p-1.5 rounded-xl border border-white/5 backdrop-blur-sm w-fit">
            {tabs.map((tab) => {
                const isActive = activeTab === tab;
                return (
                    <button
                        key={tab}
                        onClick={() => onTabChange(tab)}
                        className={`
                            relative px-6 py-2.5 text-sm font-medium rounded-lg transition-colors duration-300 z-10
                            ${isActive ? 'text-brand-dark font-bold' : 'text-gray-400 hover:text-white'}
                        `}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeTabIndicator"
                                className="absolute inset-0 bg-brand-lime rounded-lg shadow-[0_0_20px_rgba(204,255,0,0.4)]"
                                initial={false}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                style={{ borderRadius: '8px' }}
                            />
                        )}
                        <span className="relative z-20 mix-blend-normal">{tab}</span>
                    </button>
                );
            })}
        </div>
    );
}
