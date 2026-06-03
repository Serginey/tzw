import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#c0392b', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [compliance, setCompliance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashRes, compRes] = await Promise.all([
          API.get('/reports/dashboard'),
          API.get('/reports/compliance'),
        ]);
        setStats(dashRes.data.data);
        setCompliance(compRes.data.data);
      } catch {
        // Silently handle — user might not have report access
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="loading-overlay"><div className="spinner" /><span>Loading dashboard...</span></div>;

  const inspectionChartData = stats ? [
    { name: 'Pending', value: stats.pendingInspections, fill: '#f39c12' },
    { name: 'Completed', value: stats.completedInspections, fill: '#2ecc71' },
    { name: 'Overdue', value: stats.overdueInspections, fill: '#e74c3c' },
  ] : [];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.first_name}. Review extinguisher availability, inspections, and maintenance activity.</p>
        </div>
        {user?.role === 'admin' && (
          <Link to="/extinguishers/new" className="btn btn-primary">+ Add Extinguisher</Link>
        )}
      </div>

      {/* Stat Cards */}
      {stats && (
        <div className="stat-grid">
          <div className="stat-card primary">
            <div className="stat-icon">FE</div>
            <div className="stat-info">
              <div className="stat-label">Total Extinguishers</div>
              <div className="stat-value">{stats.totalExtinguishers}</div>
            </div>
          </div>
          <div className="stat-card warning">
            <div className="stat-icon">PI</div>
            <div className="stat-info">
              <div className="stat-label">Pending Inspections</div>
              <div className="stat-value">{stats.pendingInspections}</div>
            </div>
          </div>
          <div className="stat-card success">
            <div className="stat-icon">CI</div>
            <div className="stat-info">
              <div className="stat-label">Completed Inspections</div>
              <div className="stat-value">{stats.completedInspections}</div>
            </div>
          </div>
          <div className="stat-card danger">
            <div className="stat-icon">OI</div>
            <div className="stat-info">
              <div className="stat-label">Overdue Inspections</div>
              <div className="stat-value">{stats.overdueInspections}</div>
            </div>
          </div>
          <div className="stat-card danger">
            <div className="stat-icon">EX</div>
            <div className="stat-info">
              <div className="stat-label">Expired Extinguishers</div>
              <div className="stat-value">{stats.expiredExtinguishers}</div>
            </div>
          </div>
          <div className="stat-card info">
            <div className="stat-icon">30</div>
            <div className="stat-info">
              <div className="stat-label">Expiring Soon (30d)</div>
              <div className="stat-value">{stats.upcomingExpiries}</div>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="form-grid">
        <div className="chart-card">
          <div className="chart-title">Inspection Status Overview</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={inspectionChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#8b90a8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#8b90a8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#ffffff', border: '1px solid #e4e7ee', borderRadius: '8px', color: '#1f2937' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {inspectionChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {compliance && (
          <div className="chart-card">
            <div className="chart-title">Compliance Status</div>
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '36px', fontWeight: '800', color: 'var(--success)' }}>{compliance.complianceRate}</span>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Compliance Rate</div>
            </div>
            <div className="detail-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="detail-item">
                <div className="detail-label">Expired</div>
                <div className="detail-value" style={{ color: 'var(--danger)' }}>{compliance.expiredCount}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Expiring Soon</div>
                <div className="detail-value" style={{ color: 'var(--warning)' }}>{compliance.upcomingExpiryCount}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Maintenance */}
      {stats?.recentMaintenance?.length > 0 && (
        <div className="table-container" style={{ marginTop: '28px' }}>
          <div className="table-header">
            <span className="table-title">Recent Maintenance Activities</span>
            <Link to="/maintenance" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Extinguisher</th>
                <th>Location</th>
                <th>Action Taken</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentMaintenance.map((log) => (
                <tr key={log.id}>
                  <td><strong>{log.extinguisher?.serial_number}</strong></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{log.extinguisher?.location}</td>
                  <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.action_taken}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{log.maintenance_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ marginTop: '28px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Link to="/extinguishers" className="btn btn-secondary">View All Extinguishers</Link>
        <Link to="/inspections" className="btn btn-secondary">Manage Inspections</Link>
        <Link to="/maintenance" className="btn btn-secondary">Maintenance Logs</Link>
        {user?.role === 'admin' && (
          <Link to="/reports" className="btn btn-secondary">View Reports</Link>
        )}
      </div>
    </div>
  );
}
