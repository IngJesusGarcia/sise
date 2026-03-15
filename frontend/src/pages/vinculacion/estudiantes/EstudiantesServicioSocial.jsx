import React, { useState, useEffect } from 'react';
import { vinculacionService } from '../../../services/vinculacionService';
import { Card, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Users, Search, FolderOpen, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
const toast = { success: alert, error: alert };

const EstudiantesServicioSocial = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Expediente Modal
  const [selectedExpediente, setSelectedExpediente] = useState(null);
  const [expedienteLoading, setExpedienteLoading] = useState(false);

  const fetchEstudiantes = async () => {
    try {
      setLoading(true);
      const res = await vinculacionService.getEstudiantes({ q: searchTerm });
      setEstudiantes(res.data.data); // assuming pagination .data
    } catch (error) {
      toast.error('Error al cargar estudiantes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchEstudiantes(), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleToggleHabilitar = async (est) => {
    if (!confirm(`¿${est.servicio_social_activo ? 'Inhabilitar' : 'Habilitar'} el módulo de Servicio Social para el alumno ${est.matricula}?`)) return;
    try {
      if (est.servicio_social_activo) {
        await vinculacionService.inhabilitarServicio(est.id);
        toast.success('Módulo deshabilitado para el estudiante');
      } else {
        await vinculacionService.habilitarServicio(est.id);
        toast.success('Módulo habilitado. El estudiante ya puede registrar avance');
      }
      fetchEstudiantes();
    } catch (error) {
      toast.error('Error al actualizar estatus');
    }
  };

  const openExpediente = async (id) => {
    try {
      setExpedienteLoading(true);
      const res = await vinculacionService.getExpediente(id);
      setSelectedExpediente(res.data);
    } catch (error) {
      toast.error('Error al cargar expediente');
    } finally {
      setExpedienteLoading(false);
    }
  };

  const validadDocumento = async (docId, estatus) => {
    try {
      await vinculacionService.dictaminarDocumento(docId, estatus);
      toast.success('Documento ' + estatus);
      // reload expediente
      openExpediente(selectedExpediente.id);
    } catch (error) {
      toast.error('Error al dictaminar');
    }
  };

  const getStatusBadge = (activo, registro) => {
    if (!activo) return <Badge variant="secondary">No Habilitado</Badge>;
    if (!registro) return <Badge variant="warning">Habilitado - Sin Iniciar</Badge>;
    switch (registro.estatus) {
      case 'registrado': return <Badge variant="primary">Registrado</Badge>;
      case 'en proceso': return <Badge className="bg-blue-100 text-blue-700">En Proceso</Badge>;
      case 'terminado': return <Badge className="bg-purple-100 text-purple-700">Terminado</Badge>;
      case 'liberado': return <Badge variant="success">Liberado</Badge>;
      default: return <Badge variant="secondary">{registro.estatus}</Badge>;
    }
  };

  const getDocStatusClass = (estatus) => {
    if (estatus === 'aprobado') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (estatus === 'rechazado') return 'bg-rose-100 text-rose-800 border-rose-200';
    return 'bg-amber-100 text-amber-800 border-amber-200';
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="text-orange-500" /> Control de Servicio Social
          </h1>
          <p className="text-gray-500 mt-1">Habilita el Módulo a los alumnos aptos, y revisa sus expedientes y horas.</p>
        </div>
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Buscar por matrícula o nombre..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 shadow-sm bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      <Card className="overflow-hidden bg-white shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                <th className="px-6 py-4 font-semibold">Matrícula</th>
                <th className="px-6 py-4 font-semibold">Alumno</th>
                <th className="px-6 py-4 font-semibold">Carrera</th>
                <th className="px-6 py-4 font-semibold text-center">Estatus SS</th>
                <th className="px-6 py-4 font-semibold text-center">Horas</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-500">
                    <Loader2 className="animate-spin h-6 w-6 text-orange-500 mx-auto mb-2" /> Cargando...
                  </td>
                </tr>
              ) : estudiantes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-500">
                    No se encontraron resultados
                  </td>
                </tr>
              ) : (
                estudiantes.map((est) => (
                  <tr key={est.id} className={`hover:bg-gray-50 transition-colors ${!est.servicio_social_activo && 'opacity-60 grayscale'}`}>
                    <td className="px-6 py-4 font-mono text-sm font-medium text-gray-700">{est.matricula}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {est.nombre} {est.apellido_paterno} {est.apellido_materno}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {est.licenciatura?.nombre || 'N/A'} <br /> <span className="text-xs text-gray-400">Semestre {est.semestre_actual}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(est.servicio_social_activo, est.servicio_social)}
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-sm font-bold text-gray-600">
                      {est.servicio_social ? `${est.servicio_social.horas_acumuladas}/${est.servicio_social.horas_requeridas}` : '-/-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {est.servicio_social_activo ? (
                          <>
                            <Button variant="outline" size="sm" onClick={() => openExpediente(est.id)} className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 font-semibold px-3 py-1.5 h-auto">
                              <FolderOpen size={16} className="mr-2"/> Expediente
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleToggleHabilitar(est)} className="text-rose-600 border-rose-200 hover:bg-rose-50 px-2 h-auto" title="Inhabilitar">
                              Desactivar
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" onClick={() => handleToggleHabilitar(est)} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold">
                            Activar Servicio
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Expediente Sidebar Overlay */}
      {selectedExpediente && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-slide-in-right overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FolderOpen className="text-blue-600" /> Expediente de Servicio Social
                </h2>
                <p className="text-sm font-mono text-gray-500 mt-1">{selectedExpediente.matricula} — {selectedExpediente.nombre} {selectedExpediente.apellido_paterno}</p>
              </div>
              <Button variant="outline" onClick={() => setSelectedExpediente(null)}>Cerrar</Button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              {expedienteLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600 h-8 w-8" /></div>
              ) : (
                <div className="space-y-8">
                  {/* Ficha Técnica del Servicio */}
                  <div className="bg-white border rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 border-b pb-2">Datos del Servicio</h3>
                    {selectedExpediente.servicio_social ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div><p className="text-xs text-gray-500">Institución / Dependencia</p><p className="font-bold">{selectedExpediente.servicio_social.institucion}</p></div>
                        <div><p className="text-xs text-gray-500">Proyecto</p><p className="font-bold line-clamp-2" title={selectedExpediente.servicio_social.proyecto}>{selectedExpediente.servicio_social.proyecto}</p></div>
                        <div><p className="text-xs text-gray-500">Fecha Inicio</p><p className="font-medium text-gray-800">{new Date(selectedExpediente.servicio_social.fecha_inicio).toLocaleDateString()}</p></div>
                        <div><p className="text-xs text-gray-500">Horas Acumuladas</p>
                          <p className="font-black text-blue-600 text-lg">{selectedExpediente.servicio_social.horas_acumuladas} <span className="text-sm text-gray-400 font-medium">/ {selectedExpediente.servicio_social.horas_requeridas}</span></p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <AlertCircle className="mx-auto text-amber-500 mb-2" />
                        <p className="text-amber-700 font-medium text-sm">El alumno no ha iniciado su registro.</p>
                      </div>
                    )}
                  </div>

                  {/* Documentos */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 border-b pb-2 flex items-center justify-between">
                      Revisión de Documentos
                      <Badge variant="secondary">{selectedExpediente.documentos_servicio?.length || 0} Archivos</Badge>
                    </h3>
                    
                    <div className="space-y-3">
                      {selectedExpediente.documentos_servicio?.length > 0 ? (
                        selectedExpediente.documentos_servicio.map(doc => (
                          <div key={doc.id} className={`p-4 rounded-xl border flex flex-col gap-3 transition-colors ${getDocStatusClass(doc.estatus)}`}>
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold">{doc.tipo_documento}</h4>
                                <p className="text-xs opacity-80 mt-1">Subido el {new Date(doc.fecha_subida).toLocaleString()}</p>
                              </div>
                              <span className="text-xs font-black uppercase tracking-widest bg-white/50 px-2 py-1 rounded-md">{doc.estatus}</span>
                            </div>
                            
                            <div className="flex justify-between items-center mt-2 flex-wrap gap-2">
                              <Button size="sm" variant="outline" className="bg-white/80 hover:bg-white border-transparent text-sm" onClick={() => window.open(`${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${doc.archivo}`, '_blank')}>
                                Ver Documento PDF
                              </Button>
                              
                              {doc.estatus === 'pendiente' && (
                                <div className="flex gap-2">
                                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white border-none py-1 h-auto" onClick={() => validadDocumento(doc.id, 'aprobado')}>
                                    <CheckCircle size={14} className="mr-1"/> Aprobar
                                  </Button>
                                  <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white border-none py-1 h-auto" onClick={() => validadDocumento(doc.id, 'rechazado')}>
                                    Refutar
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-400 border border-dashed rounded-xl bg-gray-50">
                          Sin documentos subidos
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default EstudiantesServicioSocial;
