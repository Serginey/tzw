import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Layout
import Sidebar from './components/Layout/Sidebar';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyOtp from './pages/auth/VerifyOtp';

// App Pages
import Dashboard from './pages/dashboard/Dashboard';
import UserList from './pages/users/UserList';
import UserProfile from './pages/users/UserProfile';
import ExtinguisherList from './pages/extinguishers/ExtinguisherList';
import ExtinguisherAdd from './pages/extinguishers/ExtinguisherAdd';
import ExtinguisherEdit from './pages/extinguishers/ExtinguisherEdit';
import ExtinguisherDetail from './pages/extinguishers/ExtinguisherDetail';
import InspectionList from './pages/inspections/InspectionList';
import InspectionSchedule from './pages/inspections/InspectionSchedule';
import MaintenanceLog from './pages/maintenance/MaintenanceLog';
import MaintenanceHistory from './pages/maintenance/MaintenanceHistory';
import ReportsDashboard from './pages/reports/ReportsDashboard';
import Notifications from './pages/notifications/Notifications';

import './styles/index.css';

/**
 * AppLayout — wraps authenticated pages with Sidebar, Navbar, and Footer
 */
function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="font-sans">
      <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout><Dashboard /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppLayout><UserList /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/users/:id" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppLayout><UserProfile /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <AppLayout><UserProfile /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/extinguishers" element={
            <ProtectedRoute>
              <AppLayout><ExtinguisherList /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/extinguishers/new" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppLayout><ExtinguisherAdd /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/extinguishers/:id" element={
            <ProtectedRoute>
              <AppLayout><ExtinguisherDetail /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/extinguishers/:id/edit" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppLayout><ExtinguisherEdit /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/inspections" element={
            <ProtectedRoute>
              <AppLayout><InspectionList /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/inspections/new" element={
            <ProtectedRoute allowedRoles={['admin', 'user']}>
              <AppLayout><InspectionSchedule /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/maintenance" element={
            <ProtectedRoute>
              <AppLayout><MaintenanceHistory /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/maintenance/new" element={
            <ProtectedRoute allowedRoles={['admin', 'inspector']}>
              <AppLayout><MaintenanceLog /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/reports" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppLayout><ReportsDashboard /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/notifications" element={
            <ProtectedRoute>
              <AppLayout><Notifications /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Default redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={
            <div style={{ padding: '64px', textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>404</div>
              <h2 style={{ color: 'var(--text-primary)' }}>Page Not Found</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>The page you're looking for doesn't exist.</p>
            </div>
          } />
        </Routes>
      </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
