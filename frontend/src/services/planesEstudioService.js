import api from '../api/axios';

const planesEstudioService = {
  getAll: (params = {}) => api.get('/planes-estudio', { params }).then(r => r.data),
  getById: (id) => api.get(`/planes-estudio/${id}`).then(r => r.data),
  create: (data) => api.post('/planes-estudio', data).then(r => r.data),
  update: (id, data) => api.put(`/planes-estudio/${id}`, data).then(r => r.data),
  syncMaterias: (id, materias) => api.post(`/planes-estudio/${id}/materias`, { materias }).then(r => r.data),
  getLicenciaturas: () => api.get('/licenciaturas').then(r => r.data),
  getMaterias: () => api.get('/materias').then(r => r.data),
};

export default planesEstudioService;
