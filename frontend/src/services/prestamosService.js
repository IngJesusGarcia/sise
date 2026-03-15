import api from '../api/axios';

export const prestamosService = {
    // Equipos
    getEquipos: (params) => api.get('/prestamos/equipos', { params }).then(r => r.data),
    getEquiposDisponibles: () => api.get('/prestamos/equipos/disponibles').then(r => r.data),
    createEquipo: (data) => api.post('/prestamos/equipos', data).then(r => r.data),
    updateEquipo: (id, data) => api.put(`/prestamos/equipos/${id}`, data).then(r => r.data),
    deleteEquipo: (id) => api.delete(`/prestamos/equipos/${id}`).then(r => r.data),

    // Solicitudes
    getSolicitudes: (params) => api.get('/prestamos/solicitudes', { params }).then(r => r.data),
    createSolicitud: (data) => api.post('/prestamos/solicitudes', data).then(r => r.data),
    updateEstatusSolicitud: (id, estatus) => api.patch(`/prestamos/solicitudes/${id}/estatus`, { estatus }).then(r => r.data),
    
    // Préstamos Activos y Devoluciones
    getActivos: () => api.get('/prestamos/activos').then(r => r.data),
    registrarDevolucion: (id, data) => api.post(`/prestamos/solicitudes/${id}/devolver`, data).then(r => r.data),

    // Historial y Dashboard
    getHistorial: (params) => api.get('/prestamos/historial', { params }).then(r => r.data),
    getResumen: () => api.get('/prestamos/resumen').then(r => r.data),
};
