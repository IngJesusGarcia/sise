import api from '../api/axios';

const movimientosService = {
  getAll: () => api.get('/movimientos-academicos').then(r => r.data),
  create: (data) => api.post('/movimientos-academicos', data).then(r => r.data),
  getEstudiantes: () => api.get('/estudiantes').then(r => r.data),
};

export default movimientosService;
