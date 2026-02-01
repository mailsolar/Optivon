import React, { useState } from 'react';
import Watchlist from './RightPanel/Watchlist';
import Positions from './RightPanel/Positions';
import OptionChain from '../OptionChain';
import Orders from './RightPanel/Orders';

export default function TerminalSidebar({ quotes, positions, account, onClosePosition }) {
    const [activeTab, setActiveTab] = useState('positions');

    const tabs = [
        { id: 'watchlist', label: 'WATCH' },
        { id: 'positions', label: `POS (${positions?.length || 0})` },
        { id: 'orders', label: 'ORDERS' },
        { id: 'chain', label: 'CHAIN' }
    ];

    return (
        <div className="w-80 bg-surface border-l border-border flex flex-col h-full shrink-0">
            {/* Tabs */}
            <div className="flex border-b border-border bg-surface">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-4 text-[10px] font-black tracking-widest transition-all uppercase relative ${activeTab === tab.id
                            ? 'text-brand-dark bg-accent'
                            : 'text-secondary hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden relative bg-background/50">
                {activeTab === 'watchlist' && (
                    <Watchlist quotes={quotes} />
                )}
                {activeTab === 'positions' && (
                    <Positions positions={positions} quotes={quotes} onClosePosition={onClosePosition} />
                )}
                {activeTab === 'orders' && (
                    <Orders accountId={account?.id} />
                )}
                {activeTab === 'chain' && (
                    <OptionChain />
                )}
            </div>
        </div>
    );
}
