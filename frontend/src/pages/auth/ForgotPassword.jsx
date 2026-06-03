import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import API from '../../api/axios';
import Alert from '../../components/common/Alert';

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email: data.email });
      setSent(true);
    } catch {
      // Always show success — prevents email enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">FE</div>
          <div className="auth-logo-text"><h1>FEMS</h1><p>TZW LTD</p></div>
        </div>

        <h2 className="auth-title">Reset your password</h2>
        <p className="auth-subtitle">Enter your email and we'll send a reset link if an account exists.</p>

        {sent ? (
          <Alert
            type="success"
            message="If an account with that email exists, a password reset link has been sent. Please check your inbox."
          />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-group">
              <label className="form-label required" htmlFor="fp-email">Email Address</label>
              <input
                id="fp-email"
                type="email"
                className={`form-control ${errors.email ? 'error' : ''}`}
                placeholder="your@email.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                })}
              />
              {errors.email && <div className="form-error">{errors.email.message}</div>}
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <><span className="btn-spinner" />&nbsp;Sending...</> : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="auth-footer-text">
          <Link to="/login">← Back to login</Link>
        </div>
      </div>
    </div>
  );
}
