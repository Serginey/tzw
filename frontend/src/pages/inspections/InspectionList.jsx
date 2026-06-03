import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Alert from '../../components/common/Alert';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import { useAuth } from '../../context/AuthContext';

const STATUS_COLORS = { Scheduled: 'badge-info', Completed: 'badge-success', Overdue: 'badge-danger', Cancelled: 'badge-secondary' };

export default function InspectionList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inspections, setInspections] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [alert, setAlert] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const LIMIT = 10;

  const fetchInspections = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/inspections', {
        params: { status: statusFilter || undefined, page, limit: LIMIT },
      });
      setInspections(data.data.inspections);
      setTotal(data.data.total);
      setPages(data.data.pages);
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to load inspections.' });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { fetchInspections(); }, [fetchInspections]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await API.delete(`/inspections/${deleteTarget.id}`);
      setAlert({ type: 'success', message: 'Inspection deleted successfully.' });
      setDeleteTarget(null);
      fetchInspections();
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to delete.' });
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Inspections</h1>
          <p>View and manage all scheduled inspections</p>
        </div>
        {user?.role !== 'inspector' && (
          <Link to="/inspections/new" className="btn btn-primary">+ Schedule Inspection</Link>
        )}
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="table-container">
        <div className="table-header">
          <span className="table-title">{user?.role === 'user' ? 'My Inspections' : 'All Inspections'} ({total})</span>
          <div className="table-actions">
            <select className="filter-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-overlay"><div className="spinner" /></div>
        ) : inspections.length === 0 ? (
          <div className="table-empty"><div className="table-empty-icon">Inspections</div><div className="table-empty-text">No inspections found</div></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Extinguisher</th>
                <th>Location</th>
                <th>Date</th>
                <th>Time</th>
                <th>Inspector</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inspections.map((insp) => (
                <tr key={insp.id}>
                  <td><strong>{insp.extinguisher?.serial_number}</strong></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{insp.extinguisher?.location}</td>
                  <td>{insp.scheduled_date}</td>
                  <td>{insp.scheduled_time}</td>
                  <td>{insp.inspector ? `${insp.inspector.first_name} ${insp.inspector.last_name}` : '—'}</td>
                  <td><span className={`badge ${STATUS_COLORS[insp.status] || 'badge-secondary'}`}>{insp.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {(user?.role === 'admin' || (user?.role === 'inspector' && insp.inspector_id === user?.id)) && (
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/inspections/${insp.id}/edit`)}>Edit</button>
                      )}
                      {user?.role === 'admin' && (
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(insp)}>Delete</button>
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
          title="Delete Inspection"
          message={`Delete this inspection scheduled for ${deleteTarget.scheduled_date}? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
