import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, FileSignature } from 'lucide-react';
import { juridicoService } from '../../../services/juridicoService';
import { Card, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { FormGroup, Label, Input } from '../../../components/ui/Form';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/sise/backend/public';

const ConvenioForm = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [currentFileUrl, setCurrentFileUrl] = useState(null);
  
  const [form, setForm] = useState({
    numero_control: '',
    tipo_convenio: '',
    instituciones: '',
    descripcion: '',
    fecha_firma: '',
    fecha_vencimiento: '',
    archivo: null,
  });

  useEffect(() => {
    if (isEditing) {
      juridicoService.getConvenio(id).then(data => {
        setForm({
          numero_control: data.numero_control,
          tipo_convenio: data.tipo_convenio,
          instituciones: data.instituciones,
          descripcion: data.descripcion ?? '',
          fecha_firma: data.fecha_firma ? data.fecha_firma.split('T')[0] : '',
          fecha_vencimiento: data.fecha_vencimiento ? data.fecha_vencimiento.split('T')[0] : '',
          archivo: null, // Keep null to avoid replacing unless user drops a new file
        });
        
        if (data.archivo) {
          setCurrentFileUrl(`${API_URL.replace('/api', '')}/storage/${data.archivo}`);
        }
        
        setLoading(false);
      }).catch((err) => {
        console.error(err);
        nav('/juridico/convenios');
      });
    }
  }, [id, isEditing, nav]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Usar FormData por la subida de archivos PDFs
      const data = new FormData();
      Object.keys(form).forEach(key => {
        if (form[key] !== null && form[key] !== '') {
          data.append(key, form[key]);
        }
      });

      if (isEditing) {
        await juridicoService.updateConvenio(id, data);
      } else {
        await juridicoService.createConvenio(data);
      }
      nav('/juridico/convenios');
    } catch (err) {
      alert(err.response?.data?.message ?? 'Error al guardar el convenio o contrato');
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
          <FileSignature size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">{isEditing ? 'Editar Convenio' : 'Nuevo Convenio Institucional'}</h1>
          <p className="text-sm text-gray-500">Acuerdos, contratos y alianzas legales de la UNICH.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <FormGroup>
                <Label htmlFor="numero_control">N° de Control interno *</Label>
                <Input 
                  id="numero_control" 
                  value={form.numero_control} 
                  onChange={e => setForm({ ...form, numero_control: e.target.value })} 
                  required 
                  placeholder="Ej. CONV-UNICH-2026-001" 
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="tipo_convenio">Tipo de Convenio *</Label>
                <Input 
                  id="tipo_convenio" 
                  value={form.tipo_convenio} 
                  onChange={e => setForm({ ...form, tipo_convenio: e.target.value })} 
                  required 
                  placeholder="Ej. Marco, Específico, Colaboración Académica..." 
                />
              </FormGroup>

              <FormGroup className="md:col-span-2">
                <Label htmlFor="instituciones">Instituciones o Partes Involucradas *</Label>
                <Input 
                  id="instituciones" 
                  value={form.instituciones} 
                  onChange={e => setForm({ ...form, instituciones: e.target.value })} 
                  required 
                  placeholder="Ej. Secretaría de Educación, UNAM, Gobierno del Estado..." 
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="fecha_firma">Fecha de Firma (Celebración)</Label>
                <Input 
                  type="date"
                  id="fecha_firma" 
                  value={form.fecha_firma} 
                  onChange={e => setForm({ ...form, fecha_firma: e.target.value })} 
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="fecha_vencimiento">Fecha de Vencimiento / Término</Label>
                <Input 
                  type="date"
                  id="fecha_vencimiento" 
                  value={form.fecha_vencimiento} 
                  onChange={e => setForm({ ...form, fecha_vencimiento: e.target.value })} 
                />
                <p className="text-xs text-gray-400 mt-1">Sirve para detonar alertas automáticas de renovación.</p>
              </FormGroup>

              <FormGroup className="md:col-span-2">
                <Label htmlFor="descripcion">Descripción y Objetivo Principal</Label>
                <textarea 
                  id="descripcion" 
                  rows="3" 
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors text-sm"
                  value={form.descripcion} 
                  onChange={e => setForm({ ...form, descripcion: e.target.value })} 
                  placeholder="Resumen del objeto del convenio o contrato..." 
                />
              </FormGroup>

              <div className="md:col-span-2 space-y-3 pt-4 border-t border-gray-100">
                <Label htmlFor="archivo">Adjuntar Archivo PDF Oficial</Label>
                <input 
                  type="file" 
                  id="archivo"
                  accept=".pdf"
                  onChange={e => setForm({ ...form, archivo: e.target.files[0] })}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors cursor-pointer"
                />
                
                {isEditing && currentFileUrl && (
                  <div className="text-sm mt-3 flex items-center gap-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                    <span className="text-blue-800 font-medium">Documento subido:</span>
                    <a href={currentFileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline font-medium hover:text-indigo-800">
                      Ver PDF Actual
                    </a>
                    <span className="text-gray-400 text-xs ml-auto">(Subir archivo nuevo reemplazará el existente)</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <Button variant="outline" type="button" onClick={() => nav(-1)}>Cancelar</Button>
              <Button variant="primary" type="submit" isLoading={saving} icon={Save}>Guardar Registro</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConvenioForm;
