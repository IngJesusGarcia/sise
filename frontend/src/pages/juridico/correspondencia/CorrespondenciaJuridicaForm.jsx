import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Mail, FileText } from 'lucide-react';
import { juridicoService } from '../../../services/juridicoService';
import { Card, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { FormGroup, Label, Input } from '../../../components/ui/Form';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/sise/backend/public';

const CorrespondenciaJuridicaForm = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [abogados, setAbogados] = useState([]);
  const [currentFileUrl, setCurrentFileUrl] = useState(null);
  
  const [form, setForm] = useState({
    tipo_documento: '',
    asunto: '',
    abogado_id: '',
    fecha: new Date().toISOString().split('T')[0],
    estatus: 'registrado',
    archivo: null,
  });

  useEffect(() => {
    juridicoService.getAbogados({ estatus: 1 }).then(data => setAbogados(data));

    if (isEditing) {
      juridicoService.getCorrespondencia(id).then(data => {
        setForm({
          tipo_documento: data.tipo_documento,
          asunto: data.asunto,
          abogado_id: data.abogado_id ?? '',
          fecha: data.fecha ? data.fecha.split('T')[0] : '',
          estatus: data.estatus,
          archivo: null,
        });
        
        if (data.archivo) {
          setCurrentFileUrl(`${API_URL.replace('/api', '')}/storage/${data.archivo}`);
        }
        setLoading(false);
      }).catch((err) => {
        console.error(err);
        nav('/juridico/correspondencia');
      });
    }
  }, [id, isEditing, nav]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      Object.keys(form).forEach(key => {
        if (form[key] !== null && form[key] !== '') {
          data.append(key, form[key]);
        }
      });

      if (isEditing) {
        await juridicoService.updateCorrespondencia(id, data);
      } else {
        await juridicoService.createCorrespondencia(data);
      }
      nav('/juridico/correspondencia');
    } catch (err) {
      alert(err.response?.data?.message ?? 'Error al guardar el documento jurídico');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-64 flex items-center justify-center"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
        <button onClick={() => nav(-1)} className="p-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition">
          <ArrowLeft size={20} />
        </button>
        <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
          <Mail size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">{isEditing ? 'Editar Documento Jurídico' : 'Nuevo Oficio o Requerimiento'}</h1>
          <p className="text-sm text-gray-500">Registro de notificaciones, amparos, citatorios o resoluciones recibidas o emitidas.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <FormGroup>
                <Label htmlFor="tipo_documento">Tipo de Documento *</Label>
                <Input 
                  id="tipo_documento" 
                  value={form.tipo_documento} 
                  onChange={e => setForm({ ...form, tipo_documento: e.target.value })} 
                  required 
                  placeholder="Ej. Citatorio, Notificación, Amparo, Requisición..." 
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="fecha">Fecha de Recepción / Emisión *</Label>
                <Input 
                  type="date"
                  id="fecha" 
                  value={form.fecha} 
                  onChange={e => setForm({ ...form, fecha: e.target.value })} 
                  required
                />
              </FormGroup>

              <FormGroup className="md:col-span-2">
                <Label htmlFor="asunto">Asunto / Resumen Breve *</Label>
                <Input 
                  id="asunto" 
                  value={form.asunto} 
                  onChange={e => setForm({ ...form, asunto: e.target.value })} 
                  required 
                  placeholder="Descripción concisa del contenido del documento..." 
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="abogado_id">Abogado Turnado / Responsable</Label>
                <select
                  id="abogado_id" 
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors text-sm"
                  value={form.abogado_id} 
                  onChange={e => setForm({ ...form, abogado_id: e.target.value })} 
                >
                  <option value="">-- Sin asignar --</option>
                  {abogados.map(ab => <option key={ab.id} value={ab.id}>{ab.nombre}</option>)}
                </select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="estatus">Estatus de Atención</Label>
                <select
                  id="estatus" 
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors text-sm"
                  value={form.estatus} 
                  onChange={e => setForm({ ...form, estatus: e.target.value })} 
                  required
                >
                  <option value="registrado">Registrado / Recibido</option>
                  <option value="en_proceso">En Proceso de Respuesta / Trámite</option>
                  <option value="atendido">Atendido / Contestado</option>
                  <option value="archivado">Archivado Sin Respuesta</option>
                </select>
              </FormGroup>

              <div className="md:col-span-2 space-y-3 pt-4 border-t border-gray-100">
                <Label htmlFor="archivo">Documento PDF Escaneado</Label>
                <input 
                  type="file" 
                  id="archivo"
                  accept=".pdf"
                  onChange={e => setForm({ ...form, archivo: e.target.files[0] })}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors cursor-pointer"
                />
                
                {isEditing && currentFileUrl && (
                  <div className="text-sm mt-3 flex items-center gap-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                    <FileText size={18} className="text-blue-600" />
                    <span className="text-blue-800 font-medium">Archivo actual:</span>
                    <a href={currentFileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline font-medium hover:text-indigo-800">
                      Descargar / Ver PDF
                    </a>
                  </div>
                )}
              </div>
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

export default CorrespondenciaJuridicaForm;
