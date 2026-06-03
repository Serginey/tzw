import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Alert from '../../components/common/Alert';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import { useAuth } from '../../context/AuthContext';

const STATUS_COLORS = {
  Active: 'badge-success',
  Expired: 'badge-danger',
  'Under Maintenance': 'badge-warning',
  'Needs Inspection': 'badge-info',
};

export default function ExtinguisherList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [extinguishers, setExtinguishers] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [alert, setAlert] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const LIMIT = 10;

  const fetchExtinguishers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/extinguishers', {
        params: { search: search || undefined, type: typeFilter || undefined, status: statusFilter || undefined, page, limit: LIMIT },
      });
      setExtinguishers(data.data.extinguishers);
      setTotal(data.data.total);
      setPages(data.data.pages);
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to load extinguishers.' });
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, statusFilter, page]);

  useEffect(() => { fetchExtinguishers(); }, [fetchExtinguishers]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await API.delete(`/extinguishers/${deleteTarget.id}`);
      setAlert({ type: 'success', message: `Extinguisher "${deleteTarget.serial_number}" deleted successfully.` });
      setDeleteTarget(null);
      fetchExtinguishers();
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to delete.' });
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const isExpired = (date) => date < new Date().toISOString().split('T')[0];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Fire Extinguishers</h1>
          <p>Manage and monitor all fire extinguishers in inventory</p>
        </div>
        {user?.role === 'admin' && (
          <Link to="/extinguishers/new" className="btn btn-primary">+ Add Extinguisher</Link>
        )}
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="table-container">
        <div className="table-header">
          <span className="table-title">Inventory ({total})</span>
          <div className="table-actions">
            <div className="search-bar">
              <span className="search-icon">Search</span>
              <input
                type="search"
                placeholder="Search serial or location..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <select className="filter-select" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
              <option value="">All Types</option>
              <option value="Water">Water</option>
              <option value="CO2">CO₂</option>
              <option value="Foam">Foam</option>
              <option value="Dry Chemical">Dry Chemical</option>
            </select>
            <select className="filter-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Needs Inspection">Needs Inspection</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-overlay"><div className="spinner" /></div>
        ) : extinguishers.length === 0 ? (
          <div className="table-empty">
            <div className="table-empty-icon">Inventory</div>
            <div className="table-empty-text">No extinguishers found</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Serial Number</th>
                <th>Location</th>
                <th>Type</th>
                <th>Size</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {extinguishers.map((e) => (
                <tr key={e.id}>
                  <td><strong>{e.serial_number}</strong></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{e.location}</td>
                  <td>{e.type}</td>
                  <td>{e.size}</td>
                  <td style={{ color: isExpired(e.expiry_date) ? 'var(--danger)' : 'var(--text-primary)' }}>
                    {e.expiry_date}
                    {isExpired(e.expiry_date) && <span className="badge badge-danger" style={{ marginLeft: '6px', fontSize: '10px' }}>Expired</span>}
                  </td>
                  <td><span className={`badge ${STATUS_COLORS[e.status] || 'badge-secondary'}`}>{e.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/extinguishers/${e.id}`)}>View</button>
                      {user?.role === 'admin' && (
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/extinguishers/${e.id}/edit`)}>Edit</button>
                      )}
                      {user?.role === 'admin' && (
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(e)}>Delete</button>
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
          icon="Delete"
          title="Delete Fire Extinguisher"
          message={`Are you sure you want to delete extinguisher "${deleteTarget.serial_number}" at "${deleteTarget.location}"? This will also delete all related inspections and maintenance records.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
