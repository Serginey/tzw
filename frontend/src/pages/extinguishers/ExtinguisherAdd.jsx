import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import API from '../../api/axios';
import Alert from '../../components/common/Alert';

const TYPES = ['Water', 'CO2', 'Foam', 'Dry Chemical'];
const SIZES = ['1.5 lb', '5 lb', '9 lb', '12 lb'];
const STATUSES = ['Active', 'Expired', 'Under Maintenance', 'Decommissioned'];

export default function ExtinguisherAdd() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { status: 'Active' },
  });

  const watchInstall = watch('installation_date');

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      await API.post('/extinguishers', data);
      navigate('/extinguishers', { state: { success: 'Fire extinguisher added successfully.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add extinguisher.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Add Fire Extinguisher</h1>
          <p>Register a new fire extinguisher to the inventory</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/extinguishers')}>← Back</button>
      </div>

      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required" htmlFor="serial_number">Serial Number</label>
              <input
                id="serial_number"
                type="text"
                className={`form-control ${errors.serial_number ? 'error' : ''}`}
                placeholder="e.g. FE-2026-001"
                {...register('serial_number', { required: 'Serial number is required', maxLength: { value: 100, message: 'Max 100 chars' } })}
              />
              {errors.serial_number && <div className="form-error">{errors.serial_number.message}</div>}
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="location">Location</label>
              <input
                id="location"
                type="text"
                className={`form-control ${errors.location ? 'error' : ''}`}
                placeholder="e.g. Building A - Floor 2 - Server Room"
                {...register('location', { required: 'Location is required' })}
              />
              {errors.location && <div className="form-error">{errors.location.message}</div>}
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="type">Type</label>
              <select
                id="type"
                className={`form-control ${errors.type ? 'error' : ''}`}
                {...register('type', { required: 'Type is required' })}
              >
                <option value="">Select type</option>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.type && <div className="form-error">{errors.type.message}</div>}
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="size">Size</label>
              <select
                id="size"
                className={`form-control ${errors.size ? 'error' : ''}`}
                {...register('size', { required: 'Size is required' })}
              >
                <option value="">Select size</option>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.size && <div className="form-error">{errors.size.message}</div>}
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="installation_date">Installation Date</label>
              <input
                id="installation_date"
                type="date"
                className={`form-control ${errors.installation_date ? 'error' : ''}`}
                max={today}
                {...register('installation_date', { required: 'Installation date is required' })}
              />
              {errors.installation_date && <div className="form-error">{errors.installation_date.message}</div>}
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="expiry_date">Expiry Date</label>
              <input
                id="expiry_date"
                type="date"
                className={`form-control ${errors.expiry_date ? 'error' : ''}`}
                min={watchInstall ? new Date(new Date(watchInstall).getTime() + 86400000).toISOString().split('T')[0] : today}
                {...register('expiry_date', {
                  required: 'Expiry date is required',
                  validate: (val) => {
                    if (!watchInstall) return true;
                    return val > watchInstall || 'Expiry date must be after installation date';
                  },
                })}
              />
              {errors.expiry_date && <div className="form-error">{errors.expiry_date.message}</div>}
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="status">Status</label>
              <select
                id="status"
                className={`form-control ${errors.status ? 'error' : ''}`}
                {...register('status', { required: 'Status is required' })}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.status && <div className="form-error">{errors.status.message}</div>}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/extinguishers')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="add-extinguisher-submit">
              {loading ? <><span className="btn-spinner" />&nbsp;Saving...</> : 'Add Extinguisher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
