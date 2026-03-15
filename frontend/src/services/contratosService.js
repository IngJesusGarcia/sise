import api from '../api/axios';

const contratosService = {
  getAll: (params = {}) => api.get('/rrhh/contratos', { params }).then(r => r.data),
  getById: (id) => api.get(`/rrhh/contratos/${id}`).then(r => r.data),
  create: (data) => api.post('/rrhh/contratos', data).then(r => r.data),
  update: (id, data) => api.put(`/rrhh/contratos/${id}`, data).then(r => r.data),
  destroy: (id) => api.delete(`/rrhh/contratos/${id}`).then(r => r.data),
};

export default contratosService;
