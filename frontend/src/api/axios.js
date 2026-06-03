import axios from 'axios';

/**
 * Axios instance configured for the FEMS API.
 * SECURITY:
 *  - withCredentials: true ensures HttpOnly cookies are sent automatically.
 *  - Tokens are NEVER stored in localStorage or sessionStorage.
 *  - 401 responses trigger a redirect to /login (session expired).
 */
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Send HttpOnly cookies with every request
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 5000,
});

// Response interceptor — redirect to login on 401
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear any non-sensitive client-side state
      sessionStorage.removeItem('fems_user');
      // Redirect to login — triggers clean state
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
