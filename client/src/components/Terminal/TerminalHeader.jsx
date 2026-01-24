
import React from 'react';

export default function TerminalHeader({ quotes = {}, onSearch }) {
    // Indices Tickers
    const indices = [
        { name: 'NIFTY 50', symbol: 'NIFTY', price: quotes['NIFTY']?.ltp || 21500, change: 0.42 },
        { name: 'BANKNIFTY', symbol: 'BANKNIFTY', price: quotes['BANKNIFTY']?.ltp || 46000, change: 0.38 },
        { name: 'SENSEX', symbol: 'SENSEX', price: quotes['SENSEX']?.ltp || 72000, change: 0.45 },
    ];

    return (
        <div className="h-12 bg-[#121212] border-b border-white/5 flex items-center px-4 justify-between font-sans">
            {/* Left: Logo/Title (Groww style usually minimal) */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600"></div>
                    <span className="font-bold text-gray-200">Groww Terminal</span>
                </div>

                {/* Search Bar */}
                <div className="relative ml-4 group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search for Stocks, F&O, Indices etc."
                        className="bg-[#1e1e24] border border-transparent group-hover:border-white/10 text-sm text-white rounded-md pl-10 pr-4 py-1.5 w-64 focus:outline-none focus:border-blue-500 transition-all font-medium"
                    />
                </div>
            </div>

            {/* Right: Indices Tickers */}
            <div className="flex items-center gap-4 text-xs font-medium">
                {indices.map(idx => (
                    <div key={idx.symbol} className="flex flex-col bg-[#1e1e24] px-3 py-1 rounded border border-white/5 min-w-[140px]">
                        <div className="flex justify-between text-gray-400 mb-0.5">
                            <span>{idx.symbol}</span>
                            <span className="text-[10px] uppercase">Expiry</span>
                        </div>
                        <div className="flex gap-2 items-center">
                            <span className="text-white font-bold">{idx.price.toFixed(2)}</span>
                            <span className="text-green-400">{idx.change}%</span>
                        </div>
                    </div>
                ))}

                <div className="px-3 py-2 bg-[#1e1e24] rounded border border-white/5 cursor-pointer hover:bg-white/5 text-gray-400">
                    <span className="text-xs">All Indices ⌄</span>
                </div>
            </div>

            <div className="flex items-center gap-3 ml-4 border-l border-white/10 pl-4">
                <button className="text-gray-400 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg></button>
                <button className="text-gray-400 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg></button>
            </div>
        </div>
    );
}
