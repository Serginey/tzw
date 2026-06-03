import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import API from '../../api/axios';
import Alert from '../../components/common/Alert';

export default function MaintenanceLog() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [extinguishers, setExtinguishers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      fire_extinguisher_id: searchParams.get('extinguisher') || '',
      maintenance_date: today,
    },
  });

  useEffect(() => {
    const fetchExtinguishers = async () => {
      try {
        const { data } = await API.get('/extinguishers?limit=100');
        setExtinguishers(data.data.extinguishers);
      } catch {
        setError('Failed to load extinguishers.');
      }
    };
    fetchExtinguishers();
  }, []);

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      await API.post('/maintenance', {
        ...data,
        fire_extinguisher_id: parseInt(data.fire_extinguisher_id),
      });
      navigate('/maintenance', { state: { success: 'Maintenance log created successfully.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create maintenance log.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Log Maintenance Activity</h1>
          <p>Record maintenance work performed on a fire extinguisher</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/maintenance')}>← Back</button>
      </div>

      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required" htmlFor="maint-ext">Fire Extinguisher</label>
              <select
                id="maint-ext"
                className={`form-control ${errors.fire_extinguisher_id ? 'error' : ''}`}
                {...register('fire_extinguisher_id', { required: 'Fire extinguisher is required' })}
              >
                <option value="">Select extinguisher</option>
                {extinguishers.map((e) => (
                  <option key={e.id} value={e.id}>{e.serial_number} — {e.location}</option>
                ))}
              </select>
              {errors.fire_extinguisher_id && <div className="form-error">⚠ {errors.fire_extinguisher_id.message}</div>}
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="maint-date">Maintenance Date</label>
              <input
                id="maint-date"
                type="date"
                max={today}
                className={`form-control ${errors.maintenance_date ? 'error' : ''}`}
                {...register('maintenance_date', {
                  required: 'Maintenance date is required',
                  validate: (v) => v <= today || 'Maintenance date cannot be in the future',
                })}
              />
              {errors.maintenance_date && <div className="form-error">⚠ {errors.maintenance_date.message}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label required" htmlFor="maint-action">Action Taken</label>
            <textarea
              id="maint-action"
              className={`form-control ${errors.action_taken ? 'error' : ''}`}
              placeholder="Describe the maintenance action(s) performed..."
              rows={4}
              {...register('action_taken', {
                required: 'Action taken is required',
                maxLength: { value: 2000, message: 'Max 2000 characters' },
              })}
            />
            {errors.action_taken && <div className="form-error">⚠ {errors.action_taken.message}</div>}
          </div>

          <div className="form-group">
            <label className="form-label required" htmlFor="maint-issues">Issues Identified</label>
            <textarea
              id="maint-issues"
              className={`form-control ${errors.issues_identified ? 'error' : ''}`}
              placeholder="List any issues or problems identified during maintenance (enter 'None' if no issues)..."
              rows={3}
              {...register('issues_identified', {
                required: 'Issues identified is required',
                maxLength: { value: 2000, message: 'Max 2000 characters' },
              })}
            />
            {errors.issues_identified && <div className="form-error">⚠ {errors.issues_identified.message}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="maint-notes">Notes &amp; Recommendations</label>
            <textarea
              id="maint-notes"
              className="form-control"
              placeholder="Optional: Add any recommendations or follow-up notes..."
              rows={3}
              {...register('notes_recommendations', { maxLength: { value: 2000, message: 'Max 2000 characters' } })}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/maintenance')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="log-maintenance-submit">
              {loading ? <><span className="btn-spinner" />&nbsp;Saving...</> : '🔧 Log Maintenance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
