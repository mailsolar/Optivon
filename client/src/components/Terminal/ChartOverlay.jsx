import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, TrendingUp, TrendingDown, Target, ShieldAlert } from 'lucide-react';

// ─── Utils ────────────────────────────────────────────────────────────────────
const IST_OFFSET = 5.5 * 60 * 60 * 1000;

function formatPrice(price) {
    if (!price && price !== 0) return '—';
    return parseFloat(price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatTimeIST(unixSec) {
    if (!unixSec) return '—';
    const d = new Date(unixSec * 1000 + IST_OFFSET);
    const hh = d.getUTCHours().toString().padStart(2, '0');
    const mm = d.getUTCMinutes().toString().padStart(2, '0');
    const DD = d.getUTCDate().toString().padStart(2, '0');
    const MM = (d.getUTCMonth() + 1).toString().padStart(2, '0');
    return `${DD}/${MM} ${hh}:${mm} IST`;
}

const LOT_SIZE = { NIFTY: 75, BANKNIFTY: 15, SENSEX: 10 };

function getLotSize(symbol) {
    return LOT_SIZE[symbol?.toUpperCase()] || 1;
}

// ─── Crosshair Tooltip ────────────────────────────────────────────────────────
// ─── Crosshair Tooltip (Institutional Style) ──────────────────────────────────
function CrosshairTooltip({ chartInstance, containerRef }) {
    const [tooltip, setTooltip] = useState(null);

    useEffect(() => {
        if (!chartInstance) return;

        const handler = (param) => {
            if (!param || !param.point || !param.time) {
                setTooltip(null);
                return;
            }

            // Get OHLC from series data
            const firstSeries = param.seriesData?.keys()?.next()?.value;
            if (!firstSeries) return;
            const data = param.seriesData.get(firstSeries);
            if (!data) return;

            setTooltip({
                x: param.point.x,
                y: param.point.y,
                time: param.time,
                ohlc: {
                    o: data.open ?? data.value,
                    h: data.high ?? data.value,
                    l: data.low ?? data.value,
                    c: data.close ?? data.value,
                }
            });
        };

        chartInstance.subscribeCrosshairMove(handler);
        return () => chartInstance.unsubscribeCrosshairMove(handler);
    }, [chartInstance]);

    if (!tooltip || !containerRef.current) return null;

    const { x, y, ohlc } = tooltip;
    const containerWidth = containerRef.current.clientWidth;

    // Tooltip positioning
    const toolWidth = 140;
    const left = x + toolWidth + 20 > containerWidth ? x - toolWidth - 10 : x + 20;

    return (
        <div
            className="pointer-events-none absolute z-50 bg-[#12162a]/90 backdrop-blur-md border border-white/10 rounded-lg p-3 shadow-2xl flex flex-col gap-1.5 transition-all duration-75"
            style={{ left, top: y - 40 }}
        >
            <div className="flex items-center justify-between gap-4">
                <span className="text-[9px] font-black text-gray-500 uppercase">TIME</span>
                <span className="text-[10px] font-mono font-bold text-white">{formatTimeIST(tooltip.time)}</span>
            </div>
            <div className="h-px bg-white/5 my-0.5" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {[
                    { l: 'O', v: ohlc.o, c: 'text-white' },
                    { l: 'H', v: ohlc.h, c: 'text-emerald-400' },
                    { l: 'L', v: ohlc.l, c: 'text-red-400' },
                    { l: 'C', v: ohlc.c, c: ohlc.c >= ohlc.o ? 'text-emerald-400' : 'text-red-400' }
                ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-black text-gray-600">{item.l}</span>
                        <span className={`text-[10px] font-mono font-bold ${item.c}`}>{item.v?.toFixed(2)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Trade Setup Box ─────────────────────────────────────────────────────────
// ─── Trade Setup Box (Institutional / Kite Style) ────────────────────────────
function TradeBox({ entryPrice, symbol, ltp, onOrder, onClose }) {
    const lotSize = getLotSize(symbol);
    const [sl, setSl] = useState(() => parseFloat((entryPrice * 0.994).toFixed(2)));
    const [tp, setTp] = useState(() => parseFloat((entryPrice * 1.008).toFixed(2)));
    const [lots, setLots] = useState(1);
    const [side, setSide] = useState('buy');

    const entry = parseFloat(entryPrice) || parseFloat(ltp) || 0;
    const slVal = parseFloat(sl) || 0;
    const tpVal = parseFloat(tp) || 0;

    // Risk/Reward logic
    const risk = side === 'buy' ? entry - slVal : slVal - entry;
    const reward = side === 'buy' ? tpVal - entry : entry - tpVal;
    const rr = risk > 0 ? (reward / risk).toFixed(2) : '—';
    const riskRs = (risk * lots * lotSize).toFixed(0);
    const rewardRs = (reward * lots * lotSize).toFixed(0);

    const handleOrder = useCallback(() => {
        if (!onOrder) return;
        onOrder(symbol, side, lots, 'market', entry, null, slVal || null, tpVal || null);
        onClose();
    }, [onOrder, symbol, side, lots, entry, slVal, tpVal, onClose]);

    return (
        <div className="absolute right-[80px] top-1/2 -translate-y-1/2 z-[60] w-[240px] bg-[#0a0e1a] border border-white/10 rounded shadow-2xl overflow-hidden flex flex-col font-sans">
            {/* Header */}
            <div className="px-3 py-2 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-[2px] text-white/40">Order Terminal</span>
                <button onClick={onClose} className="p-1 hover:bg-white/5 rounded transition-colors"><X className="w-3 h-3 text-white/30" /></button>
            </div>

            <div className="p-4 flex flex-col gap-4">
                {/* Side Toggle (Institutional Style) */}
                <div className="flex border border-white/10 p-0.5 rounded bg-black/20">
                    {['buy', 'sell'].map(s => (
                        <button
                            key={s}
                            onClick={() => {
                                setSide(s);
                                setSl(parseFloat((entry * (s === 'buy' ? 0.994 : 1.006)).toFixed(2)));
                                setTp(parseFloat((entry * (s === 'buy' ? 1.008 : 0.992)).toFixed(2)));
                            }}
                            className={`flex-1 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all ${side === s
                                ? s === 'buy' ? 'bg-[#22c55e] text-white' : 'bg-[#ef4444] text-white'
                                : 'text-white/20 hover:text-white/50'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {/* Price Display */}
                <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Execution @</span>
                    <span className="text-[12px] font-mono font-black text-white">{formatPrice(entry)}</span>
                </div>

                {/* Inputs Stack */}
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center px-0.5">
                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Stop Loss</label>
                            <span className="text-[9px] font-mono text-red-500/60">₹{riskRs}</span>
                        </div>
                        <input
                            type="number" value={sl} step="0.05"
                            onChange={e => setSl(parseFloat(e.target.value))}
                            className="w-full bg-white/[0.03] border border-white/5 rounded p-2 text-[11px] font-mono font-bold text-red-400 focus:outline-none focus:border-red-500/30 transition-colors"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center px-0.5">
                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Take Profit</label>
                            <span className="text-[9px] font-mono text-emerald-500/60">₹{rewardRs}</span>
                        </div>
                        <input
                            type="number" value={tp} step="0.05"
                            onChange={e => setTp(parseFloat(e.target.value))}
                            className="w-full bg-white/[0.03] border border-white/5 rounded p-2 text-[11px] font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500/30 transition-colors"
                        />
                    </div>

                    <div className="flex items-center justify-between bg-black/20 border border-white/5 rounded p-2">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-tighter">Lots (Qty)</span>
                            <div className="flex items-center gap-2 mt-1">
                                <button onClick={() => setLots(l => Math.max(1, l - 1))} className="text-white/30 hover:text-white transition-colors">-</button>
                                <input
                                    type="number" value={lots} min={1}
                                    onChange={e => setLots(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-8 bg-transparent text-center text-[11px] font-mono font-black text-white focus:outline-none"
                                />
                                <button onClick={() => setLots(l => l + 1)} className="text-white/30 hover:text-white transition-colors">+</button>
                            </div>
                        </div>
                        <div className="h-6 w-px bg-white/5 mx-2" />
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-tighter">R:R Ratio</span>
                            <span className={`text-[11px] font-mono font-black mt-0.5 ${parseFloat(rr) >= 2 ? 'text-emerald-400' : 'text-yellow-500'}`}>1:{rr}</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleOrder}
                    className={`w-full py-2.5 rounded font-black text-[10px] uppercase tracking-[3px] transition-all active:scale-[0.98] ${side === 'buy' ? 'bg-[#22c55e] text-black shadow-[0_0_20px_rgba(34,197,94,0.15)]' : 'bg-[#ef4444] text-black shadow-[0_0_20px_rgba(239,68,68,0.15)]'
                        }`}
                >
                    PLACE {lots} L {side}
                </button>
            </div>
        </div>
    );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function ChartOverlay({ chartInstance, containerRef, symbol, quotes, onOrder, onClosePosition, positions = [] }) {
    const [tradeBox, setTradeBox] = useState(null); // { entryPrice }

    const ltp = quotes?.[symbol]?.ltp;

    // Click on chart → open trade box with clicked price
    useEffect(() => {
        if (!chartInstance) return;

        const handler = (param) => {
            if (!param || !param.point) return;
            // Get price at click point using the series
            const series = [...(param.seriesData?.values() || [])];
            const firstSeries = param.seriesData?.keys()?.next()?.value;
            if (!firstSeries) return;

            const seriesData = param.seriesData.get(firstSeries);
            let price = seriesData?.close ?? seriesData?.value ?? ltp ?? 0;

            setTradeBox(tb => {
                // If box already open, clicking again closes it
                // unless it was just opened (prevent immediate close)
                return tb ? null : { entryPrice: parseFloat(price).toFixed(2) };
            });
        };

        chartInstance.subscribeClick(handler);
        return () => chartInstance.unsubscribeClick(handler);
    }, [chartInstance, ltp]);

    // Escape to close
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') setTradeBox(null); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    if (!containerRef?.current) return null;

    return (
        <div
            className="absolute inset-0 pointer-events-none z-20"
            style={{ position: 'absolute', inset: 0 }}
        >
            {/* Crosshair Tooltip — pointer-events none so it doesn't block chart */}
            <CrosshairTooltip chartInstance={chartInstance} containerRef={containerRef} />

            <div className="absolute inset-0 pointer-events-none">
                {/* floating active positions list on chart removed to avoid duplication visually */}
            </div>

            {/* Trade Box — pointer-events auto so it's interactive */}
            {
                tradeBox && (
                    <div className="pointer-events-auto absolute inset-0">
                        <TradeBox
                            entryPrice={tradeBox.entryPrice}
                            symbol={symbol}
                            ltp={ltp}
                            onOrder={onOrder}
                            onClose={() => setTradeBox(null)}
                        />
                    </div>
                )
            }
        </div >
    );
}
