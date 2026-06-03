import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute — wraps private routes
 * SECURITY: Redirects unauthenticated users to /login.
 * SECURITY: Enforces role-based access; shows 403 if role not allowed.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
        <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Verifying session...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div style={{ padding: '48px', textAlign: 'center' }}>
        <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px', color: 'var(--danger)' }}>ACCESS DENIED</div>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  return children;
}
