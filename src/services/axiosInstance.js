import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5500/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor – always attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor – only clear on 401
let isRedirecting = false;
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isRedirecting) {
      isRedirecting = true;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('auth:logout'));
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      setTimeout(() => { isRedirecting = false; }, 1000);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;