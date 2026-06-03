import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
import Alert from '../../components/common/Alert';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';

const STATUS_COLORS = { Active: 'badge-success', Expired: 'badge-danger', 'Under Maintenance': 'badge-warning', 'Needs Inspection': 'badge-info' };

export default function ExtinguisherDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [extinguisher, setExtinguisher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get(`/extinguishers/${id}`);
        setExtinguisher(data.data.extinguisher);
      } catch (err) {
        setAlert({ type: 'danger', message: err.response?.data?.message || 'Extinguisher not found.' });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await API.delete(`/extinguishers/${id}`);
      navigate('/extinguishers', { state: { success: 'Extinguisher deleted successfully.' } });
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to delete.' });
      setShowDelete(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1>{extinguisher?.serial_number}</h1>
          <p>{extinguisher?.location}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/extinguishers')}>Back</button>
          {user?.role === 'admin' && (
            <Link to={`/extinguishers/${id}/edit`} className="btn btn-secondary">Edit</Link>
          )}
          {user?.role === 'admin' && (
            <button className="btn btn-danger" onClick={() => setShowDelete(true)}>Delete</button>
          )}
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {extinguisher && (
        <>
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <div className="card-title">Extinguisher Details</div>
              <span className={`badge ${STATUS_COLORS[extinguisher.status]}`}>{extinguisher.status}</span>
            </div>
            <div className="detail-grid">
              <div className="detail-item"><div className="detail-label">Serial Number</div><div className="detail-value">{extinguisher.serial_number}</div></div>
              <div className="detail-item"><div className="detail-label">Location</div><div className="detail-value">{extinguisher.location}</div></div>
              <div className="detail-item"><div className="detail-label">Type</div><div className="detail-value">{extinguisher.type}</div></div>
              <div className="detail-item"><div className="detail-label">Size</div><div className="detail-value">{extinguisher.size}</div></div>
              <div className="detail-item"><div className="detail-label">Installation Date</div><div className="detail-value">{extinguisher.installation_date}</div></div>
              <div className="detail-item">
                <div className="detail-label">Expiry Date</div>
                <div className="detail-value" style={{ color: extinguisher.expiry_date < new Date().toISOString().split('T')[0] ? 'var(--danger)' : 'var(--text-primary)' }}>
                  {extinguisher.expiry_date}
                  {extinguisher.expiry_date < new Date().toISOString().split('T')[0] && ' EXPIRED'}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Inspections */}
          {extinguisher.inspections && (
            <div className="table-container" style={{ marginBottom: '24px' }}>
              <div className="table-header">
                <span className="table-title">Recent Inspections</span>
                {user?.role !== 'inspector' && (
                  <Link to={`/inspections/new?extinguisher=${id}`} className="btn btn-secondary btn-sm">Schedule Inspection</Link>
                )}
              </div>
              {extinguisher.inspections.length === 0 ? (
                <div className="table-empty"><div className="table-empty-icon">Inspections</div><div className="table-empty-text">No inspections yet</div></div>
              ) : (
                <table className="data-table">
                  <thead><tr><th>Date</th><th>Time</th><th>Status</th><th>Notes</th></tr></thead>
                  <tbody>
                    {extinguisher.inspections.map((insp) => (
                      <tr key={insp.id}>
                        <td>{insp.scheduled_date}</td>
                        <td>{insp.scheduled_time}</td>
                        <td><span className="badge badge-info">{insp.status}</span></td>
                        <td style={{ color: 'var(--text-secondary)' }}>{insp.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Recent Maintenance */}
          {extinguisher.maintenance_logs && (
            <div className="table-container">
              <div className="table-header">
                <span className="table-title">Recent Maintenance</span>
                <Link to={`/maintenance/new?extinguisher=${id}`} className="btn btn-secondary btn-sm">Log Maintenance</Link>
              </div>
              {extinguisher.maintenance_logs.length === 0 ? (
                <div className="table-empty"><div className="table-empty-icon">Maintenance</div><div className="table-empty-text">No maintenance records yet</div></div>
              ) : (
                <table className="data-table">
                  <thead><tr><th>Date</th><th>Action Taken</th><th>Issues</th></tr></thead>
                  <tbody>
                    {extinguisher.maintenance_logs.map((log) => (
                      <tr key={log.id}>
                        <td>{log.maintenance_date}</td>
                        <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.action_taken}</td>
                        <td style={{ color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.issues_identified}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      {showDelete && (
        <ConfirmDialog
          icon="Delete"
          title="Delete Extinguisher"
          message={`Delete extinguisher "${extinguisher?.serial_number}"? This will remove all associated inspection and maintenance records permanently.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
