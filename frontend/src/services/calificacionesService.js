import api from '../api/axios';

const calificacionesService = {
  getAll: async (grupoId = null) => {
    const params = grupoId ? { grupo_id: grupoId } : {};
    const response = await api.get('/calificaciones', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/calificaciones/${id}`);
    return response.data;
  },

  // Obtener alumnos de un grupo con sus calificaciones ya rellenas
  getAlumnosPorGrupo: async (grupoId) => {
    const response = await api.get(`/grupos/${grupoId}/alumnos`);
    return response.data;
  },

  // Guardar calificación de un alumno (crea o actualiza)
  save: async (data) => {
    const response = await api.post('/calificaciones', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/calificaciones/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/calificaciones/${id}`);
    return response.data;
  },

  getGrupos: async () => {
    const response = await api.get('/grupos');
    return response.data;
  }
};

export default calificacionesService;
