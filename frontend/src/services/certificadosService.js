import api from '../api/axios';

const certificadosService = {
  getAll: async (alumnoId = null) => {
    const params = alumnoId ? { alumno_id: alumnoId } : {};
    const response = await api.get('/certificados', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/certificados/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/certificados', data);
    return response.data;
  },

  invalidate: async (id) => {
    const response = await api.delete(`/certificados/${id}`);
    return response.data;
  },

  getEstudiantes: async () => {
    const response = await api.get('/estudiantes');
    return response.data;
  }
};

export default certificadosService;
