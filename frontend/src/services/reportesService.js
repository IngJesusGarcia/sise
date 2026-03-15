import api from '../api/axios';

const reportesService = {
  getEstudiantesPorCarrera: () => api.get('/reportes/estudiantes-por-carrera').then(r => r.data),
  getMateriasReprobadas:    () => api.get('/reportes/materias-reprobadas').then(r => r.data),
  getPromedioGrupos:        () => api.get('/reportes/promedio-grupos').then(r => r.data),
  getIngresos:              () => api.get('/reportes/ingresos').then(r => r.data),
  getResumen:               () => api.get('/reportes/resumen').then(r => r.data),
};

export default reportesService;
