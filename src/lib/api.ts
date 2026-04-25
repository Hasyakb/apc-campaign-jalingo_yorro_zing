import axios from 'axios';

const api = axios.create({
  withCredentials: true
});

// Request interceptor to add token to headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('apc_portal_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle session expiration (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('apc_portal_token');
      // Force reload to clear state and show login
      // but only if we are not already on the auth page
      if (!window.location.pathname.includes('auth')) {
         window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
