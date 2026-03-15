import api from '../api/axios';

const API_URL = '/materias';

const materiasService = {
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
  }
};

export default materiasService;
