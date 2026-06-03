import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import ConfirmDialog from '../common/ConfirmDialog';

const getInitials = (first, last) => `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();

const accountItems = [
  { to: '/notifications', icon: 'N', label: 'Notifications' },
  { to: '/profile', icon: 'P', label: 'My Profile' },
];

const NAV_ITEMS = {
  admin: [
    { section: 'Overview', items: [{ to: '/dashboard', icon: 'D', label: 'Dashboard' }] },
    {
      section: 'Management',
      items: [
        { to: '/users', icon: 'U', label: 'User Management' },
        { to: '/extinguishers', icon: 'E', label: 'Fire Extinguishers' },
        { to: '/inspections', icon: 'I', label: 'Inspections' },
        { to: '/maintenance', icon: 'M', label: 'Maintenance' },
      ],
    },
    { section: 'Analytics', items: [{ to: '/reports', icon: 'R', label: 'Reports' }] },
    { section: 'Account', items: accountItems },
  ],
  inspector: [
    { section: 'Overview', items: [{ to: '/dashboard', icon: 'D', label: 'Dashboard' }] },
    {
      section: 'My Work',
      items: [
        { to: '/extinguishers', icon: 'E', label: 'Fire Extinguishers' },
        { to: '/inspections', icon: 'I', label: 'Inspections' },
        { to: '/maintenance', icon: 'M', label: 'Maintenance Logs' },
      ],
    },
    { section: 'Analytics', items: [{ to: '/reports', icon: 'R', label: 'Reports' }] },
    { section: 'Account', items: accountItems },
  ],
  user: [
    { section: 'Overview', items: [{ to: '/dashboard', icon: 'D', label: 'Dashboard' }] },
    {
      section: 'Extinguishers',
      items: [
        { to: '/extinguishers', icon: 'E', label: 'View Extinguishers' },
        { to: '/inspections', icon: 'I', label: 'Schedule Inspection' },
      ],
    },
    { section: 'Account', items: accountItems },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navSections = NAV_ITEMS[user?.role] || NAV_ITEMS.user;

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
  };

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">FE</div>
          <div className="sidebar-logo-text">
            <h2>FEMS</h2>
            <span>TZW LTD</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navSections.map((section) => (
            <div key={section.section}>
              <div className="nav-section-title">{section.section}</div>
              {section.items.map((item) => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <span className="nav-link-icon">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{getInitials(user?.first_name, user?.last_name)}</div>
            <div className="user-info">
              <div className="user-name">{user?.first_name} {user?.last_name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
            <button className="logout-btn" onClick={() => setShowLogoutConfirm(true)} title="Logout" aria-label="Logout">
              x
            </button>
          </div>
        </div>
      </aside>

      {showLogoutConfirm && (
        <ConfirmDialog
          title="Confirm Logout"
          message="Are you sure you want to log out of FEMS? Any unsaved changes will be lost."
          confirmLabel="Logout"
          confirmVariant="btn-danger"
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </>
  );
}
