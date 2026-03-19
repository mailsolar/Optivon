import React from 'react';
import { motion } from 'framer-motion';

export default function TabSwitcher({ tabs, activeTab, onTabChange }) {
    return (
        <div className="flex items-center gap-1.5 bg-surface p-1.5 rounded-instrument border border-white/5 backdrop-blur-md w-fit shadow-2xl">
            {tabs.map((tab) => {
                const isActive = activeTab === tab;
                return (
                    <button
                        key={tab}
                        onClick={() => onTabChange(tab)}
                        className={`
                            relative px-8 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 z-10 rounded-instrument
                            ${isActive ? 'text-background' : 'text-muted hover:text-primary'}
                        `}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeTabIndicator"
                                className="absolute inset-0 bg-accent rounded-instrument shadow-soft"
                                initial={false}
                                transition={{ type: "spring", stiffness: 400, damping: 35 }}
                            />
                        )}
                        <span className="relative z-20">{tab}</span>
                    </button>
                );
            })}
        </div>
    );
}
