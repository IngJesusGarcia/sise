import api from '../api/axios';

const aspirantesService = {
  getAll: (params = {}) => api.get('/aspirantes', { params }).then(r => r.data),
  getById: (id) => api.get(`/aspirantes/${id}`).then(r => r.data),
  create: (data) => api.post('/aspirantes', data).then(r => r.data),
  update: (id, data) => api.put(`/aspirantes/${id}`, data).then(r => r.data),
  destroy: (id) => api.delete(`/aspirantes/${id}`).then(r => r.data),
  convertirAlumno: (id, data) => api.post(`/aspirantes/${id}/convertir-alumno`, data).then(r => r.data),
  getLicenciaturas: () => api.get('/licenciaturas').then(r => r.data),
};

export default aspirantesService;
