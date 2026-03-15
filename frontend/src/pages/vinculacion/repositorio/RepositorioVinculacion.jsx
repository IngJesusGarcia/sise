import React, { useState, useEffect } from 'react';
import { vinculacionService } from '../../../services/vinculacionService';
import { Card, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Archive, Upload, Plus, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
const toast = { success: alert, error: alert };

const RepositorioVinculacion = () => {
  const [repositorio, setRepositorio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    archivo: null
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await vinculacionService.getRepositorio();
      setRepositorio(res.data);
    } catch (error) {
      toast.error('Error al cargar repositorio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.archivo) return toast.error('Selecciona un archivo PDF');
    
    try {
      setIsUploading(true);
      const data = new FormData();
      data.append('titulo', formData.titulo);
      data.append('descripcion', formData.descripcion);
      data.append('archivo', formData.archivo);

      await vinculacionService.createRepositorio(data);
      toast.success('Proyecto subido al repositorio');
      setShowForm(false);
      setFormData({ titulo: '', descripcion: '', archivo: null });
      fetchData();
    } catch (error) {
      toast.error('Error al subir el proyecto');
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await vinculacionService.toggleRepositorio(id);
      toast.success('Estatus de visibilidad actualizado');
      fetchData();
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este proyecto del repositorio publico?')) return;
    try {
      await vinculacionService.deleteRepositorio(id);
      toast.success('Proyecto eliminado');
      fetchData();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Archive className="text-emerald-600" /> Repositorio de Proyectos
          </h1>
          <p className="text-gray-500 mt-1">Comparte proyectos culminados para servir de consulta e inspiración a nuevos estudiantes.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus size={20} className="mr-2" /> Agregar Proyecto
        </Button>
      </div>

      {showForm && (
        <Card className="bg-emerald-50/50 border-emerald-100">
          <CardContent className="p-6">
            <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título del Proyecto Final</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Archivo de Memoria PDF</label>
                <input 
                  type="file" required accept=".pdf"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500"
                  onChange={(e) => setFormData({...formData, archivo: e.target.files[0]})}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción corta o Resumen</label>
                <textarea 
                  required rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button type="submit" disabled={isUploading} className="bg-emerald-600 hover:bg-emerald-700">
                  {isUploading ? <Loader2 className="animate-spin mr-2" /> : <Upload size={18} className="mr-2" />}
                  Subir al Repositorio
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12"><Loader2 className="animate-spin h-8 w-8 text-emerald-600 mx-auto" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repositorio.map(r => (
            <Card key={r.id} className={`transition-all hover:shadow-lg ${!r.activo && 'opacity-60 bg-gray-50'}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-emerald-100 text-emerald-600 p-3 rounded-xl">
                    <Archive size={24} />
                  </div>
                  <Badge variant={r.activo ? 'success' : 'secondary'}>{r.activo ? 'Público' : 'Oculto'}</Badge>
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-1 leading-snug">{r.titulo}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-3 min-h-[60px]">{r.descripcion}</p>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-400 font-medium">Subido: {new Date(r.fecha_subida).toLocaleDateString()}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.open(`${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${r.archivo_pdf}`, '_blank')} className="px-2" title="Ver Memoria PDF">
                      <Archive size={16}/>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleToggle(r.id)} className="px-2" title={r.activo ? 'Ocultar a Estudiantes' : 'Hacer Público'}>
                      {r.activo ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </Button>
                    <Button variant="outline" size="sm" className="px-2 text-rose-600 border-rose-200 hover:bg-rose-50" onClick={() => handleDelete(r.id)}>
                      <Trash2 size={16}/>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {repositorio.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed">
              No hay proyectos en el repositorio aún. Agrega proyectos modelo para inspirar a los estudiantes.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default RepositorioVinculacion;
