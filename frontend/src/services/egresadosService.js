import api from '../api/axios';

const egresadosService = {
  getAll: (params = {}) => api.get('/egresados', { params }).then(r => r.data),
  getById: (id) => api.get(`/egresados/${id}`).then(r => r.data),
  create: (data) => api.post('/egresados', data).then(r => r.data),
  update: (id, data) => api.put(`/egresados/${id}`, data).then(r => r.data),
  destroy: (id) => api.delete(`/egresados/${id}`).then(r => r.data),
  getEstudiantes: () => api.get('/estudiantes').then(r => r.data),
  getPeriodos: () => api.get('/periodos').then(r => r.data),
  getLicenciaturas: () => api.get('/licenciaturas').then(r => r.data),
};

export default egresadosService;
