import React, { useState, useEffect } from 'react';
import { servicioSocialService } from '../../../services/servicioSocialService';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { GraduationCap, Upload, FileText, CheckCircle, Clock, AlertCircle, Loader2, Archive, BookOpen, ChevronRight } from 'lucide-react';
const toast = { success: alert, error: alert };

const MiServicioSocial = () => {
  const [loading, setLoading] = useState(true);
  const [elegible, setElegible] = useState(false);
  const [avance, setAvance] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [recursos, setRecursos] = useState({ formatos: [], reglamento: null, repositorio: [] });

  const [uploading, setUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [docTypeToUpload, setDocTypeToUpload] = useState('');

  const docTypes = [
    'Carta de aceptación',
    'Plan de trabajo',
    'Reporte mensual',
    'Informe final',
    'Carta de liberación'
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const resElegibilidad = await servicioSocialService.checkElegibilidad();
      if (!resElegibilidad.data.elegible) {
        setElegible(false);
        return;
      }
      setElegible(true);

      const [resAvance, resRecursos] = await Promise.all([
        servicioSocialService.getAvance(),
        servicioSocialService.getRecursos()
      ]);

      setAvance(resAvance.data.registro);
      setDocumentos(resAvance.data.documentos);
      setRecursos(resRecursos.data);

    } catch (error) {
      toast.error('Error al cargar datos del servicio social');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!fileToUpload || !docTypeToUpload) return toast.error('Completa los campos');

    try {
      setUploading(true);
      const data = new FormData();
      data.append('tipo_documento', docTypeToUpload);
      data.append('archivo', fileToUpload);

      await servicioSocialService.postDocumento(data);
      toast.success('Documento enviado para revisión');
      
      setFileToUpload(null);
      setDocTypeToUpload('');
      fetchData();
    } catch (error) {
      toast.error('Error al subir documento');
    } finally {
      setUploading(false);
      // Reset input
      const fileInput = document.getElementById('file-upload-ss');
      if (fileInput) fileInput.value = '';
    }
  };

  if (loading) return <div className="p-12 text-center text-unich-blue"><Loader2 className="animate-spin w-10 h-10 mx-auto" /></div>;

  if (!elegible) {
    return (
      <div className="flex items-center justify-center p-6 md:p-12 animate-fade-in">
        <Card className="max-w-md text-center border-orange-200 bg-orange-50/50">
          <CardContent className="p-8">
            <GraduationCap className="text-orange-400 w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Servicio Social No Habilitado</h2>
            <p className="text-gray-600 leading-relaxed">Aún no cumples con el porcentaje de créditos necesario o el Área de Vinculación no ha dado de alta tu expediente para iniciar este trámite.</p>
            <Button className="mt-6 bg-orange-500 hover:bg-orange-600" onClick={() => window.location.href = '/dashboard'}>Volver al Inicio</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const porcentaje = avance.horas_requeridas > 0 ? Math.min(100, Math.round((avance.horas_acumuladas / avance.horas_requeridas) * 100)) : 0;

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex items-center gap-4 border-b pb-4 border-gray-100">
        <div className="bg-gradient-to-br from-unich-blue to-indigo-600 p-3 rounded-2xl shadow-lg shadow-unich-blue/20 text-white">
          <GraduationCap size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900">Mi Servicio Social</h1>
          <p className="text-gray-500 font-medium tracking-wide">Da seguimiento a tu avance, carga tus reportes y descarga formatos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Estatus y Avance */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-0 shadow-xl shadow-gray-200/50 bg-gradient-to-br from-white to-gray-50 rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <GraduationCap size={150} />
            </div>
            <CardContent className="p-8 relative z-10">
              <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-6">Tu Progreso General</h3>
              
              <div className="flex flex-col items-center justify-center mb-8">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="8"></circle>
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#4f46e5" strokeWidth="8"
                      strokeDasharray={`${porcentaje * 2.83} 283`} strokeLinecap="round" className="transition-all duration-1000 ease-out">
                    </circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-gray-900">{porcentaje}%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Acumuladas</p>
                  <p className="text-2xl font-black text-indigo-600">{avance.horas_acumuladas}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Requeridas</p>
                  <p className="text-2xl font-black text-gray-400">{avance.horas_requeridas}</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Institución</span>
                  <span className="font-bold text-gray-900 text-right">{avance.institucion}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Estatus</span>
                  <span className="font-bold text-indigo-600 uppercase tracking-wider">{avance.estatus}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subir Documento */}
          <Card className="border border-indigo-100 bg-indigo-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-indigo-900 flex items-center gap-2"><Upload size={18}/> Enviar Reporte o Formato</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <select 
                    required 
                    value={docTypeToUpload}
                    onChange={(e) => setDocTypeToUpload(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="">Selecciona qué vas a subir...</option>
                    {docTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <input 
                    id="file-upload-ss"
                    type="file" 
                    required accept=".pdf"
                    onChange={(e) => setFileToUpload(e.target.files[0])}
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm text-gray-600 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  <p className="text-xs text-indigo-400 mt-1">Solo PDF, máx. 10MB</p>
                </div>
                <Button type="submit" disabled={uploading} className="w-full bg-indigo-600 hover:bg-indigo-700">
                  {uploading ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle size={16} className="mr-2"/>} Enviar a Revisión
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: Historial y Recursos */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Historial de Documentos */}
          <Card className="border border-gray-100 h-[450px] flex flex-col">
            <CardHeader className="border-b border-gray-50 pb-4">
              <CardTitle className="flex items-center gap-2 text-gray-800"><Clock className="text-gray-400"/> Historial de Revisiones</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1">
              <div className="divide-y divide-gray-50">
                {documentos.length === 0 ? (
                  <div className="p-12 text-center text-gray-400">Aún no has enviado ningún archivo para revisión.</div>
                ) : (
                  documentos.map(doc => (
                    <div key={doc.id} className="p-4 md:p-6 hover:bg-gray-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                      
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full shrink-0 ${
                          doc.estatus === 'aprobado' ? 'bg-emerald-100 text-emerald-600' :
                          doc.estatus === 'rechazado' ? 'bg-rose-100 text-rose-600' :
                          'bg-amber-100 text-amber-600'
                        }`}>
                          {doc.estatus === 'aprobado' ? <CheckCircle size={20} /> : doc.estatus === 'rechazado' ? <AlertCircle size={20}/> : <Clock size={20}/>}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-base">{doc.tipo_documento}</h4>
                          <p className="text-xs font-medium text-gray-400 mt-1">Enviado: {new Date(doc.fecha_subida).toLocaleString()}</p>
                          <div className="mt-2 text-sm font-semibold capitalize flex items-center gap-1">
                            Estado: <span className={
                              doc.estatus === 'aprobado' ? 'text-emerald-600' :
                              doc.estatus === 'rechazado' ? 'text-rose-600' :
                              'text-amber-600'
                            }>{doc.estatus}</span>
                          </div>
                        </div>
                      </div>

                      <Button variant="outline" size="sm" onClick={() => window.open(`${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${doc.archivo}`, '_blank')}>
                        Ver PDF
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recursos Descargables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Formatos Oficiales */}
            <Card className="border border-gray-100">
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2 text-gray-700"><FileText className="text-blue-500" size={18}/> Formatos Descargables</CardTitle></CardHeader>
              <CardContent className="pt-0 h-64 overflow-y-auto custom-scrollbar">
                {recursos.formatos.length > 0 ? (
                  <ul className="space-y-2">
                    {recursos.formatos.map(f => (
                      <li key={f.id} className="group border border-transparent hover:border-blue-100 hover:bg-blue-50/50 rounded-xl transition-all p-2 pr-4 flex justify-between items-center cursor-pointer" onClick={() => window.open(`${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${f.archivo_pdf}`, '_blank')}>
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="bg-blue-100 text-blue-600 p-2 rounded-lg shrink-0"><FileText size={16}/></div>
                          <span className="text-sm font-semibold text-gray-700 truncate group-hover:text-blue-700 transition-colors">{f.nombre}</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors shrink-0"/>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-gray-400 p-4 text-center border border-dashed rounded-xl border-gray-200">No hay formatos disponibles.</p>}
              </CardContent>
            </Card>

            <div className="space-y-6">
              {/* Reglamento */}
              <Card className={`border border-gray-100 transition-all ${recursos.reglamento ? 'hover:border-unich-magenta hover:shadow-md cursor-pointer' : ''}`}
                    onClick={() => recursos.reglamento && window.open(`${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${recursos.reglamento.archivo_pdf}`, '_blank')}>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="bg-magenta-100 text-unich-magenta p-4 rounded-xl"><BookOpen size={24}/></div>
                  <div>
                    <h4 className="font-bold text-gray-900 group-hover:text-unich-magenta">Reglamento Oficial</h4>
                    {recursos.reglamento ? (
                      <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wider">{recursos.reglamento.version || 'Vigente'} — <span className="text-unich-magenta font-semibold">Descargar PDF →</span></p>
                    ) : <p className="text-xs text-gray-400">No publicado</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Repositorio */}
              <Card className="border border-emerald-100 bg-emerald-50/30">
                <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2 text-emerald-800"><Archive size={18}/> Repositorio de Proyectos</CardTitle></CardHeader>
                <CardContent className="h-28 overflow-y-auto custom-scrollbar">
                  {recursos.repositorio.length > 0 ? (
                    <ul className="space-y-2">
                       {recursos.repositorio.map(r => (
                        <li key={r.id} className="text-sm flex items-start gap-2 group cursor-pointer" onClick={() => window.open(`${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${r.archivo_pdf}`, '_blank')}>
                           <span className="text-emerald-500 mt-0.5"><CheckCircle size={14}/></span>
                           <span className="font-semibold text-gray-700 group-hover:text-emerald-700 leading-tight">{r.titulo}</span>
                        </li>
                       ))}
                    </ul>
                  ) : <p className="text-xs text-emerald-600 opacity-60">Sin proyectos públicos aún.</p>}
                </CardContent>
              </Card>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
};

export default MiServicioSocial;
