import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Alert from '../../components/common/Alert';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';

const ROLE_COLORS = { admin: 'role-admin', inspector: 'role-inspector', user: 'role-user' };

export default function UserList() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [alert, setAlert] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [invite, setInvite] = useState({ first_name: '', last_name: '', email: '' });
  const [inviteErrors, setInviteErrors] = useState({});
  const [inviteLoading, setInviteLoading] = useState(false);

  const LIMIT = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/users', {
        params: { search: search || undefined, role: roleFilter || undefined, page, limit: LIMIT },
      });
      setUsers(data.data.users);
      setTotal(data.data.total);
      setPages(data.data.pages);
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to load users.' });
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await API.delete(`/users/${deleteTarget.id}`);
      setAlert({ type: 'success', message: `User "${deleteTarget.first_name} ${deleteTarget.last_name}" deleted successfully.` });
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to delete user.' });
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const validateInvite = () => {
    const nextErrors = {};
    const namePattern = /^[a-zA-Z\s'-]+$/;
    if (!invite.first_name.trim()) nextErrors.first_name = 'First name is required.';
    else if (invite.first_name.trim().length < 2) nextErrors.first_name = 'First name must be at least 2 characters.';
    else if (!namePattern.test(invite.first_name.trim())) nextErrors.first_name = 'First name must contain only letters.';
    if (!invite.last_name.trim()) nextErrors.last_name = 'Last name is required.';
    else if (invite.last_name.trim().length < 2) nextErrors.last_name = 'Last name must be at least 2 characters.';
    else if (!namePattern.test(invite.last_name.trim())) nextErrors.last_name = 'Last name must contain only letters.';
    if (!invite.email.trim()) nextErrors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invite.email.trim())) nextErrors.email = 'Enter a valid email address.';
    setInviteErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleInvite = async (event) => {
    event.preventDefault();
    if (!validateInvite()) return;
    setInviteLoading(true);
    try {
      await API.post('/users/invite-inspector', {
        first_name: invite.first_name.trim(),
        last_name: invite.last_name.trim(),
        email: invite.email.trim().toLowerCase(),
      });
      setAlert({ type: 'success', message: 'Inspector invited successfully. Login credentials were sent by email.' });
      setInvite({ first_name: '', last_name: '', email: '' });
      setInviteErrors({});
      fetchUsers();
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to invite inspector.' });
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1>User Management</h1>
          <p>Manage system users and their roles</p>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <div className="card-title">Invite Inspector</div>
            <div className="card-subtitle">Create an inspector account and email temporary login credentials.</div>
          </div>
        </div>
        <form onSubmit={handleInvite} noValidate>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required" htmlFor="invite-first">First Name</label>
              <input
                id="invite-first"
                className={`form-control ${inviteErrors.first_name ? 'error' : ''}`}
                value={invite.first_name}
                onChange={(e) => setInvite((prev) => ({ ...prev, first_name: e.target.value }))}
                disabled={inviteLoading}
              />
              {inviteErrors.first_name && <div className="form-error">{inviteErrors.first_name}</div>}
            </div>
            <div className="form-group">
              <label className="form-label required" htmlFor="invite-last">Last Name</label>
              <input
                id="invite-last"
                className={`form-control ${inviteErrors.last_name ? 'error' : ''}`}
                value={invite.last_name}
                onChange={(e) => setInvite((prev) => ({ ...prev, last_name: e.target.value }))}
                disabled={inviteLoading}
              />
              {inviteErrors.last_name && <div className="form-error">{inviteErrors.last_name}</div>}
            </div>
            <div className="form-group">
              <label className="form-label required" htmlFor="invite-email">Email</label>
              <input
                id="invite-email"
                type="email"
                className={`form-control ${inviteErrors.email ? 'error' : ''}`}
                value={invite.email}
                onChange={(e) => setInvite((prev) => ({ ...prev, email: e.target.value }))}
                disabled={inviteLoading}
              />
              {inviteErrors.email && <div className="form-error">{inviteErrors.email}</div>}
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={inviteLoading}>
              {inviteLoading ? <><span className="btn-spinner" /> Sending invite...</> : 'Invite Inspector'}
            </button>
          </div>
        </form>
      </div>

      <div className="table-container">
        <div className="table-header">
          <span className="table-title">All Users ({total})</span>
          <div className="table-actions">
            <div className="search-bar">
              <span className="search-icon">Search</span>
              <input
                type="search"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <select className="filter-select" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="inspector">Inspector</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-overlay"><div className="spinner" /></div>
        ) : users.length === 0 ? (
          <div className="table-empty">
            <div className="table-empty-icon">No records</div>
            <div className="table-empty-text">No users found</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: 'white', flexShrink: 0 }}>
                        {u.first_name[0]}{u.last_name[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{u.first_name} {u.last_name}</div>
                        {u.id === currentUser?.id && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>You</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td><span className={`badge ${ROLE_COLORS[u.role]}`}>{u.role}</span></td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link to={`/users/${u.id}`} className="btn btn-secondary btn-sm">Edit</Link>
                      {u.id !== currentUser?.id && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteTarget(u)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <Pagination page={page} pages={pages} total={total} limit={LIMIT} onPageChange={setPage} />
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Delete User"
          message={`Are you sure you want to delete "${deleteTarget.first_name} ${deleteTarget.last_name}"? This action cannot be undone.`}
          confirmLabel="Delete User"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
