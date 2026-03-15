import api from '../api/axios';

const API_URL = '/estudiantes';

const estudiantesService = {
  getAll: async (params = {}) => {
    // If we want to paginate or filter
    const response = await api.get(API_URL, { params });
    // Assuming backend returns paginated data (response.data.data) or directly the array.
    // In AlumnoController, it returns response()->json($query->paginate())
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

  // Obtener catálogos necesarios para los formularios
  getLicenciaturas: async () => {
    const response = await api.get('/licenciaturas');
    return response.data;
  }
};

export default estudiantesService;
