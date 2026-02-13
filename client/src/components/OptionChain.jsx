
import React, { useState, useEffect } from 'react';

export default function OptionChain({ symbol, spotPrice, onOrder }) {
    // Simulate Chain Data
    const [chain, setChain] = useState([]);

    useEffect(() => {
        if (!spotPrice) return;

        // Generate strikes around spot
        const step = symbol === 'NIFTY' ? 50 : 100;
        const atm = Math.round(spotPrice / step) * step;

        const strikes = [];
        for (let i = -5; i <= 5; i++) {
            strikes.push(atm + (i * step));
        }

        const data = strikes.map(strike => {
            // Simulate pricing
            const dist = (spotPrice - strike) / step; // distance in steps
            // Call Price: Higher if Spot > Strike (ITM)
            let callP = Math.max(0, spotPrice - strike) + 20 + Math.random() * 5;
            if (strike > spotPrice) callP = 200 * Math.exp(-0.01 * (strike - spotPrice)) + Math.random();

            // Put Price: Higher if Strike > Spot (ITM)
            let putP = Math.max(0, strike - spotPrice) + 20 + Math.random() * 5;
            if (strike < spotPrice) putP = 200 * Math.exp(-0.01 * (spotPrice - strike)) + Math.random();

            return {
                strike,
                call: { price: callP, oi: Math.floor(Math.random() * 100000) },
                put: { price: putP, oi: Math.floor(Math.random() * 100000) }
            };
        });
        setChain(data);
    }, [spotPrice, symbol]);

    return (
        <div className="bg-black border-l border-cyber-cyan/20 h-full flex flex-col font-mono text-xs">
            <div className="p-2 border-b border-cyber-cyan/20 bg-cyber-cyan/5 flex justify-between items-center shadow-[0_0_10px_rgba(0,243,255,0.05)]">
                <span className="font-bold text-cyber-cyan">CHAIN</span>
                <span className="text-gray-500">{symbol} EXP: 26 JAN</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <table className="w-full text-center border-collapse">
                    <thead className="bg-[#0a0a12] sticky top-0 z-10 text-[10px] text-gray-500 uppercase border-b border-white/5">
                        <tr>
                            <th className="p-1">Call</th>
                            <th className="p-1">Strike</th>
                            <th className="p-1">Put</th>
                        </tr>
                    </thead>
                    <tbody>
                        {chain.map((row, i) => (
                            <tr key={row.strike} className="hover:bg-white/5 border-b border-white/5 group relative transition-colors">
                                {/* Call Side */}
                                <td
                                    onClick={() => onOrder(symbol, 'buy', 1, 'call', row.strike)}
                                    className={`p-2 cursor-pointer transition-colors ${row.strike < spotPrice ? 'bg-cyber-cyan/10 text-cyber-cyan' : 'text-gray-400'} hover:text-white hover:bg-cyber-cyan/30`}
                                >
                                    <div className="flex justify-between px-1">
                                        <span>{row.call.price.toFixed(2)}</span>
                                        <span className="text-[9px] opacity-40 text-right">{(row.call.oi / 1000).toFixed(1)}k</span>
                                    </div>
                                </td>

                                {/* Strike */}
                                <td className="p-2 bg-black font-bold text-gray-400 border-x border-white/10">{row.strike}</td>

                                {/* Put Side */}
                                <td
                                    onClick={() => onOrder(symbol, 'buy', 1, 'put', row.strike)}
                                    className={`p-2 cursor-pointer transition-colors ${row.strike > spotPrice ? 'bg-cyber-pink/10 text-cyber-pink' : 'text-gray-400'} hover:text-white hover:bg-cyber-pink/30`}
                                >
                                    <div className="flex justify-between px-1">
                                        <span className="text-[9px] opacity-40 text-left">{(row.put.oi / 1000).toFixed(1)}k</span>
                                        <span>{row.put.price.toFixed(2)}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

