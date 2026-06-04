import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import API from '../../api/axios';
import Alert from '../../components/common/Alert';

const TYPES = ['Water', 'CO2', 'Foam', 'Dry Chemical'];
const SIZES = ['1.5 lb', '5 lb', '9 lb', '12 lb'];
const STATUSES = ['Active', 'Expired', 'Under Maintenance', 'Decommissioned'];

export default function ExtinguisherEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const watchInstall = watch('installation_date');
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get(`/extinguishers/${id}`);
        const e = data.data.extinguisher;
        reset({
          serial_number: e.serial_number,
          location: e.location,
          type: e.type,
          size: e.size,
          installation_date: e.installation_date,
          expiry_date: e.expiry_date,
          status: e.status,
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load extinguisher.');
      } finally {
        setFetchLoading(false);
      }
    };
    fetch();
  }, [id, reset]);

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      await API.put(`/extinguishers/${id}`, data);
      navigate('/extinguishers', { state: { success: 'Extinguisher updated successfully.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <div className="loading-overlay"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Edit Fire Extinguisher</h1>
          <p>Update extinguisher information</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/extinguishers')}>← Back</button>
      </div>

      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required" htmlFor="edit-serial">Serial Number</label>
              <input id="edit-serial" type="text" className={`form-control ${errors.serial_number ? 'error' : ''}`}
                {...register('serial_number', { required: 'Serial number is required' })} />
              {errors.serial_number && <div className="form-error">{errors.serial_number.message}</div>}
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="edit-location">Location</label>
              <input id="edit-location" type="text" className={`form-control ${errors.location ? 'error' : ''}`}
                {...register('location', { required: 'Location is required' })} />
              {errors.location && <div className="form-error">{errors.location.message}</div>}
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="edit-type">Type</label>
              <select id="edit-type" className="form-control" {...register('type', { required: 'Type is required' })}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="edit-size">Size</label>
              <select id="edit-size" className="form-control" {...register('size', { required: 'Size is required' })}>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="edit-install">Installation Date</label>
              <input id="edit-install" type="date" className={`form-control ${errors.installation_date ? 'error' : ''}`} max={today}
                {...register('installation_date', {
                  required: 'Installation date is required',
                  validate: (val) => val <= today || 'Installation date cannot be in the future',
                })} />
              {errors.installation_date && <div className="form-error">{errors.installation_date.message}</div>}
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="edit-expiry">Expiry Date</label>
              <input id="edit-expiry" type="date" className={`form-control ${errors.expiry_date ? 'error' : ''}`}
                min={watchInstall ? new Date(new Date(watchInstall).getTime() + 86400000).toISOString().split('T')[0] : undefined}
                {...register('expiry_date', {
                  required: 'Expiry date is required',
                  validate: (val) => val > watchInstall || 'Expiry must be after installation date',
                })} />
              {errors.expiry_date && <div className="form-error">{errors.expiry_date.message}</div>}
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="edit-status">Status</label>
              <select id="edit-status" className="form-control" {...register('status', { required: true })}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/extinguishers')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="edit-extinguisher-submit">
              {loading ? <><span className="btn-spinner" />&nbsp;Saving...</> : '✓ Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
