import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Save, ArrowLeft, Upload } from 'lucide-react';
import { correspondenciaService } from '../../../services/correspondenciaService';
import { Card, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { FormGroup, Label, Input, Select } from '../../../components/ui/Form';

const DocumentoForm = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const isEditing = Boolean(id);
  
  const [tipos, setTipos] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [archivoActual, setArchivoActual] = useState(null);

  const [form, setForm] = useState({
    tipo_documento_id: '',
    asunto: '',
    descripcion: '',
    area_origen: '',
    area_destino: '',
    responsable: '',
    fecha: new Date().toISOString().split('T')[0],
  });
  const [archivo, setArchivo] = useState(null);

  useEffect(() => {
    correspondenciaService.getTipos({ activo: 1 }).then(setTipos);
    correspondenciaService.getDepartamentos().then(setDepartamentos);

    if (isEditing) {
      correspondenciaService.getDocumento(id).then(data => {
        setForm({
          tipo_documento_id: data.tipo_documento_id,
          asunto: data.asunto,
          descripcion: data.descripcion ?? '',
          area_origen: data.area_origen,
          area_destino: data.area_destino,
          responsable: data.responsable ?? '',
          fecha: data.fecha,
        });
        setArchivoActual(data.archivo);
        setLoading(false);
      }).catch(() => nav('/correspondencia/documentos'));
    }
  }, [id, isEditing, nav]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Use FormData for file upload
    const fd = new FormData();
    Object.keys(form).forEach(k => {
      if (form[k] !== null && form[k] !== undefined) {
        fd.append(k, form[k]);
      }
    });
    if (archivo) fd.append('archivo', archivo);

    try {
      if (isEditing) {
        await correspondenciaService.updateDocumento(id, fd);
      } else {
        await correspondenciaService.createDocumento(fd);
      }
      nav('/correspondencia/documentos');
    } catch (err) {
      alert(err.response?.data?.message ?? 'Error guardando documento.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-64 flex items-center justify-center"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
        <button onClick={() => nav(-1)} className="p-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition"><ArrowLeft size={20} /></button>
        <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl"><FileText size={24} /></div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">{isEditing ? 'Editar Oficio' : 'Nuevo Oficio'}</h1>
          <p className="text-sm text-gray-500">Completa los datos del documento institucional.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormGroup>
                <Label htmlFor="tipo_documento_id">Tipo de Documento *</Label>
                <Select id="tipo_documento_id" value={form.tipo_documento_id} onChange={e => setForm({ ...form, tipo_documento_id: e.target.value })} required>
                  <option value="">Seleccionar tipo...</option>
                  {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                </Select>
              </FormGroup>
              <FormGroup>
                <Label htmlFor="fecha">Fecha del Documento *</Label>
                <Input type="date" id="fecha" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} required />
              </FormGroup>
            </div>

            <FormGroup>
              <Label htmlFor="asunto">Asunto *</Label>
              <Input id="asunto" value={form.asunto} onChange={e => setForm({ ...form, asunto: e.target.value })} required placeholder="Breve descripción del asunto..." />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="descripcion">Descripción / Cuerpo (Opcional)</Label>
              <textarea id="descripcion" rows="4" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors text-sm"
                value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Detalles adicionales del documento..." />
            </FormGroup>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <FormGroup>
                <Label htmlFor="area_origen" className="text-indigo-800">Área de Origen *</Label>
                <Select id="area_origen" value={form.area_origen} onChange={e => setForm({ ...form, area_origen: e.target.value })} required>
                  <option value="">Seleccionar área de origen...</option>
                  {departamentos.map(d => <option key={d.id} value={d.nombre}>{d.nombre}</option>)}
                </Select>
              </FormGroup>
              <FormGroup>
                <Label htmlFor="area_destino" className="text-indigo-800">Área de Destino *</Label>
                <Select id="area_destino" value={form.area_destino} onChange={e => setForm({ ...form, area_destino: e.target.value })} required>
                  <option value="">Seleccionar área de destino...</option>
                  {departamentos.map(d => <option key={d.id} value={d.nombre}>{d.nombre}</option>)}
                </Select>
              </FormGroup>
              <FormGroup className="md:col-span-2">
                <Label htmlFor="responsable" className="text-indigo-800">Responsable / Dirigido a (Opcional)</Label>
                <Input id="responsable" value={form.responsable} onChange={e => setForm({ ...form, responsable: e.target.value })} placeholder="Nombre de la persona responsable..." />
              </FormGroup>
            </div>

            <div className="p-4 border border-dashed border-gray-300 rounded-2xl bg-white text-center hover:bg-gray-50 transition-colors">
              <Upload className="mx-auto h-8 w-8 text-indigo-400 mb-2" />
              <Label htmlFor="archivo" className="cursor-pointer text-indigo-600 font-bold hover:underline">
                Haz clic para adjuntar archivo PDF o de imagen
              </Label>
              <input id="archivo" type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={e => setArchivo(e.target.files[0])} />
              {archivo && <p className="mt-2 text-sm text-gray-600 font-medium">Seleccionado: {archivo.name}</p>}
              {!archivo && archivoActual && (
                <p className="mt-2 text-sm text-gray-500">Documento actual cargado. Sube un nuevo archivo para reemplazarlo.</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <Button variant="outline" type="button" onClick={() => nav(-1)}>Cancelar</Button>
              <Button variant="primary" type="submit" isLoading={saving} icon={Save}>Guardar Oficio</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
export default DocumentoForm;
