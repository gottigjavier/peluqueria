import axios from 'axios';

const API_BASE = '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

export const clientsApi = {
  getAll: () => api.get('/clients'),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`)
};

export const servicesApi = {
  getAll: (category) => api.get('/services', { params: { category } }),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`)
};

export const resourcesApi = {
  getAll: () => api.get('/resources'),
  getById: (id) => api.get(`/resources/${id}`),
  create: (data) => api.post('/resources', data),
  update: (id, data) => api.put(`/resources/${id}`, data)
};

export const professionalsApi = {
  getAll: () => api.get('/professionals'),
  getById: (id) => api.get(`/professionals/${id}`),
  create: (data) => api.post('/professionals', data),
  update: (id, data) => api.put(`/professionals/${id}`, data)
};

export const appointmentsApi = {
  getAll: (params) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  delete: (id) => api.delete(`/appointments/${id}`),
  start: (id) => api.post(`/appointments/${id}/start`),
  complete: (id) => api.post(`/appointments/${id}/complete`),
  checkServices: (data) => api.post('/appointments/check-services', data),
  checkProfessionals: (data) => api.post('/appointments/check-professionals', data),
  checkAvailability: (data) => api.post('/appointments/check-availability', data)
};

export const availabilityApi = {
  check: (params) => api.get('/availability', { params }),
  checkMultiLock: (params) => api.get('/availability/multi-lock', { params })
};

export default api;