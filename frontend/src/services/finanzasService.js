import api from '../api/axios';

export const serviciosService = {
  getAll: (p = {}) => api.get('/finanzas/servicios', { params: p }).then(r => r.data),
  getById: (id) => api.get(`/finanzas/servicios/${id}`).then(r => r.data),
  create: (data) => api.post('/finanzas/servicios', data).then(r => r.data),
  update: (id, data) => api.put(`/finanzas/servicios/${id}`, data).then(r => r.data),
  destroy: (id) => api.delete(`/finanzas/servicios/${id}`).then(r => r.data),
};

export const lineasCapturaService = {
  getAll: (p = {}) => api.get('/finanzas/lineas-captura', { params: p }).then(r => r.data),
  getById: (id) => api.get(`/finanzas/lineas-captura/${id}`).then(r => r.data),
  create: (data) => api.post('/finanzas/lineas-captura', data).then(r => r.data),
  updateEstatus: (id, estatus) => api.patch(`/finanzas/lineas-captura/${id}`, { estatus }).then(r => r.data),
};

export const pagosService = {
  getAll: (p = {}) => api.get('/finanzas/pagos', { params: p }).then(r => r.data),
  getById: (id) => api.get(`/finanzas/pagos/${id}`).then(r => r.data),
  create: (data) => api.post('/finanzas/pagos', data).then(r => r.data),
};

export const recibosService = {
  getAll: (p = {}) => api.get('/finanzas/recibos', { params: p }).then(r => r.data),
  getById: (id) => api.get(`/finanzas/recibos/${id}`).then(r => r.data),
};

export const finanzasService = {
  getResumen: (p = {}) => api.get('/finanzas/reportes/resumen', { params: p }).then(r => r.data),
  getArqueo: (fecha) => api.get('/finanzas/reportes/arqueo', { params: { fecha } }).then(r => r.data),
  getPagosEstudiante: (id) => api.get(`/finanzas/reportes/estudiante/${id}`).then(r => r.data),
  getAlumnos: () => api.get('/estudiantes', { params: { per_page: 500 } }).then(r => r.data),
};

export default { serviciosService, lineasCapturaService, pagosService, recibosService, finanzasService };
