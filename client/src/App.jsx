
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
import DummyInfo from './pages/Legal/DummyInfo'

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

                <Route path="/about" element={<DummyInfo title="Strategic Mandate" subtitle="Architecting the future of institutional capital through precision-engineered funding protocols." content={[{header: "Our Mission", text: "To identify and empower the next generation of global trading talent with institutional-grade capital and risk management systems."}, {header: "Architecture", text: "Our platform is built on the Monolith framework, designed for high-frequency precision and absolute transparency."}]} />} />
                <Route path="/mission" element={<Navigate to="/about" replace />} />
                <Route path="/capital-tiers" element={<DummyInfo title="Capital Tiers" subtitle="Scaled allocation nodes designed for evolving institutional requirements." content={[{header: "Tier Allocation", text: "From $10,000 to $1,000,000+, our tiers are calibrated to match trader performance with systemic risk parameters."}, {header: "Scaling Protocol", text: "Traders demonstrating consistent alpha generation are eligible for node expansion and increased liquidity access."}]} />} />
                <Route path="/faq" element={<DummyInfo title="Operational FAQ" subtitle="Recursive information matrix for system participants." content={[{header: "Execution", text: "All trades are processed through our proprietary institutional bridge, ensuring sub-millisecond latency."}, {header: "Payout Sync", text: "Withdrawals are processed in bi-weekly cycles, synchronized with global banking settlement hours."}]} />} />
                
                <Route path="/legal/privacy" element={<DummyInfo title="Privacy Protocol" subtitle="How we secure and process participant metadata within the internal network." content={[{header: "Information Sync", text: "We only collect data essential for node security and regulatory compliance."}, {header: "Encryption", text: "All transit data is protected by the latest cryptographic standards, ensuring absolute anonymity where permitted."}]} />} />
                <Route path="/legal/terms" element={<DummyInfo title="Terms of Engagement" subtitle="The foundational framework for system participation." content={[{header: "Node Stability", text: "Participants must maintain system integrity and follow risk management protocols at all times."}, {header: "Governance", text: "Optivon reserves the right to terminate nodes that exhibit malicious or destabilizing patterns."}]} />} />
                <Route path="/legal/cookies" element={<DummyInfo title="Cookie Matrix" subtitle="Tracking beacons for session optimization." content={[{header: "Optimization", text: "We use essential cookies to maintain session persistence and system performance markers."}, {header: "Analytics", text: "Non-essential data is used to optimize the user interface and institutional bridge efficiency."}]} />} />
                <Route path="/legal/risk" element={<DummyInfo title="Risk Disclosure" subtitle="Mandatory baseline protocols for system participants." content={[{header: "Market Volatility", text: "System participation involves high-frequency risk. Capital loss is a baseline possibility."}, {header: "Institutional Limits", text: "All nodes are subject to hard stop-loss parameters to protect the integrity of the capital pool."}]} />} />

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

