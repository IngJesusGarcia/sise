import api from '../api/axios';

const empleadosService = {
  getAll: (params = {}) => api.get('/rrhh/empleados', { params }).then(r => r.data),
  getById: (id) => api.get(`/rrhh/empleados/${id}`).then(r => r.data),
  create: (data) => api.post('/rrhh/empleados', data).then(r => r.data),
  update: (id, data) => api.put(`/rrhh/empleados/${id}`, data).then(r => r.data),
  destroy: (id) => api.delete(`/rrhh/empleados/${id}`).then(r => r.data),
  getDepartamentos: () => api.get('/rrhh/departamentos').then(r => r.data),
  getPuestos: (params = {}) => api.get('/rrhh/puestos', { params }).then(r => r.data),
};

export default empleadosService;
