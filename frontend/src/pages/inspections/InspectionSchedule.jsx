import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import API from '../../api/axios';
import Alert from '../../components/common/Alert';

export default function InspectionSchedule() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [extinguishers, setExtinguishers] = useState([]);
  const [inspectors, setInspectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      fire_extinguisher_id: searchParams.get('extinguisher') || '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [extRes, inspRes] = await Promise.all([
          API.get('/extinguishers?limit=100'),
          API.get('/users/inspectors'),
        ]);
        setExtinguishers(extRes.data.data.extinguishers);
        setInspectors(inspRes.data.data.inspectors);
      } catch {
        setError('Failed to load required data.');
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      await API.post('/inspections', {
        ...data,
        fire_extinguisher_id: parseInt(data.fire_extinguisher_id),
        inspector_id: parseInt(data.inspector_id),
      });
      navigate('/inspections', { state: { success: 'Inspection scheduled successfully. Inspector has been notified.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule inspection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Schedule Inspection</h1>
          <p>Plan a new fire extinguisher inspection</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/inspections')}>← Back</button>
      </div>

      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required" htmlFor="sched-ext">Fire Extinguisher</label>
              <select
                id="sched-ext"
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
              <label className="form-label required" htmlFor="sched-inspector">Inspector</label>
              <select
                id="sched-inspector"
                className={`form-control ${errors.inspector_id ? 'error' : ''}`}
                {...register('inspector_id', { required: 'Inspector is required' })}
              >
                <option value="">Select inspector</option>
                {inspectors.map((i) => (
                  <option key={i.id} value={i.id}>{i.first_name} {i.last_name}</option>
                ))}
              </select>
              {errors.inspector_id && <div className="form-error">⚠ {errors.inspector_id.message}</div>}
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="sched-date">Inspection Date</label>
              <input
                id="sched-date"
                type="date"
                min={today}
                className={`form-control ${errors.scheduled_date ? 'error' : ''}`}
                {...register('scheduled_date', {
                  required: 'Inspection date is required',
                  validate: (v) => v >= today || 'Inspection date cannot be in the past',
                })}
              />
              {errors.scheduled_date && <div className="form-error">⚠ {errors.scheduled_date.message}</div>}
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="sched-time">Inspection Time</label>
              <input
                id="sched-time"
                type="time"
                className={`form-control ${errors.scheduled_time ? 'error' : ''}`}
                {...register('scheduled_time', { required: 'Inspection time is required' })}
              />
              {errors.scheduled_time && <div className="form-error">⚠ {errors.scheduled_time.message}</div>}
            </div>

          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="sched-notes">Notes</label>
            <textarea
              id="sched-notes"
              className="form-control"
              placeholder="Add any relevant notes about this inspection..."
              rows={4}
              {...register('notes', { maxLength: { value: 1000, message: 'Max 1000 characters' } })}
            />
            {errors.notes && <div className="form-error">⚠ {errors.notes.message}</div>}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/inspections')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="schedule-inspection-submit">
              {loading ? <><span className="btn-spinner" />&nbsp;Scheduling...</> : '📅 Schedule Inspection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
