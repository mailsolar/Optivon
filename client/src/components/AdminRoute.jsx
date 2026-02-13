import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) return <div className="min-h-screen bg-brand-dark flex items-center justify-center text-brand-lime">Loading...</div>;

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (user.is_admin !== 1 && user.is_admin !== true) { // Check for both 1 (SQLite) and true (potential future)
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

