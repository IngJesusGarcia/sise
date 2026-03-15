import api from '../api/axios';

const movilidadService = {
  getAll: () => api.get('/movilidad').then(r => r.data),
  create: (data) => api.post('/movilidad', data).then(r => r.data),
  getEstudiantes: () => api.get('/estudiantes').then(r => r.data),
};

export default movilidadService;
