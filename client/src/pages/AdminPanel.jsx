import React, { useEffect, useState } from 'react';

const AdminSection = ({ title, children }) => (
    <div className="bg-white/5 border border-white/10 p-6 rounded mb-8">
        <h2 className="text-xl font-bold text-cyber-cyan mb-4 uppercase tracking-widest border-b border-white/10 pb-2">{title}</h2>
        {children}
    </div>
);

export default function AdminPanel({ user, onLogout }) {
    const [users, setUsers] = useState([]);
    const [violations, setViolations] = useState([]);
    const [accounts, setAccounts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [uRes, vRes, aRes] = await Promise.all([
                fetch('http://localhost:5000/api/admin/users', { headers }),
                fetch('http://localhost:5000/api/admin/violations', { headers }),
                fetch('http://localhost:5000/api/admin/accounts', { headers })
            ]);

            if (uRes.ok) setUsers(await uRes.json());
            if (vRes.ok) setViolations(await vRes.json());
            if (aRes.ok) setAccounts(await aRes.json());
        };
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-void text-white p-8 font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-void to-void">
            <header className="flex justify-between items-center mb-10 border-b border-white/10 pb-4">
                <div>
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 tracking-widest italic">OPTIVON ADMIN</h1>
                    <div className="text-xs font-mono text-gray-500">SYSTEM OVERLORD: {user.email}</div>
                </div>
                <button onClick={onLogout} className="px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all uppercase text-xs font-bold tracking-widest">
                    Logout
                </button>
            </header>

            <div className="max-w-7xl mx-auto">
                <AdminSection title="Risk Violations">
                    <table className="w-full text-left text-sm text-gray-400 font-mono">
                        <thead className="text-xs uppercase bg-black/50 text-red-400">
                            <tr><th className="p-3">ID</th><th className="p-3">User</th><th className="p-3">Type</th><th className="p-3">Time</th></tr>
                        </thead>
                        <tbody>
                            {violations.length === 0 ? <tr><td colSpan="4" className="p-4 text-center">No Violations</td></tr> : violations.map(v => (
                                <tr key={v.id} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="p-3">#{v.id}</td>
                                    <td className="p-3 text-white">{v.email}</td>
                                    <td className="p-3 text-red-500 font-bold">{v.type.toUpperCase()}</td>
                                    <td className="p-3">{new Date(v.timestamp).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </AdminSection>

                <AdminSection title="User Database">
                    <table className="w-full text-left text-sm text-gray-400 font-mono">
                        <thead className="text-xs uppercase bg-black/50 text-cyber-cyan">
                            <tr><th className="p-3">ID</th><th className="p-3">Email</th><th className="p-3">Joined</th><th className="p-3">IP</th></tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="p-3">#{u.id}</td>
                                    <td className="p-3 text-white">{u.email} {u.is_admin ? '(ADMIN)' : ''}</td>
                                    <td className="p-3">{new Date(u.created_at).toLocaleDateString()}</td>
                                    <td className="p-3">{u.ip_address}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </AdminSection>
            </div>
        </div>
    );
}
