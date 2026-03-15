import api from '../api/axios';

export const vinculacionService = {
  // Formatos
  getFormatos: () => api.get('/vinculacion/formatos'),
  createFormato: (data) => api.post('/vinculacion/formatos', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  toggleFormato: (id) => api.patch(`/vinculacion/formatos/${id}/toggle`),
  deleteFormato: (id) => api.delete(`/vinculacion/formatos/${id}`),

  // Reglamento
  getReglamentos: () => api.get('/vinculacion/reglamento'),
  createReglamento: (data) => api.post('/vinculacion/reglamento', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  setReglamentoActivo: (id) => api.patch(`/vinculacion/reglamento/${id}/activo`),
  deleteReglamento: (id) => api.delete(`/vinculacion/reglamento/${id}`),

  // Repositorio
  getRepositorio: () => api.get('/vinculacion/repositorio'),
  createRepositorio: (data) => api.post('/vinculacion/repositorio', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  toggleRepositorio: (id) => api.patch(`/vinculacion/repositorio/${id}/toggle`),
  deleteRepositorio: (id) => api.delete(`/vinculacion/repositorio/${id}`),

  // Estudiantes & Expedientes
  getEstudiantes: (params = {}) => api.get('/vinculacion/estudiantes', { params }),
  getExpediente: (id) => api.get(`/vinculacion/estudiantes/${id}`),
  habilitarServicio: (id) => api.put(`/vinculacion/estudiantes/${id}/habilitar`),
  inhabilitarServicio: (id) => api.put(`/vinculacion/estudiantes/${id}/inhabilitar`),
  actualizarAvance: (id, data) => api.patch(`/vinculacion/servicio-social/${id}/avance`, data),
  dictaminarDocumento: (id, estatus) => api.patch(`/vinculacion/documentos/${id}/dictaminar`, { estatus }),

  // Dashboard
  getResumen: () => api.get('/vinculacion/reportes/resumen')
};
