import api from '../api/axios';

const boletasService = {
  getBoleta: async (estudianteId, periodoId) => {
    const response = await api.get(`/boleta/${estudianteId}/${periodoId}`);
    return response.data;
  },

  getEstudiantes: async () => {
    // Reusing the active students catalog from academico module
    const response = await api.get('/estudiantes');
    return response.data;
  },

  getPeriodos: async () => {
    // Requires periodos list
    const response = await api.get('/periodos');
    return response.data;
  }
};

export default boletasService;
