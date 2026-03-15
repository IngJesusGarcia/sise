import api from '../api/axios';

export const correspondenciaService = {
  // Documentos
  getDocumentos: async (params) => {
    const { data } = await api.get('/correspondencia/documentos', { params });
    return data;
  },
  getDocumento: async (id) => {
    const { data } = await api.get(`/correspondencia/documentos/${id}`);
    return data;
  },
  createDocumento: async (formData) => {
    const { data } = await api.post('/correspondencia/documentos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  updateDocumento: async (id, formData) => {
    // Laravel needs _method=PUT or PATCH in FormData for file uploads to work on update
    formData.append('_method', 'PUT');
    const { data } = await api.post(`/correspondencia/documentos/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  deleteDocumento: async (id) => {
    const { data } = await api.delete(`/correspondencia/documentos/${id}`);
    return data;
  },
  aprobarDocumento: async (id, payload) => {
    // payload: { estatus: 'aprobado|rechazado|en_revision', comentarios: '' }
    const { data } = await api.post(`/correspondencia/documentos/${id}/aprobar`, payload);
    return data;
  },

  // Tipos de Documento
  getTipos: async (params) => {
    const { data } = await api.get('/correspondencia/tipos', { params });
    return data;
  },
  createTipo: async (payload) => {
    const { data } = await api.post('/correspondencia/tipos', payload);
    return data;
  },
  updateTipo: async (id, payload) => {
    const { data } = await api.put(`/correspondencia/tipos/${id}`, payload);
    return data;
  },
  deleteTipo: async (id) => {
    const { data } = await api.delete(`/correspondencia/tipos/${id}`);
    return data;
  },

  // Reportes
  getReporteResumen: async (params) => {
    const { data } = await api.get('/correspondencia/reportes/resumen', { params });
    return data;
  },

  // Catálogos auxiliares
  getDepartamentos: async () => {
    const { data } = await api.get('/correspondencia/departamentos');
    return data;
  }
};
