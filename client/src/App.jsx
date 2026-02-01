
import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import AuthModal from './components/AuthModal'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import AdminPanel from './pages/AdminPanel'
import StockDetail from './pages/StockDetail'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastProvider } from './context/ToastContext'

export default function App() {
    const [showAuth, setShowAuth] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check for existing session
        const token = localStorage.getItem('token');
        if (token) {
            fetch('http://localhost:5000/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(res => res.json()).then(data => {
                if (data.user) setUser(data.user);
                else localStorage.removeItem('token');
            }).catch(() => localStorage.removeItem('token'));
        }
    }, []);

    const handleAuthRequest = () => {
        if (user) {
            // console.log('Already logged in!');
        } else {
            setShowAuth(true);
        }
    };

    const handleLoginSuccess = (userData) => {
        setUser(userData);
        setShowAuth(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <ErrorBoundary>
            <ToastProvider>
                <Routes>
                    <Route path="/" element={
                        user ? (
                            user.isAdmin ?
                                <AdminPanel user={user} onLogout={handleLogout} /> :
                                <DashboardLayout user={user} onLogout={handleLogout}>
                                    <Dashboard user={user} onLogout={handleLogout} />
                                </DashboardLayout>
                        ) : (
                            <Landing onAuthRequest={handleAuthRequest} />
                        )
                    } />
                    <Route path="/stock/:symbol" element={<StockDetail />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>

                {showAuth && (
                    <AuthModal
                        onClose={() => setShowAuth(false)}
                        onLoginSuccess={handleLoginSuccess}
                    />
                )}
            </ToastProvider>
        </ErrorBoundary>
    )
}
