import api from '../api/axios';

const API_URL = '/grupos';

const gruposService = {
  getAll: async () => {
    const response = await api.get(API_URL);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`${API_URL}/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post(API_URL, data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`${API_URL}/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`${API_URL}/${id}`);
    return response.data;
  },

  getMaterias: async () => {
    const response = await api.get('/materias');
    return response.data;
  },

  getDocentes: async () => {
    const response = await api.get('/docentes');
    return response.data;
  },

  getPeriodos: async () => {
    const response = await api.get('/periodos');
    return response.data;
  }
};

export default gruposService;
