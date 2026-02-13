
import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import AuthModal from './components/AuthModal'
import AccountsOverview from './pages/OptivonDashboard/AccountsOverview'
import Certificates from './pages/OptivonDashboard/Certificates'
import Withdrawals from './pages/OptivonDashboard/Withdrawals'
import OrderHistory from './pages/OptivonDashboard/OrderHistory'
import AccountMetrics from './pages/OptivonDashboard/AccountMetrics'
import OptivonLayout from './components/Dashboard/OptivonLayout'
import TerminalLayout from './components/Terminal/TerminalLayout'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastProvider } from './context/ToastContext'
import StockDetail from './pages/StockDetail'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

import HelpCenter from './pages/OptivonDashboard/HelpCenter'
import Affiliates from './pages/OptivonDashboard/Affiliates'
import Competitions from './pages/OptivonDashboard/Competitions'
import Settings from './pages/OptivonDashboard/Settings'
import ResetPassword from './pages/ResetPassword'
import Rules from './pages/Rules'
import Checkout from './pages/Checkout'
import AdminLayout from './layouts/AdminLayout'
import AdminRoute from './components/AdminRoute'
import AdminDashboard from './pages/Admin/AdminDashboard'
import Users from './pages/Admin/Users'
import RiskMonitor from './pages/Admin/RiskMonitor'
import AdminSettings from './pages/Admin/Settings'
import UpstoxChart from './components/UpstoxChart'

function AppRoutes() {
    const { user, login } = useAuth();
    console.log('[DEBUG] AppRoutes Render. User:', user);
    const [showAuth, setShowAuth] = useState(false);

    const handleAuthRequest = () => {
        if (!user) setShowAuth(true);
    };

    const handleLoginSuccess = (data) => {
        login(data.user, data.token);
        setShowAuth(false);
    };

    return (
        <>
            <Routes>
                <Route path="/" element={
                    user ? (
                        <Navigate to="/dashboard" replace />
                    ) : (
                        <Landing onAuthRequest={handleAuthRequest} />
                    )
                } />

                {/* OPTIVON DASHBOARD ROUTES */}
                <Route path="/dashboard" element={
                    user ? <OptivonLayout /> : <Navigate to="/" />
                }>
                    <Route index element={<AccountsOverview />} />
                    <Route path="account/:id" element={<AccountMetrics />} />

                    <Route path="certificates" element={<Certificates />} />
                    <Route path="withdrawals" element={<Withdrawals />} />
                    <Route path="orders" element={<OrderHistory />} />
                    <Route path="help" element={<HelpCenter />} />
                    <Route path="affiliates" element={<Affiliates />} />
                    <Route path="competitions" element={<Competitions />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="*" element={<AccountsOverview />} />
                </Route>

                <Route path="/terminal" element={
                    user ? <TerminalLayout /> : <Navigate to="/" />
                } />

                <Route path="/stock/:symbol" element={<StockDetail />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/rules" element={<Rules />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/live-test" element={<UpstoxChart />} />

                {/* ADMIN ROUTES */}
                <Route path="/admin" element={
                    <AdminRoute>
                        <AdminLayout />
                    </AdminRoute>
                }>
                    <Route index element={<AdminDashboard />} />
                    <Route path="risk" element={<RiskMonitor />} />
                    <Route path="users" element={<Users />} />
                    <Route path="settings" element={<AdminSettings />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {showAuth && (
                <AuthModal
                    onClose={() => setShowAuth(false)}
                    onLoginSuccess={handleLoginSuccess}
                />
            )}
        </>
    );
}

export default function App() {
    return (
        <ErrorBoundary>
            <ToastProvider>
                <AuthProvider>
                    <ThemeProvider>
                        <AppRoutes />
                    </ThemeProvider>
                </AuthProvider>
            </ToastProvider>
        </ErrorBoundary>
    )
}

