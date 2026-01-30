
import React, { useState } from 'react';
import Watchlist from './RightPanel/Watchlist';
import Positions from './RightPanel/Positions';
import OptionChain from '../OptionChain';
import Orders from './RightPanel/Orders';

export default function TerminalSidebar({ quotes, positions, account, onClosePosition }) {
    const [activeTab, setActiveTab] = useState('positions');

    return (
        <div className="w-80 bg-[#1e1e24] border-l border-white/5 flex flex-col h-full">
            {/* Tabs */}
            <div className="flex border-b border-white/5 text-xs font-bold text-gray-400">
                <button
                    onClick={() => setActiveTab('watchlist')}
                    className={`flex-1 py-3 hover:text-white transition-colors ${activeTab === 'watchlist' ? 'text-cyber-cyan border-b-2 border-cyber-cyan bg-white/5' : ''}`}
                >
                    WATCH
                </button>
                <button
                    onClick={() => setActiveTab('positions')}
                    className={`flex-1 py-3 hover:text-white transition-colors ${activeTab === 'positions' ? 'text-cyber-cyan border-b-2 border-cyber-cyan bg-white/5' : ''}`}
                >
                    POS ({positions?.length || 0})
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`flex-1 py-3 hover:text-white transition-colors ${activeTab === 'orders' ? 'text-cyber-cyan border-b-2 border-cyber-cyan bg-white/5' : ''}`}
                >
                    ORDERS
                </button>
                <button
                    onClick={() => setActiveTab('chain')}
                    className={`flex-1 py-3 hover:text-white transition-colors ${activeTab === 'chain' ? 'text-cyber-cyan border-b-2 border-cyber-cyan bg-white/5' : ''}`}
                >
                    CHAIN
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden relative">
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
