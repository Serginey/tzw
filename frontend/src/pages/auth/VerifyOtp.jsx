import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import Alert from '../../components/common/Alert';

export default function VerifyOtp() {
  const { verifyEmail, resendOtp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const defaultEmail = searchParams.get('email') || '';
  const { register, handleSubmit, getValues, formState: { errors } } = useForm({
    defaultValues: { email: defaultEmail, otp: '' },
  });

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await verifyEmail(data.email, data.otp);
      setSuccess('Email verified successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    const email = getValues('email');
    if (!email) {
      setError('Enter your email before requesting a new OTP.');
      return;
    }

    setError('');
    setSuccess('');
    setResending(true);
    try {
      await resendOtp(email);
      setSuccess('A new OTP has been sent if this account still needs verification.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">FE</div>
          <div className="auth-logo-text">
            <h1>FEMS</h1>
            <p>TZW LTD - Fire Safety Management</p>
          </div>
        </div>

        <h2 className="auth-title">Verify your email</h2>
        <p className="auth-subtitle">Enter the 6 digit OTP sent after signup</p>

        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} />}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label className="form-label required" htmlFor="verify-email">Email Address</label>
            <input
              id="verify-email"
              type="email"
              className={`form-control ${errors.email ? 'error' : ''}`}
              autoComplete="email"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' },
              })}
            />
            {errors.email && <div className="form-error">{errors.email.message}</div>}
          </div>

          <div className="form-group">
            <label className="form-label required" htmlFor="otp">OTP Code</label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              className={`form-control ${errors.otp ? 'error' : ''}`}
              placeholder="123456"
              autoComplete="one-time-code"
              {...register('otp', {
                required: 'OTP is required',
                pattern: { value: /^\d{6}$/, message: 'OTP must be 6 digits' },
              })}
            />
            {errors.otp && <div className="form-error">{errors.otp.message}</div>}
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <><span className="btn-spinner" />&nbsp;Verifying...</> : 'Verify Email'}
          </button>

          <button type="button" className="btn btn-secondary btn-full" disabled={resending} onClick={handleResend} style={{ marginTop: '12px' }}>
            {resending ? 'Sending...' : 'Resend OTP'}
          </button>
        </form>

        <div className="auth-footer-text">
          Already verified? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
