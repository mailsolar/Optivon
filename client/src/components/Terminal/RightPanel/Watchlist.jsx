
import React from 'react';

export default function Watchlist({ quotes = {}, onSelectSymbol, selectedSymbol, searchTerm = "" }) {
    const allSymbols = [
        'NIFTY', 'BANKNIFTY', 'SENSEX',
        'RELIANCE', 'HDFCBANK', 'INFY', 'TCS', 'ITC', 'SBIN', 'ICICIBANK',
        'BHARTIARTL', 'KOTAKBANK', 'LT', 'AXISBANK', 'HINDUNILVR', 'BAJFINANCE',
        'MARUTI', 'ASIANPAINT', 'TITAN', 'ULTRACEMCO', 'SUNPHARMA', 'TATASTEEL'
    ];

    // Filter symbols based on search term
    const symbols = allSymbols.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="flex flex-col h-full bg-[#1e1e24]">
            {/* Search/Filter within Watchlist (Optional: Keep local search too or rely on header?) 
                User asked for "make the search field working" referencing the header likely, 
                but good to keep local search consistent. 
                Let's hide local search if header search is meant to drive this? 
                Actually, usually header search is global. Let's assume header search filters this list for now.
            */}
            {/* <div className="p-3 border-b border-white/5"> ... removed redundant local input if using global ... actually let's keep it but simplified */}

            <div className="flex-1 overflow-y-auto">
                {symbols.map(sym => {
                    const quote = quotes[sym] || { ltp: 1000 + Math.random() * 100, change: (Math.random() - 0.5) };
                    // Simulation fallback if quote missing
                    const price = quote.ltp || 0;
                    const change = quote.change || 0;
                    const isUp = change >= 0;

                    return (
                        <div
                            key={sym}
                            onClick={() => onSelectSymbol(sym)}
                            className={`p-3 border-b border-white/5 cursor-pointer hover:bg-white/5 flex justify-between items-center group transition-colors ${selectedSymbol === sym ? 'bg-[#2a2a30] border-l-2 border-l-blue-500' : 'border-l-2 border-l-transparent'}`}
                        >
                            <div>
                                <div className="text-sm font-medium text-gray-200 group-hover:text-white">{sym}</div>
                                <div className="text-[10px] text-gray-500">NSE</div>
                            </div>
                            <div className="text-right">
                                <div className={`text-sm font-medium ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                                    {price.toFixed(2)}
                                </div>
                                <div className="text-[10px] text-gray-500">
                                    {isUp ? '+' : ''}{change.toFixed(2)}%
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
