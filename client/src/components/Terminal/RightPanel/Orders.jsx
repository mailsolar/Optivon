
import React, { useEffect, useState } from 'react';

export default function Orders({ accountId }) {
    const [activeTab, setActiveTab] = useState('ACTIVE');
    const [orders, setOrders] = useState([]);
    const [history, setHistory] = useState([]);

    const fetchData = async () => {
        if (!accountId) return;
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [ordersRes, historyRes] = await Promise.all([
                fetch(`/api/trade/orders/${accountId}`, { headers }),
                fetch(`/api/trade/history/${accountId}`, { headers })
            ]);

            if (ordersRes.ok) setOrders(await ordersRes.json());
            if (historyRes.ok) setHistory(await historyRes.json());

        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 2000);
        return () => clearInterval(interval);
    }, [accountId]);

    const handleCancel = async (orderId) => {
        try {
            await fetch('/api/trade/cancel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ orderId })
            });
            fetchData();
        } catch (e) { console.error(e); }
    };

    const renderList = (data, isHistory = false) => {
        if (!data || data.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-xs">
                    <div className="mb-2 opacity-50 text-2xl">📝</div>
                    <p>No {isHistory ? 'history' : 'pending orders'}</p>
                </div>
            );
        }

        return data.map(item => (
            <div key={item.id} className="p-3 border-b border-white/5 hover:bg-white/5">
                <div className="flex justify-between mb-1">
                    <span className="font-semibold text-gray-200">{item.symbol}</span>
                    <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${item.status === 'filled' ? 'bg-green-500/20 text-green-400' :
                        item.status === 'closed' ? 'bg-gray-500/20 text-gray-400' :
                            item.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                                'bg-yellow-500/20 text-yellow-400'
                        }`}>
                        {item.status.toUpperCase()}
                    </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span className={item.side === 'buy' ? 'text-blue-400' : 'text-orange-400'}>
                        {item.side.toUpperCase()} {item.lots} L
                    </span>
                    <span>@ {item.entry_price ? item.entry_price.toFixed(2) : item.limit_price?.toFixed(2)}</span>
                </div>
                {item.status === 'closed' && (
                    <div className="flex justify-between text-[10px] mt-1">
                        <span className="text-gray-600">PnL:</span>
                        <span className={`font-mono ${item.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {item.pnl >= 0 ? '+' : ''}{item.pnl?.toFixed(2)}
                        </span>
                    </div>
                )}
                {!isHistory && (
                    <div className="flex justify-end mt-2">
                        <button
                            onClick={() => handleCancel(item.id)}
                            className="text-red-500 hover:text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[10px] hover:bg-red-500/10 transition-colors"
                        >
                            CANCEL
                        </button>
                    </div>
                )}
            </div>
        ));
    };

    return (
        <div className="flex flex-col h-full bg-[#1e1e24] text-sm overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-white/5">
                <button
                    onClick={() => setActiveTab('ACTIVE')}
                    className={`flex-1 py-2 text-[10px] font-bold tracking-wider ${activeTab === 'ACTIVE' ? 'text-blue-400 border-b-2 border-blue-400 bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    ACTIVE
                </button>
                <button
                    onClick={() => setActiveTab('HISTORY')}
                    className={`flex-1 py-2 text-[10px] font-bold tracking-wider ${activeTab === 'HISTORY' ? 'text-blue-400 border-b-2 border-blue-400 bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    HISTORY
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'ACTIVE' ? renderList(orders) : renderList(history, true)}
            </div>
        </div>
    );
}

