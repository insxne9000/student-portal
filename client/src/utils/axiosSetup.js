import axios from 'axios';

// Configure the base URL
const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
axios.defaults.baseURL = apiBaseUrl;

// Request Interceptor: Attach Token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const adminToken = localStorage.getItem('adminToken');
    
    if (adminToken) {
      config.headers['x-mock-role'] = 'admin';
    } else if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401s
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('token');
      // Force redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios;
