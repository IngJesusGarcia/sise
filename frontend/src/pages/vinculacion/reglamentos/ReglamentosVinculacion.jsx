import React, { useState, useEffect } from 'react';
import { vinculacionService } from '../../../services/vinculacionService';
import { Card, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { BookOpen, Upload, Loader2, Trash2, CheckCircle } from 'lucide-react';
const toast = { success: alert, error: alert };

const ReglamentosVinculacion = () => {
  const [reglamentos, setReglamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    titulo: '',
    version: '',
    archivo: null
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await vinculacionService.getReglamentos();
      setReglamentos(res.data);
    } catch (error) {
      toast.error('Error al cargar reglamentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.archivo) return toast.error('Selecciona el PDF del reglamento');
    
    try {
      setIsUploading(true);
      const data = new FormData();
      data.append('titulo', formData.titulo);
      data.append('version', formData.version);
      data.append('archivo', formData.archivo);

      await vinculacionService.createReglamento(data);
      toast.success('Reglamento publicado exitosamente');
      setShowForm(false);
      setFormData({ titulo: '', version: '', archivo: null });
      fetchData();
    } catch (error) {
      toast.error('Error al subir el reglamento');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetActivo = async (id) => {
    try {
      await vinculacionService.setReglamentoActivo(id);
      toast.success('Reglamento actualizado como versión vigente');
      fetchData();
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta versión del reglamento?')) return;
    try {
      await vinculacionService.deleteReglamento(id);
      toast.success('Reglamento eliminado');
      fetchData();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="text-unich-blue" /> Reglamento del Servicio Social
          </h1>
          <p className="text-gray-500 mt-1">Sube versiones del reglamento. Solo el reglamento Activo es visible para estudiantes.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-unich-blue hover:bg-unich-blue/90">
          Nueva Versión
        </Button>
      </div>

      {showForm && (
        <Card className="bg-blue-50/30 border-blue-100">
          <CardContent className="p-6">
            <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título Oficial</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-unich-blue"
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  placeholder="Reglamento Institucional de S.S."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Archivo PDF</label>
                <input 
                  type="file" required accept=".pdf"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-unich-blue"
                  onChange={(e) => setFormData({...formData, archivo: e.target.files[0]})}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Versión o Año (Opcional)</label>
                <input 
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-unich-blue"
                  value={formData.version}
                  onChange={(e) => setFormData({...formData, version: e.target.value})}
                  placeholder="Ej: v2.0 - 2025"
                />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button type="submit" disabled={isUploading} className="bg-unich-blue hover:bg-unich-blue/90">
                  {isUploading ? <Loader2 className="animate-spin mr-2" /> : <Upload size={18} className="mr-2" />}
                  Subir y Establecer Activo
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12"><Loader2 className="animate-spin h-8 w-8 text-unich-blue mx-auto" /></div>
      ) : (
        <div className="space-y-4">
          {reglamentos.map(reg => (
            <Card key={reg.id} className={`transition-all ${reg.activo ? 'border-l-4 border-l-unich-magenta shadow-md' : 'opacity-70 bg-gray-50'}`}>
              <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${reg.activo ? 'bg-magenta-100 text-unich-magenta' : 'bg-gray-200 text-gray-500'}`}>
                    {reg.activo ? <CheckCircle size={28} /> : <BookOpen size={28} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{reg.titulo}</h3>
                    <p className="text-sm text-gray-500">Versión: {reg.version || 'Única'} — Subido el {new Date(reg.fecha_publicacion).toLocaleDateString()}</p>
                    {reg.activo && <Badge variant="success" className="mt-2">Versión Vigente Pública</Badge>}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {!reg.activo && (
                    <Button variant="outline" size="sm" onClick={() => handleSetActivo(reg.id)}>
                      Hacer Vigente
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => window.open(`${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${reg.archivo_pdf}`, '_blank')}>
                    Ver PDF
                  </Button>
                  <Button variant="outline" size="sm" className="px-2 text-rose-600 border-rose-200 hover:bg-rose-50" onClick={() => handleDelete(reg.id)}>
                    <Trash2 size={16}/>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {reglamentos.length === 0 && (
            <div className="py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed">
              No se ha subido ningún reglamento al sistema.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default ReglamentosVinculacion;
