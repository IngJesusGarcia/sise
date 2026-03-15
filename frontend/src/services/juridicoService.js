import api from '../api/axios';

export const juridicoService = {
  // Abogados
  getAbogados: async (params) => {
    const { data } = await api.get('/juridico/abogados', { params });
    return data;
  },
  getAbogado: async (id) => {
    const { data } = await api.get(`/juridico/abogados/${id}`);
    return data;
  },
  createAbogado: async (payload) => {
    const { data } = await api.post('/juridico/abogados', payload);
    return data;
  },
  updateAbogado: async (id, payload) => {
    const { data } = await api.put(`/juridico/abogados/${id}`, payload);
    return data;
  },
  deleteAbogado: async (id) => {
    const { data } = await api.delete(`/juridico/abogados/${id}`);
    return data;
  },

  // Expedientes
  getExpedientes: async (params) => {
    const { data } = await api.get('/juridico/expedientes', { params });
    return data;
  },
  getExpediente: async (id) => {
    const { data } = await api.get(`/juridico/expedientes/${id}`);
    return data;
  },
  createExpediente: async (payload) => {
    const { data } = await api.post('/juridico/expedientes', payload);
    return data;
  },
  updateExpediente: async (id, payload) => {
    const { data } = await api.put(`/juridico/expedientes/${id}`, payload);
    return data;
  },
  deleteExpediente: async (id) => {
    const { data } = await api.delete(`/juridico/expedientes/${id}`);
    return data;
  },

  // Demandas Laborales
  getDemandas: async (params) => {
    const { data } = await api.get('/juridico/demandas', { params });
    return data;
  },
  getDemanda: async (id) => {
    const { data } = await api.get(`/juridico/demandas/${id}`);
    return data;
  },
  createDemanda: async (payload) => {
    const { data } = await api.post('/juridico/demandas', payload);
    return data;
  },
  updateDemanda: async (id, payload) => {
    const { data } = await api.put(`/juridico/demandas/${id}`, payload);
    return data;
  },
  deleteDemanda: async (id) => {
    const { data } = await api.delete(`/juridico/demandas/${id}`);
    return data;
  },

  // Convenios y Contratos (Multipart FormData for Files)
  getConvenios: async (params) => {
    const { data } = await api.get('/juridico/convenios', { params });
    return data;
  },
  getConvenio: async (id) => {
    const { data } = await api.get(`/juridico/convenios/${id}`);
    return data;
  },
  createConvenio: async (formData) => {
    const { data } = await api.post('/juridico/convenios', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  updateConvenio: async (id, formData) => {
    formData.append('_method', 'PUT');
    const { data } = await api.post(`/juridico/convenios/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  deleteConvenio: async (id) => {
    const { data } = await api.delete(`/juridico/convenios/${id}`);
    return data;
  },

  // Correspondencia Jurídica (Multipart FormData for Files)
  getCorrespondencias: async (params) => {
    const { data } = await api.get('/juridico/correspondencia', { params });
    return data;
  },
  getCorrespondencia: async (id) => {
    const { data } = await api.get(`/juridico/correspondencia/${id}`);
    return data;
  },
  createCorrespondencia: async (formData) => {
    const { data } = await api.post('/juridico/correspondencia', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  updateCorrespondencia: async (id, formData) => {
    formData.append('_method', 'PUT');
    const { data } = await api.post(`/juridico/correspondencia/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  deleteCorrespondencia: async (id) => {
    const { data } = await api.delete(`/juridico/correspondencia/${id}`);
    return data;
  }
};
