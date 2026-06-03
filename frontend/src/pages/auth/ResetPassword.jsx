import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import API from '../../api/axios';
import Alert from '../../components/common/Alert';
import LoadingButton from '../../components/common/LoadingButton';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');

    if (!token) {
      setError('Reset token is missing. Please request a new password reset link.');
      return;
    }

    setLoading(true);
    try {
      await API.post('/auth/reset-password', { token, password: data.password });
      setSuccess('Password reset successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed. Please request a new reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">FE</div>
          <div className="auth-logo-text">
            <h1>FEMS</h1>
            <p>TZW LTD</p>
          </div>
        </div>

        <h2 className="auth-title">Set a new password</h2>
        <p className="auth-subtitle">Choose a strong password for your account.</p>

        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} />}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label className="form-label required" htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              type="password"
              className={`form-control ${errors.password ? 'error' : ''}`}
              autoComplete="new-password"
              placeholder="Create a strong password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Must be at least 8 characters' },
                pattern: {
                  value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/,
                  message: 'Must include uppercase, lowercase, number and special character',
                },
              })}
            />
            {errors.password && <div className="form-error">{errors.password.message}</div>}
          </div>

          <div className="form-group">
            <label className="form-label required" htmlFor="confirm-password">Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
              autoComplete="new-password"
              placeholder="Repeat your new password"
              {...register('confirmPassword', {
                required: 'Confirm password is required',
                validate: (value) => value === password || 'Passwords do not match',
              })}
            />
            {errors.confirmPassword && <div className="form-error">{errors.confirmPassword.message}</div>}
          </div>

          <LoadingButton
            type="submit"
            loading={loading}
            loadingText="Resetting..."
            className="btn btn-primary btn-full btn-lg"
          >
            Reset Password
          </LoadingButton>
        </form>

        <div className="auth-footer-text">
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    </div>
  );
}
