
import React, { useState } from 'react';
import Watchlist from './RightPanel/Watchlist';
import Positions from './RightPanel/Positions';
import OptionChain from '../OptionChain'; // Reusing existing component

export default function TerminalSidebar({ quotes = {}, positions = [], selectedSymbol, onSelectSymbol, onOrder, spotPrice, searchTerm = "", onClosePosition }) {
    const [activeTab, setActiveTab] = useState('watchlist');

    // Auto-switch to watchlist when searching
    React.useEffect(() => {
        if (searchTerm) setActiveTab('watchlist');
    }, [searchTerm]);

    const tabs = [
        { id: 'watchlist', icon: 'M4 6h16M4 12h16M4 18h16', label: 'Watchlist' },
        { id: 'positions', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', label: 'Positions' },
        { id: 'orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', label: 'Orders' },
        { id: 'chain', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1', label: 'Chain' }
    ];

    return (
        <div className="flex h-full border-l border-white/5 bg-[#121212]">
            {/* Narrow Bar with Icons */}
            <div className="w-12 bg-[#0e0e0e] flex flex-col items-center py-4 gap-4 border-r border-white/5">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`p-2 rounded-lg transition-all tooltip group relative ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                        title={tab.label}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon}></path>
                        </svg>
                    </button>
                ))}
            </div>

            {/* Panel Content (Collapsible) */}
            <div className="w-80 flex flex-col bg-[#1e1e24] overflow-hidden">
                {/* Header for Panel */}
                <div className="h-10 border-b border-white/5 flex items-center px-4 font-bold text-gray-300 uppercase text-xs tracking-wider">
                    {tabs.find(t => t.id === activeTab)?.label}
                </div>

                <div className="flex-1 overflow-hidden relative">
                    {activeTab === 'watchlist' && (
                        <Watchlist
                            quotes={quotes}
                            selectedSymbol={selectedSymbol}
                            onSelectSymbol={onSelectSymbol}
                            searchTerm={searchTerm}
                        />
                    )}
                    {activeTab === 'positions' && (
                        <Positions positions={positions} quotes={quotes} onClosePosition={onClosePosition} />
                    )}
                    {activeTab === 'orders' && (
                        <div className="p-8 text-center text-gray-500 text-xs">
                            <div className="text-3xl mb-2">📝</div>
                            No open orders
                        </div>
                    )}
                    {activeTab === 'chain' && (
                        <div className="h-full">
                            {/* Make OptionChain fit the panel */}
                            <OptionChain symbol={selectedSymbol} spotPrice={spotPrice} onOrder={onOrder} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
