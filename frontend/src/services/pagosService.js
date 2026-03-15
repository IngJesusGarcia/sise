import api from '../api/axios';

const pagosService = {
  getAll: async () => {
    const response = await api.get('/pagos');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/pagos/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/pagos', data);
    return response.data;
  },

  getEstudiantes: async () => {
    const response = await api.get('/estudiantes');
    return response.data;
  }
};

export default pagosService;
