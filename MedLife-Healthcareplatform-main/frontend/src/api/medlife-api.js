import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Doctors API
export const doctorsAPI = {
  search: (params) => api.get('/doctors/search', { params }),
  searchReal: (params) => api.get('/doctors/real/search', { params }),
  getById: (id) => api.get(`/doctors/${id}`),
  getSlots: (id, date) => api.get(`/doctors/${id}/slots`, { params: { date } }),
  getSpecializations: () => api.get('/doctors/meta/specializations'),
};

// Hospitals API
export const hospitalsAPI = {
  getAll: (params) => api.get('/hospitals', { params }),
  searchReal: (params) => api.get('/hospitals/real/search', { params }),
  getById: (id) => api.get(`/hospitals/${id}`),
  findNearby: (lat, lng, radius) => api.get('/hospitals/nearby/find', { params: { lat, lng, radius } }),
  getBeds: (id) => api.get(`/hospitals/${id}/beds`),
};

// Consultations API
export const consultationsAPI = {
  book: (data) => api.post('/consultations/book', data),
  getMyConsultations: (params) => api.get('/consultations/my', { params }),
  getById: (id) => api.get(`/consultations/${id}`),
  cancel: (id) => api.put(`/consultations/${id}/cancel`),
  getUpcoming: () => api.get('/consultations/my/upcoming'),
};

// AI Assistant API
export const aiAPI = {
  checkSymptoms: (data) => api.post('/ai/check-symptoms', data),
  chat: (data) => api.post('/ai/chat', data),
  getHistory: () => api.get('/ai/history'),
};

// Emergency API
export const emergencyAPI = {
  triggerSOS: (data) => api.post('/emergency/sos', data),
  getStatus: (id) => api.get(`/emergency/status/${id}`),
  getHistory: () => api.get('/emergency/history'),
  getContacts: () => api.get('/emergency/contacts'),
};

// Health Profile API
export const healthAPI = {
  getDashboard: () => api.get('/health/dashboard'),
  getRecords: (params) => api.get('/health/records', { params }),
  addRecord: (data) => api.post('/health/records', data),
  deleteRecord: (id) => api.delete(`/health/records/${id}`),
  getSummary: () => api.get('/health/summary'),
  updateMedicalHistory: (data) => api.put('/health/medical-history', data),
};

export default api;
