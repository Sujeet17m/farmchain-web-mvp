import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Batch API
export const batchAPI = {
  create: (data) => api.post('/batch', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMyBatches: (params) => api.get('/batch/my-batches', { params }),
  getBatch: (id) => api.get(`/batch/${id}`),
  updateBatch: (id, data) => api.put(`/batch/${id}`, data),
  deleteBatch: (id) => api.delete(`/batch/${id}`),
  getDashboardStats: () => api.get('/batch/dashboard-stats'),
};

// Verification API
export const verificationAPI = {
  getPendingBatches: (params) => api.get('/verification/pending', { params }),
  submitVerification: (data) => api.post('/verification', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getHistory: (params) => api.get('/verification/history', { params }),
  getStats: () => api.get('/verification/stats'),
};

// Consumer API
export const consumerAPI = {
  trackProduct: (batchId) => api.get(`/consumer/track/${batchId}`),
  searchProducts: (params) => api.get('/consumer/search', { params }),
  getFeatured: () => api.get('/consumer/featured'),
  getCategories: () => api.get('/consumer/categories'),
};

// Voice API
export const voiceAPI = {
  transcribe: (data) => api.post('/voice/transcribe', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export default api;