import api from '../api/axios';

export const inventarioService = {
  // Catálogos
  getAlmacenes: () => api.get('/inventario/almacenes').then(r => r.data),
  getMateriales: (p = {}) => api.get('/inventario/materiales', { params: p }).then(r => r.data),
  createMaterial: (data) => api.post('/inventario/materiales', data).then(r => r.data),
  updateMaterial: (id, data) => api.put(`/inventario/materiales/${id}`, data).then(r => r.data),
  ajustarStock: (data) => api.post('/inventario/ajustar-stock', data).then(r => r.data),
  // Movimientos
  getMovimientos: (p = {}) => api.get('/inventario/movimientos', { params: p }).then(r => r.data),
};

export const solicitudesService = {
  getAll: (p = {}) => api.get('/inventario/solicitudes', { params: p }).then(r => r.data),
  getById: (id) => api.get(`/inventario/solicitudes/${id}`).then(r => r.data),
  create: (data) => api.post('/inventario/solicitudes', data).then(r => r.data),
  aprobar: (id) => api.patch(`/inventario/solicitudes/${id}/aprobar`).then(r => r.data),
  rechazar: (id) => api.patch(`/inventario/solicitudes/${id}/rechazar`).then(r => r.data),
};

export const notificacionesService = {
  getAll: () => api.get('/notificaciones').then(r => r.data),
  marcarLeida: (id) => api.patch(`/notificaciones/${id}/leer`).then(r => r.data),
  marcarTodasLeidas: () => api.patch('/notificaciones/leer-todas').then(r => r.data),
};

export default { inventarioService, solicitudesService, notificacionesService };
