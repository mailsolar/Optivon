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
        <div className="bg-surface border-l border-white/5 h-full flex flex-col font-sans">
            <div className="p-4 border-b border-white/5 bg-background/50 flex justify-between items-center shadow-soft">
                <span className="text-[11px] font-bold text-accent uppercase tracking-[0.3em] font-display">Module Chain</span>
                <span className="text-[10px] font-bold text-muted uppercase tracking-widest font-display">{symbol} EXP: JAN 26</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <table className="w-full text-center border-collapse">
                    <thead className="bg-[#121214] sticky top-0 z-10 text-[10px] text-muted font-bold uppercase tracking-widest border-b border-white/5 font-display">
                        <tr>
                            <th className="p-3">CALLS</th>
                            <th className="p-3 border-x border-white/5 text-white">STRIKE</th>
                            <th className="p-3">PUTS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                        {chain.map((row, i) => (
                            <tr key={row.strike} className="hover:bg-white/[0.02] group relative transition-colors">
                                {/* Call Side */}
                                <td
                                    onClick={() => onOrder(symbol, 'buy', 1, 'call', row.strike)}
                                    className={`p-3 cursor-pointer transition-all ${row.strike < spotPrice ? 'bg-accent/5 text-accent' : 'text-secondary/60'} hover:text-accent hover:bg-accent/10`}
                                >
                                    <div className="flex justify-between px-2">
                                        <span className="font-bold tracking-tight">{row.call.price.toFixed(2)}</span>
                                        <span className="text-[8px] font-bold opacity-30 text-right uppercase tracking-tighter">{(row.call.oi / 1000).toFixed(1)}K OI</span>
                                    </div>
                                </td>

                                {/* Strike */}
                                <td className="p-3 bg-background/30 font-display font-black text-white text-[13px] border-x border-white/5 tracking-tighter">{row.strike}</td>

                                {/* Put Side */}
                                <td
                                    onClick={() => onOrder(symbol, 'buy', 1, 'put', row.strike)}
                                    className={`p-3 cursor-pointer transition-all ${row.strike > spotPrice ? 'bg-white/5 text-secondary' : 'text-secondary/60'} hover:text-accent hover:bg-accent/10`}
                                >
                                    <div className="flex justify-between px-2">
                                        <span className="text-[8px] font-bold opacity-30 text-left uppercase tracking-tighter">{(row.put.oi / 1000).toFixed(1)}K OI</span>
                                        <span className="font-bold tracking-tight">{row.put.price.toFixed(2)}</span>
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
