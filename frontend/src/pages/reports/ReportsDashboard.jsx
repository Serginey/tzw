import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Alert from '../../components/common/Alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ReportsDashboard() {
  const [inventory, setInventory] = useState(null);
  const [inspections, setInspections] = useState(null);
  const [compliance, setCompliance] = useState(null);
  const [maintenance, setMaintenance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [exportLoading, setExportLoading] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [invRes, inspRes, compRes, maintRes] = await Promise.all([
          API.get('/reports/inventory'),
          API.get('/reports/inspections'),
          API.get('/reports/compliance'),
          API.get('/reports/maintenance'),
        ]);
        setInventory(invRes.data.data);
        setInspections(inspRes.data.data);
        setCompliance(compRes.data.data);
        setMaintenance(maintRes.data.data);
      } catch (err) {
        setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to load reports.' });
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleExport = async (format, type) => {
    setExportLoading(`${format}-${type}`);
    try {
      const response = await API.get(`/reports/export/${format}?type=${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      setAlert({ type: 'danger', message: 'Failed to export report.' });
    } finally {
      setExportLoading('');
    }
  };

  if (loading) return <div className="loading-overlay"><div className="spinner" /><span>Loading reports...</span></div>;

  const invTypeData = inventory?.byType?.map((t) => ({ name: t.type, value: parseInt(t.count) })) || [];
  const invStatusData = inventory?.byStatus?.map((s) => ({ name: s.status, value: parseInt(s.count) })) || [];
  const COLORS = ['#c0392b', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Reports &amp; Analytics</h1>
          <p>Comprehensive fire safety performance overview for TZW LTD</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => handleExport('csv', 'inventory')} disabled={exportLoading === 'csv-inventory'}>
            {exportLoading === 'csv-inventory' ? '...' : '⬇ CSV Inventory'}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => handleExport('pdf', 'inventory')} disabled={exportLoading === 'pdf-inventory'}>
            {exportLoading === 'pdf-inventory' ? '...' : '📄 PDF Inventory'}
          </button>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Inventory Section */}
      {inventory && (
        <>
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header"><div className="card-title">🧯 Inventory Summary</div></div>
            <div className="stat-grid" style={{ marginBottom: 0 }}>
              <div className="stat-card primary"><div className="stat-icon">📦</div><div className="stat-info"><div className="stat-label">Total</div><div className="stat-value">{inventory.total}</div></div></div>
              <div className="stat-card success"><div className="stat-icon">✅</div><div className="stat-info"><div className="stat-label">Active</div><div className="stat-value">{inventory.byStatus?.find(s=>s.status==='Active')?.count || 0}</div></div></div>
              <div className="stat-card danger"><div className="stat-icon">⚠️</div><div className="stat-info"><div className="stat-label">Expired</div><div className="stat-value">{inventory.byStatus?.find(s=>s.status==='Expired')?.count || 0}</div></div></div>
              <div className="stat-card warning"><div className="stat-icon">🔧</div><div className="stat-info"><div className="stat-label">Under Maintenance</div><div className="stat-value">{inventory.byStatus?.find(s=>s.status==='Under Maintenance')?.count || 0}</div></div></div>
            </div>
          </div>

          <div className="form-grid" style={{ marginBottom: '24px' }}>
            <div className="chart-card">
              <div className="chart-title">By Type</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={invTypeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#8b90a8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#8b90a8', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#1a1d27', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#f0f2f8' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {invTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <div className="chart-title">By Status</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={invStatusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#8b90a8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#8b90a8', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#1a1d27', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#f0f2f8' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {invStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Inspection Report */}
      {inspections && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <div className="card-title">🔍 Inspection Report</div>
            <button className="btn btn-secondary btn-sm" onClick={() => handleExport('csv', 'inspections')}>⬇ Export CSV</button>
          </div>
          <div className="stat-grid" style={{ marginBottom: 0 }}>
            <div className="stat-card warning"><div className="stat-icon">⏳</div><div className="stat-info"><div className="stat-label">Pending</div><div className="stat-value">{inspections.pending}</div></div></div>
            <div className="stat-card success"><div className="stat-icon">✅</div><div className="stat-info"><div className="stat-label">Completed</div><div className="stat-value">{inspections.completed}</div></div></div>
            <div className="stat-card danger"><div className="stat-icon">🚨</div><div className="stat-info"><div className="stat-label">Overdue</div><div className="stat-value">{inspections.overdue}</div></div></div>
          </div>
        </div>
      )}

      {/* Compliance Report */}
      {compliance && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header"><div className="card-title">⚖️ Compliance Report</div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', fontWeight: '800', color: parseFloat(compliance.complianceRate) >= 80 ? 'var(--success)' : 'var(--danger)' }}>
                {compliance.complianceRate}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Overall Compliance Rate</div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="detail-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="detail-item"><div className="detail-label">Expired</div><div className="detail-value" style={{ color: 'var(--danger)' }}>{compliance.expiredCount}</div></div>
                <div className="detail-item"><div className="detail-label">Expiring Soon (30d)</div><div className="detail-value" style={{ color: 'var(--warning)' }}>{compliance.upcomingExpiryCount}</div></div>
                <div className="detail-item"><div className="detail-label">Active &amp; Compliant</div><div className="detail-value" style={{ color: 'var(--success)' }}>{compliance.active}</div></div>
              </div>
            </div>
          </div>

          {compliance.upcomingExpiry?.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--warning)' }}>⚠️ Expiring Within 30 Days</div>
              <table className="data-table">
                <thead><tr><th>Serial</th><th>Location</th><th>Type</th><th>Expiry Date</th></tr></thead>
                <tbody>
                  {compliance.upcomingExpiry.slice(0, 5).map((e) => (
                    <tr key={e.id}>
                      <td><strong>{e.serial_number}</strong></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{e.location}</td>
                      <td>{e.type}</td>
                      <td style={{ color: 'var(--warning)' }}>{e.expiry_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Maintenance Report */}
      {maintenance && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">🔧 Maintenance Report</div>
            <button className="btn btn-secondary btn-sm" onClick={() => handleExport('csv', 'maintenance')}>⬇ Export CSV</button>
          </div>
          <div className="detail-grid" style={{ marginBottom: '20px' }}>
            <div className="detail-item"><div className="detail-label">Total Logs</div><div className="detail-value">{maintenance.total}</div></div>
          </div>
          {maintenance.recent?.length > 0 && (
            <table className="data-table">
              <thead><tr><th>Extinguisher</th><th>Date</th><th>Action</th><th>Issues</th></tr></thead>
              <tbody>
                {maintenance.recent.map((log) => (
                  <tr key={log.id}>
                    <td><strong>#{log.fire_extinguisher_id}</strong></td>
                    <td>{log.maintenance_date}</td>
                    <td style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.action_taken}</td>
                    <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{log.issues_identified}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
