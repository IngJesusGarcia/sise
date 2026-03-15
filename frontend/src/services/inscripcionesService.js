import api from '../api/axios';

const API_URL = '/inscripciones';

const inscripcionesService = {
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

  getEstudiantes: async () => {
    const response = await api.get('/estudiantes');
    return response.data;
  },

  getGrupos: async () => {
    const response = await api.get('/grupos');
    return response.data;
  },
  
  getPeriodos: async () => {
    const response = await api.get('/periodos');
    return response.data;
  }
};

export default inscripcionesService;
