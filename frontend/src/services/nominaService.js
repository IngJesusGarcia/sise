import api from '../api/axios';

const nominaService = {
  getAll: (params = {}) => api.get('/rrhh/nominas', { params }).then(r => r.data),
  getById: (id) => api.get(`/rrhh/nominas/${id}`).then(r => r.data),
  create: (data) => api.post('/rrhh/nominas', data).then(r => r.data),
  updateEstatus: (id, estatus) => api.put(`/rrhh/nominas/${id}`, { estatus }).then(r => r.data),
  updateLinea: (nominaId, lineaId, data) => api.put(`/rrhh/nominas/${nominaId}/lineas/${lineaId}`, data).then(r => r.data),
};

export default nominaService;
