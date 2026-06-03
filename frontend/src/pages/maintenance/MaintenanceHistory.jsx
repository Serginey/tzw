import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Alert from '../../components/common/Alert';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import { useAuth } from '../../context/AuthContext';

export default function MaintenanceHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [alert, setAlert] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const LIMIT = 10;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/maintenance', {
        params: { from_date: fromDate || undefined, to_date: toDate || undefined, page, limit: LIMIT },
      });
      setLogs(data.data.logs);
      setTotal(data.data.total);
      setPages(data.data.pages);
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to load maintenance logs.' });
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await API.delete(`/maintenance/${deleteTarget.id}`);
      setAlert({ type: 'success', message: 'Maintenance log deleted successfully.' });
      setDeleteTarget(null);
      fetchLogs();
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
          <h1>Maintenance History</h1>
          <p>Complete history of all maintenance activities</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'inspector') && (
          <Link to="/maintenance/new" className="btn btn-primary">+ Log Maintenance</Link>
        )}
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="table-container">
        <div className="table-header">
          <span className="table-title">Maintenance Logs ({total})</span>
          <div className="table-actions">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <span>From:</span>
              <input type="date" className="form-control" style={{ width: 'auto', padding: '7px 10px' }} value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} />
              <span>To:</span>
              <input type="date" className="form-control" style={{ width: 'auto', padding: '7px 10px' }} value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-overlay"><div className="spinner" /></div>
        ) : logs.length === 0 ? (
          <div className="table-empty"><div className="table-empty-icon">Maintenance</div><div className="table-empty-text">No maintenance records found</div></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Extinguisher</th>
                <th>Location</th>
                <th>Inspector</th>
                <th>Date</th>
                <th>Action Taken</th>
                <th>Issues</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td><strong>{log.extinguisher?.serial_number}</strong></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{log.extinguisher?.location}</td>
                  <td>{log.inspector ? `${log.inspector.first_name} ${log.inspector.last_name}` : '—'}</td>
                  <td>{log.maintenance_date}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.action_taken}</td>
                  <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{log.issues_identified}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {(user?.role === 'admin' || (user?.role === 'inspector' && log.inspector_id === user?.id)) && (
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/maintenance/${log.id}/edit`)}>Edit</button>
                      )}
                      {user?.role === 'admin' && (
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(log)}>Delete</button>
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
          title="Delete Maintenance Log"
          message={`Delete this maintenance record from ${deleteTarget.maintenance_date}? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
