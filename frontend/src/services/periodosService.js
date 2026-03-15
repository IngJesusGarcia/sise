import api from '../api/axios';

const periodosService = {
  getAll: (params = {}) => api.get('/periodos', { params }).then(r => r.data),
  getById: (id) => api.get(`/periodos/${id}`).then(r => r.data),
  create: (data) => api.post('/periodos', data).then(r => r.data),
  update: (id, data) => api.put(`/periodos/${id}`, data).then(r => r.data),
  destroy: (id) => api.delete(`/periodos/${id}`).then(r => r.data),
  activar: (id) => api.post(`/periodos/${id}/activar`).then(r => r.data),
  cerrar: (id) => api.post(`/periodos/${id}/cerrar`).then(r => r.data),
};

export default periodosService;
