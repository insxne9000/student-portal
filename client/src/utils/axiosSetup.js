import axios from 'axios';

// Configure the base URL
const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
axios.defaults.baseURL = apiBaseUrl;

// Request Interceptor: Attach Correct Token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const adminToken = localStorage.getItem('adminToken');
    const currentPath = window.location.pathname;

    // Use admin auth only on admin routes
    if (currentPath.startsWith('/admin') && adminToken) {
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
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');

      // Redirect based on current route
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      } else {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axios;