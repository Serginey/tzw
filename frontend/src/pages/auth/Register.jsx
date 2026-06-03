import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import Alert from '../../components/common/Alert';

const getPasswordStrength = (password) => {
  let score = 0;
  if (!password) return 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVal, setPasswordVal] = useState('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const watchPassword = watch('password', '');

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      await registerUser({
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        confirm_password: data.confirm_password,
      });
      setSuccess('Account created successfully. Check your email for the OTP code.');
      setTimeout(() => navigate(`/verify-otp?email=${encodeURIComponent(data.email)}`), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(watchPassword);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">FE</div>
          <div className="auth-logo-text">
            <h1>FEMS</h1>
            <p>TZW LTD — Fire Safety Management</p>
          </div>
        </div>

        <h2 className="auth-title">Create an account</h2>
        <p className="auth-subtitle">Register to access the system</p>

        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} />}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group">
              <label className="form-label required" htmlFor="first_name">First Name</label>
              <input
                id="first_name"
                type="text"
                className={`form-control ${errors.first_name ? 'error' : ''}`}
                placeholder="John"
                autoComplete="given-name"
                {...register('first_name', {
                  required: 'First name is required',
                  maxLength: { value: 100, message: 'Max 100 characters' },
                  pattern: { value: /^[a-zA-Z\s'-]+$/, message: 'Invalid characters' },
                })}
              />
              {errors.first_name && <div className="form-error">{errors.first_name.message}</div>}
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="last_name">Last Name</label>
              <input
                id="last_name"
                type="text"
                className={`form-control ${errors.last_name ? 'error' : ''}`}
                placeholder="Doe"
                autoComplete="family-name"
                {...register('last_name', {
                  required: 'Last name is required',
                  maxLength: { value: 100, message: 'Max 100 characters' },
                })}
              />
              {errors.last_name && <div className="form-error">{errors.last_name.message}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label required" htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              type="email"
              className={`form-control ${errors.email ? 'error' : ''}`}
              placeholder="your@email.com"
              autoComplete="email"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' },
              })}
            />
            {errors.email && <div className="form-error">{errors.email.message}</div>}
          </div>

          <div className="form-group">
            <label className="form-label required" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              className={`form-control ${errors.password ? 'error' : ''}`}
              placeholder="Create a strong password"
              autoComplete="new-password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Must be at least 8 characters' },
                pattern: {
                  value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/,
                  message: 'Must include uppercase, lowercase, number and special character',
                },
              })}
            />
            {watchPassword && (
              <div className={`password-strength strength-${strength}`}>
                <div className="strength-bar"><div className="strength-fill" /></div>
                <span className="strength-text">Strength: {STRENGTH_LABELS[strength]}</span>
              </div>
            )}
            {errors.password && <div className="form-error">{errors.password.message}</div>}
          </div>

          <div className="form-group">
            <label className="form-label required" htmlFor="confirm-password">Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              className={`form-control ${errors.confirm_password ? 'error' : ''}`}
              placeholder="Confirm your password"
              autoComplete="new-password"
              {...register('confirm_password', {
                required: 'Confirm password is required',
                validate: (value) => value === watchPassword || 'Confirm password must match password',
              })}
            />
            {errors.confirm_password && <div className="form-error">{errors.confirm_password.message}</div>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            id="register-submit"
          >
            {loading ? <><span className="btn-spinner" />&nbsp;Creating account...</> : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer-text">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
