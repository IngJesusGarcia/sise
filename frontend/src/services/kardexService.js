import api from '../api/axios';

const kardexService = {
  getKardex: async (estudianteId) => {
    const response = await api.get(`/kardex/${estudianteId}`);
    return response.data;
  },

  getAllEstudiantes: async () => {
    // Reutilizar el endpoint de catálogo simplificado
    const response = await api.get('/estudiantes');
    return response.data;
  }
};

export default kardexService;
