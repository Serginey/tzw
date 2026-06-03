import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../api/axios';

/**
 * AuthContext
 * SECURITY:
 *  - User data stored in React state only (memory) — not localStorage.
 *  - sessionStorage used only for non-sensitive UI hints (e.g., display name).
 *  - JWT lives in HttpOnly cookie managed by browser — inaccessible to JavaScript.
 *  - Logout clears all client-side state and triggers a full page redirect.
 */
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate session on app load. Public auth pages should never be blocked by a slow API.
  useEffect(() => {
    const validateSession = async () => {
      const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-otp'];
      if (publicPaths.some((path) => window.location.pathname.startsWith(path))) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await API.get('/auth/validate-token');
        if (data.success) setUser(data.data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    validateSession();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await API.post('/auth/logout');
    } finally {
      setUser(null);
      // SECURITY: Full page reload clears all cached state and triggers clean navigation
      window.location.href = '/login';
    }
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await API.post('/auth/register', formData);
    return data;
  }, []);

  const verifyEmail = useCallback(async (email, otp) => {
    const { data } = await API.post('/auth/verify-email', { email, otp });
    return data;
  }, []);

  const resendOtp = useCallback(async (email) => {
    const { data } = await API.post('/auth/resend-otp', { email });
    return data;
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, register, verifyEmail, resendOtp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
