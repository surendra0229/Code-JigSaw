import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Attach appropriate Authorization token depending on route target
api.interceptors.request.use((config) => {
  const url = config.url || '';
  if (url.startsWith('/admin')) {
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
  } else {
    const playerToken = localStorage.getItem('player_token');
    if (playerToken) {
      config.headers.Authorization = `Bearer ${playerToken}`;
    }
  }
  return config;
});

// Centralized error response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customMsg = error.response?.data?.message || error.message || 'Network request failed';
    return Promise.reject(new Error(customMsg));
  }
);

export default api;
