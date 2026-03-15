import api from '../api/axios';

export const servicioSocialService = {
  checkElegibilidad: () => api.get('/estudiante/servicio-social/elegibilidad'),
  getAvance: () => api.get('/estudiante/servicio-social/avance'),
  postDocumento: (data) => api.post('/estudiante/servicio-social/documentos', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getRecursos: () => api.get('/estudiante/servicio-social/recursos'),
};
