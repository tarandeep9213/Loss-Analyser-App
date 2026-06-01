import axios from 'axios';

const DEFAULT_API_BASE_URL = 'https://floodbot.cnc.claims:7001';

// Create a custom event for session timeout
export const SESSION_TIMEOUT_EVENT = 'sessionTimeout';
export const triggerSessionTimeout = () => {
  window.dispatchEvent(new Event(SESSION_TIMEOUT_EVENT));
};

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Disabled 401/403 interceptor to prevent unexpected logouts in Mock/Demo mode
    console.warn('API Call failed in Mock Mode:', error);
    return Promise.reject(error);
  }
);

export default axiosInstance; 
