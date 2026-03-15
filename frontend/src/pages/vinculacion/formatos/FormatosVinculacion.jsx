import React, { useState, useEffect } from 'react';
import { vinculacionService } from '../../../services/vinculacionService';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { FileText, Upload, Plus, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
const toast = { success: alert, error: alert };

const FormatosVinculacion = () => {
  const [formatos, setFormatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    archivo: null
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await vinculacionService.getFormatos();
      setFormatos(res.data);
    } catch (error) {
      toast.error('Error al cargar formatos');
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
      data.append('nombre', formData.nombre);
      data.append('descripcion', formData.descripcion);
      data.append('archivo', formData.archivo);

      await vinculacionService.createFormato(data);
      toast.success('Formato subido exitosamente');
      setShowForm(false);
      setFormData({ nombre: '', descripcion: '', archivo: null });
      fetchData();
    } catch (error) {
      toast.error('Error al subir el formato');
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await vinculacionService.toggleFormato(id);
      toast.success('Estatus actualizado');
      fetchData();
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este formato oficialmente?')) return;
    try {
      await vinculacionService.deleteFormato(id);
      toast.success('Formato eliminado');
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
            <FileText className="text-unich-magenta" /> Formatos Oficiales
          </h1>
          <p className="text-gray-500 mt-1">Sube y gestiona los formatos de Servicio Social disponibles para descarga de alumnos.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={20} className="mr-2" /> Subir Formato
        </Button>
      </div>

      {showForm && (
        <Card className="bg-gray-50/50">
          <CardContent className="p-6">
            <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Formato</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-unich-magenta"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  placeholder="Ej: Carta de Aceptación (Machote)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Archivo PDF</label>
                <input 
                  type="file" required accept=".pdf"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-unich-magenta"
                  onChange={(e) => setFormData({...formData, archivo: e.target.files[0]})}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción corta (opcional)</label>
                <input 
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-unich-magenta"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? <Loader2 className="animate-spin mr-2" /> : <Upload size={18} className="mr-2" />}
                  Subir y Publicar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12"><Loader2 className="animate-spin h-8 w-8 text-unich-magenta mx-auto" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {formatos.map(f => (
            <Card key={f.id} className={`transition-all ${!f.activo && 'opacity-60 bg-gray-50'}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl">
                    <FileText size={24} />
                  </div>
                  <Badge variant={f.activo ? 'success' : 'secondary'}>{f.activo ? 'Público' : 'Oculto'}</Badge>
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">{f.nombre}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px]">{f.descripcion}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => window.open(`${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${f.archivo_pdf}`, '_blank')} className="flex-1">
                    Ver PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleToggle(f.id)} className="px-2" title={f.activo ? 'Ocultar' : 'Mostrar'}>
                    {f.activo ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </Button>
                  <Button variant="outline" size="sm" className="px-2 text-rose-600 border-rose-200 hover:bg-rose-50" onClick={() => handleDelete(f.id)}>
                    <Trash2 size={16}/>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {formatos.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed">
              No hay formatos registrados aún.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default FormatosVinculacion;
