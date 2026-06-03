import { useEffect, useState } from 'react';
import API from '../../api/axios';
import Alert from '../../components/common/Alert';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const { data } = await API.get('/notifications?limit=50');
        setNotifications(data.data.notifications || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load notifications.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    await API.put(`/notifications/${id}/read`);
    setNotifications((items) => items.map((item) => item.id === id ? { ...item, status: 'read' } : item));
  };

  const markAllAsRead = async () => {
    await API.put('/notifications/read-all');
    setNotifications((items) => items.map((item) => ({ ...item, status: 'read' })));
    setSuccess('All notifications marked as read.');
  };

  const confirmDelete = async () => {
    await API.delete(`/notifications/${deleteId}`);
    setNotifications((items) => items.filter((item) => item.id !== deleteId));
    setDeleteId(null);
    setSuccess('Notification deleted.');
  };

  return (
    <div className="page-container">
      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <div className="page-header">
        <div>
          <h2>Notifications</h2>
          <p>Inspection reminders, maintenance alerts, and system messages.</p>
        </div>
        <button className="btn btn-secondary" onClick={markAllAsRead} disabled={!notifications.some((n) => n.status === 'unread')}>
          Mark all read
        </button>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="loading-state">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">No notifications yet.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Message</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notification) => (
                <tr key={notification.id}>
                  <td>{notification.message}</td>
                  <td><span className={`badge ${notification.status === 'unread' ? 'badge-warning' : 'badge-success'}`}>{notification.status}</span></td>
                  <td>{new Date(notification.created_at).toLocaleString()}</td>
                  <td>
                    {notification.status === 'unread' && (
                      <button className="btn btn-sm btn-secondary" onClick={() => markAsRead(notification.id)}>Read</button>
                    )}
                    <button className="btn btn-sm btn-danger" onClick={() => setDeleteId(notification.id)} style={{ marginLeft: '8px' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {deleteId && (
        <ConfirmDialog
          title="Delete notification"
          message="Are you sure you want to delete this notification?"
          confirmLabel="Delete"
          confirmVariant="btn-danger"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
