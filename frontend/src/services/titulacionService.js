import api from '../api/axios';

const titulacionService = {
  getAll: () => api.get('/titulacion').then(r => r.data),
  getById: (id) => api.get(`/titulacion/${id}`).then(r => r.data),
  getModalidades: () => api.get('/titulacion/modalidades').then(r => r.data),
  getSeguimiento: (alumnoId) => api.get(`/titulacion/seguimiento/${alumnoId}`).then(r => r.data),
  createActa: (data) => api.post('/titulacion', data).then(r => r.data),
  registrarTitulo: (actaId, data) => api.post(`/titulacion/${actaId}/titulo`, data).then(r => r.data),
  getEgresados: () => api.get('/egresados').then(r => r.data),
};

export default titulacionService;
