import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import API from '../../api/axios';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/users': 'User Management',
  '/extinguishers': 'Fire Extinguishers',
  '/extinguishers/new': 'Add Extinguisher',
  '/inspections': 'Inspections',
  '/inspections/new': 'Schedule Inspection',
  '/maintenance': 'Maintenance',
  '/maintenance/new': 'Log Maintenance',
  '/reports': 'Reports & Analytics',
  '/notifications': 'Notifications',
  '/profile': 'My Profile',
};

export default function Navbar() {
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const title = PAGE_TITLES[location.pathname] || 'FEMS';

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const { data } = await API.get('/notifications?status=unread&limit=1');
        if (data.success) setUnreadCount(data.data.unread || 0);
      } catch {
        // Silently fail — notifications not critical
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h1 className="page-title">{title}</h1>
      </div>
      <div className="navbar-right">
        <button
          className="notification-btn"
          title="Notifications"
          aria-label="Notifications"
          onClick={() => navigate('/notifications')}
        >
          Alerts
          {unreadCount > 0 && (
            <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Welcome, <strong style={{ color: 'var(--text-primary)' }}>{user?.first_name}</strong>
        </div>
      </div>
    </header>
  );
}
