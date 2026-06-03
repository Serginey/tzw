import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Alert from '../../components/common/Alert';

export default function UserProfile() {
  const { user, setUser } = useAuth();
  const [alert, setAlert] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const { register: regProfile, handleSubmit: handleProfile, reset: resetProfile, formState: { errors: profileErrors } } = useForm();
  const { register: regPass, handleSubmit: handlePass, reset: resetPass, formState: { errors: passErrors }, watch } = useForm();

  useEffect(() => {
    if (user) {
      resetProfile({ first_name: user.first_name, last_name: user.last_name });
    }
  }, [user, resetProfile]);

  const onProfileSubmit = async (data) => {
    setProfileLoading(true);
    setAlert(null);
    try {
      const res = await API.put('/users/profile', data);
      setUser(res.data.data.user);
      setAlert({ type: 'success', message: 'Profile updated successfully.' });
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setPasswordLoading(true);
    setAlert(null);
    try {
      await API.put('/users/change-password', { current_password: data.current_password, new_password: data.new_password });
      setAlert({ type: 'success', message: 'Password changed successfully. Please log in again with your new password.' });
      resetPass();
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to change password.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const watchNewPass = watch('new_password', '');

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1>My Profile</h1>
          <p>Manage your account information</p>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Profile Card */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '800', color: 'white', boxShadow: 'var(--shadow-glow)', flexShrink: 0 }}>
          {user?.first_name?.[0]}{user?.last_name?.[0]}
        </div>
        <div>
          <div style={{ fontSize: '22px', fontWeight: '700' }}>{user?.first_name} {user?.last_name}</div>
          <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>{user?.email}</div>
          <span className={`badge role-${user?.role}`} style={{ marginTop: '8px' }}>{user?.role}</span>
        </div>
      </div>

      {/* Profile Form */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header"><div className="card-title">Personal Information</div></div>
        <form onSubmit={handleProfile(onProfileSubmit)} noValidate>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required" htmlFor="prof-first">First Name</label>
              <input
                id="prof-first"
                type="text"
                className={`form-control ${profileErrors.first_name ? 'error' : ''}`}
                {...regProfile('first_name', { required: 'First name is required', maxLength: { value: 100, message: 'Max 100 chars' } })}
              />
              {profileErrors.first_name && <div className="form-error">{profileErrors.first_name.message}</div>}
            </div>
            <div className="form-group">
              <label className="form-label required" htmlFor="prof-last">Last Name</label>
              <input
                id="prof-last"
                type="text"
                className={`form-control ${profileErrors.last_name ? 'error' : ''}`}
                {...regProfile('last_name', { required: 'Last name is required', maxLength: { value: 100, message: 'Max 100 chars' } })}
              />
              {profileErrors.last_name && <div className="form-error">{profileErrors.last_name.message}</div>}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" value={user?.email || ''} disabled />
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>Contact an administrator to change your email address.</div>
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <input type="text" className="form-control" value={user?.role || ''} disabled />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={profileLoading} id="save-profile-submit">
              {profileLoading ? <><span className="btn-spinner" />&nbsp;Saving...</> : '✓ Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="card">
        <div className="card-header"><div className="card-title">Change Password</div></div>
        <form onSubmit={handlePass(onPasswordSubmit)} noValidate>
          <div className="form-group">
            <label className="form-label required" htmlFor="cur-pass">Current Password</label>
            <input
              id="cur-pass"
              type="password"
              className={`form-control ${passErrors.current_password ? 'error' : ''}`}
              autoComplete="current-password"
              {...regPass('current_password', { required: 'Current password is required' })}
            />
            {passErrors.current_password && <div className="form-error">{passErrors.current_password.message}</div>}
          </div>
          <div className="form-group">
            <label className="form-label required" htmlFor="new-pass">New Password</label>
            <input
              id="new-pass"
              type="password"
              className={`form-control ${passErrors.new_password ? 'error' : ''}`}
              autoComplete="new-password"
              {...regPass('new_password', {
                required: 'New password is required',
                minLength: { value: 8, message: 'At least 8 characters' },
                pattern: {
                  value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/,
                  message: 'Must include uppercase, lowercase, number and special character',
                },
              })}
            />
            {passErrors.new_password && <div className="form-error">{passErrors.new_password.message}</div>}
          </div>
          <div className="form-group">
            <label className="form-label required" htmlFor="confirm-pass">Confirm New Password</label>
            <input
              id="confirm-pass"
              type="password"
              className={`form-control ${passErrors.confirm_password ? 'error' : ''}`}
              autoComplete="new-password"
              {...regPass('confirm_password', {
                required: 'Please confirm your new password',
                validate: (v) => v === watchNewPass || 'Passwords do not match',
              })}
            />
            {passErrors.confirm_password && <div className="form-error">{passErrors.confirm_password.message}</div>}
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={passwordLoading} id="change-password-submit">
              {passwordLoading ? <><span className="btn-spinner" />&nbsp;Changing...</> : '🔒 Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
