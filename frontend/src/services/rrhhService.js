import api from '../api/axios';

const rrhhService = {
  // Movimientos
  getMovimientos: (params = {}) => api.get('/rrhh/movimientos', { params }).then(r => r.data),
  createMovimiento: (data) => api.post('/rrhh/movimientos', data).then(r => r.data),
  // Catálogos
  getDepartamentos: () => api.get('/rrhh/departamentos').then(r => r.data),
  getPuestos: (params = {}) => api.get('/rrhh/puestos', { params }).then(r => r.data),
  // Quick stats (from empleados endpoint)
  getStats: () => Promise.all([
    api.get('/rrhh/empleados', { params: { estatus: 'activo', per_page: 1 } }),
    api.get('/rrhh/empleados', { params: { estatus: 'baja', per_page: 1 } }),
    api.get('/rrhh/empleados', { params: { per_page: 1 } }),
  ]).then(([activos, bajas, todos]) => ({
    total:   todos.data.total ?? 0,
    activos: activos.data.total ?? 0,
    baja:    bajas.data.total ?? 0,
  })),
};

export default rrhhService;
