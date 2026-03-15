import React, { useState, useEffect } from 'react';
import { BookOpen, Search, FileText, Award, Layers } from 'lucide-react';
import kardexService from '../../services/kardexService';
import { Card, CardContent } from '../../components/ui/Card';
import { FormGroup, Select } from '../../components/ui/Form';

const KardexView = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [selectedEstId, setSelectedEstId] = useState('');
  const [kardexData, setKardexData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEstudiantes();
  }, []);

  const loadEstudiantes = async () => {
    try {
      const data = await kardexService.getAllEstudiantes();
      setEstudiantes(data);
    } catch (err) {
      console.error('Error loading students catalogue', err);
    }
  };

  useEffect(() => {
    if (selectedEstId) {
      loadKardex(selectedEstId);
    } else {
      setKardexData(null);
    }
  }, [selectedEstId]);

  const loadKardex = async (id) => {
    try {
      setLoading(true);
      const data = await kardexService.getKardex(id);
      setKardexData(data);
    } catch (err) {
      console.error('Error loading kardex:', err);
      alert('Error al obtener el historial académico.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (cal) => {
    if (cal.estatus === 'aprobado') {
      return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">APROBADO</span>;
    }
    if (cal.estatus === 'reprobado') {
       return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">REPROBADO</span>;
    }
    if (cal.estatus === 'recursando') {
       return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">RECURSANDO</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">{String(cal.estatus || 'pendiente').toUpperCase()}</span>;
  };

  const gradeColor = (n) => {
    if (n === null || n === undefined) return 'text-gray-400';
    return n >= 6 ? 'text-green-700' : 'text-red-600';
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-6 pb-12">
      {/* HEADER & SELECTOR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-unich-purple/10 text-unich-purple rounded-lg">
              <FileText size={24} />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Kardex de Estudiante</h1>
          </div>
          <p className="text-gray-500">Historial académico completo y concentrado de calificaciones.</p>
        </div>

        <div className="w-full md:w-96">
          <FormGroup className="mb-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-gray-400" size={18} />
              </div>
              <Select 
                id="estudiante_selector"
                value={selectedEstId}
                onChange={(e) => setSelectedEstId(e.target.value)}
                className="pl-10 shadow-sm border-gray-300 rounded-xl"
              >
                <option value="">Buscar estudiante (Matrícula / Nombre)...</option>
                {estudiantes.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.matricula} — {e.apellido_paterno} {e.apellido_materno} {e.nombre}
                  </option>
                ))}
              </Select>
            </div>
          </FormGroup>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-unich-purple border-t-transparent"></div>
          <p className="text-gray-500 font-medium">Buscando expediente académico...</p>
        </div>
      ) : kardexData ? (
        <>
          {/* INFO RESUMEN */}
          <Card className="border-t-4 border-t-unich-purple overflow-hidden">
            <div className="bg-gradient-to-r from-unich-purple/5 to-transparent border-b border-gray-100 p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {kardexData.alumno.nombre} {kardexData.alumno.apellido_paterno} {kardexData.alumno.apellido_materno}
                  </h2>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="font-mono bg-white border px-2 py-0.5 rounded shadow-sm">{kardexData.alumno.matricula}</span>
                    <span>•</span>
                    <span className="font-medium">{kardexData.alumno.licenciatura?.nombre || 'Licenciatura no especificada'}</span>
                  </div>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${kardexData.alumno.estatus === 'activo' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                  <span className="font-bold text-sm text-gray-700 uppercase">{String(kardexData.alumno.estatus).replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
              <div className="p-6 flex items-center justify-between md:justify-start gap-4 hover:bg-gray-50 transition-colors">
                <div className="p-3 bg-blue-100/50 text-blue-600 rounded-xl">
                  <Award size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Promedio Gen.</p>
                  <p className="text-3xl font-black text-gray-900">{kardexData.promedio_general || '0.00'}</p>
                </div>
              </div>

              <div className="p-6 flex items-center justify-between md:justify-start gap-4 hover:bg-gray-50 transition-colors">
                <div className="p-3 bg-purple-100/50 text-unich-purple rounded-xl">
                  <Layers size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Créditos Aprob.</p>
                  <p className="text-3xl font-black text-gray-900">{kardexData.creditos_aprobados || '0'}</p>
                </div>
              </div>

              <div className="p-6 flex items-center justify-between md:justify-start gap-4 hover:bg-gray-50 transition-colors">
                <div className="p-3 bg-green-100/50 text-green-600 rounded-xl">
                  <BookOpen size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Semestre Act.</p>
                  <p className="text-3xl font-black text-gray-900">{kardexData.alumno.semestre_actual}°</p>
                </div>
              </div>
            </div>
          </Card>

          {/* LISTA DE MATERIAS POR PERIODO */}
          <div className="space-y-8">
            {Object.entries(kardexData.calificaciones || {}).map(([periodoNombre, materias]) => (
              <div key={periodoNombre} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center gap-3">
                  <Calendar className="text-unich-purple" size={18} />
                  <h3 className="font-bold text-gray-800">Semestre / Periodo: {periodoNombre}</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="bg-white border-b border-gray-100">
                        <th className="px-5 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">Clave</th>
                        <th className="px-5 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs w-full">Unidad Académica (Materia)</th>
                        <th className="px-5 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs text-center">Créditos</th>
                        <th className="px-5 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs text-center">Calificación</th>
                        <th className="px-5 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs text-center">Tipo Eval.</th>
                        <th className="px-5 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs text-center">Estatus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {materias.map((cal) => (
                        <tr key={cal.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3 font-mono text-xs text-gray-500 w-1">{cal.materia?.clave}</td>
                          <td className="px-5 py-3 font-medium text-gray-800 whitespace-normal min-w-[200px]">{cal.materia?.nombre}</td>
                          <td className="px-5 py-3 text-center text-gray-600">{cal.materia?.creditos}</td>
                          <td className="px-5 py-3 text-center">
                            <span className={`font-mono font-bold text-base ${gradeColor(cal.calificacion_final)}`}>
                              {cal.calificacion_final !== null ? Number(cal.calificacion_final).toFixed(1) : '—'}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-center text-gray-500 text-xs">Ord.</td>
                          <td className="px-5 py-3 text-center">{getStatusBadge(cal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            
            {Object.keys(kardexData.calificaciones || {}).length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                <FileText className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500 font-medium text-lg">Sin historial académico registrado.</p>
                <p className="text-gray-400 text-sm mt-1">Este alumno aún no tiene calificaciones finales asentadas en acta.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <Card className="border-dashed shadow-none bg-gray-50 flex items-center justify-center p-12 h-64">
           <div className="text-center">
             <BookOpen size={48} className="mx-auto text-gray-300 mb-4" strokeWidth={1} />
             <p className="text-gray-500 font-medium">Selecciona un estudiante en el buscador superior para generar su Kardex.</p>
           </div>
        </Card>
      )}
    </div>
  );
};

export default KardexView;
