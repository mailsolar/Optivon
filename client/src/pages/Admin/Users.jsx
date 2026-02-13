import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, MoreHorizontal, Shield, User as UserIcon } from 'lucide-react';

export default function Users() {
    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (err) {
            console.error("Failed to fetch users", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (userId, isAdmin) => {
        // Optimistic UI update
        const updatedUsers = users.map(u => u.id === userId ? { ...u, is_admin: isAdmin ? 1 : 0 } : u);
        setUsers(updatedUsers);

        try {
            await fetch('/api/admin/user-role', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId, isAdmin })
            });
        } catch (err) {
            console.error("Failed to update role", err);
            fetchUsers(); // Revert on error
        }
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(filter.toLowerCase()) ||
        u.id.toString().includes(filter)
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-black font-display text-primary">User Management</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-primary focus:border-accent outline-none w-64"
                    />
                </div>
            </div>

            <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-background/50 border-b border-border">
                            <th className="p-4 text-xs font-bold text-secondary uppercase tracking-wider">ID</th>
                            <th className="p-4 text-xs font-bold text-secondary uppercase tracking-wider">User</th>
                            <th className="p-4 text-xs font-bold text-secondary uppercase tracking-wider">Role</th>
                            <th className="p-4 text-xs font-bold text-secondary uppercase tracking-wider">Joined</th>
                            <th className="p-4 text-xs font-bold text-secondary uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading ? (
                            <tr><td colSpan="5" className="p-8 text-center text-secondary">Loading users...</td></tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-secondary">No users found.</td></tr>
                        ) : (
                            filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-surface-hover/50 transition-colors">
                                    <td className="p-4 text-sm font-mono text-secondary">#{user.id}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                                <UserIcon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-primary">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {user.is_admin ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20">
                                                <Shield className="w-3 h-3" /> ADMIN
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                                TRADER
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-sm text-secondary font-mono">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        {user.is_admin ? (
                                            <button
                                                onClick={() => handleRoleUpdate(user.id, false)}
                                                className="text-xs text-red-400 hover:text-red-300 font-medium"
                                            >
                                                Demote
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleRoleUpdate(user.id, true)}
                                                className="text-xs text-accent hover:text-white font-medium"
                                            >
                                                Promote
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

