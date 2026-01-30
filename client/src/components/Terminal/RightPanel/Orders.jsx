
import React, { useEffect, useState } from 'react';

export default function Orders({ accountId }) {
    const [orders, setOrders] = useState([]);

    const fetchOrders = async () => {
        if (!accountId) return;
        try {
            const res = await fetch(`http://localhost:5000/api/trade/orders/${accountId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                setOrders(await res.json());
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 2000);
        return () => clearInterval(interval);
    }, [accountId]);

    const handleCancel = async (orderId) => {
        try {
            await fetch('http://localhost:5000/api/trade/cancel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ orderId })
            });
            fetchOrders();
        } catch (e) { console.error(e); }
    };

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 text-xs">
                <div className="mb-2 opacity-50 text-4xl">📝</div>
                <p>No pending orders</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#1e1e24] text-sm overflow-y-auto">
            {orders.map(order => (
                <div key={order.id} className="p-3 border-b border-white/5 hover:bg-white/5">
                    <div className="flex justify-between mb-1">
                        <span className="font-semibold text-gray-200">{order.symbol}</span>
                        <span className="text-yellow-500 font-mono text-xs">PENDING</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span className={order.side === 'buy' ? 'text-blue-400' : 'text-orange-400'}>
                            {order.side.toUpperCase()} {order.lots} L
                        </span>
                        <span>@ {order.limit_price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-gray-600">
                        <div>
                            {order.sl > 0 && <span className="mr-2 text-red-500/60">SL: {order.sl}</span>}
                            {order.tp > 0 && <span className="text-green-500/60">TP: {order.tp}</span>}
                        </div>
                        <button
                            onClick={() => handleCancel(order.id)}
                            className="text-red-500 hover:text-red-400 border border-red-500/20 px-2 py-0.5 rounded hover:bg-red-500/10 transition-colors"
                        >
                            CANCEL
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
