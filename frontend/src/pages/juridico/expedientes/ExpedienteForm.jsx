import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, FolderOpen } from 'lucide-react';
import { juridicoService } from '../../../services/juridicoService';
import { Card, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { FormGroup, Label, Input } from '../../../components/ui/Form';

const ExpedienteForm = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const isEditing = Boolean(id);

  const [abogados, setAbogados] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    numero_expediente: '',
    categoria: '',
    juzgado: '',
    abogado_id: '',
    fecha_inicio: '',
    estatus: 'activo',
    observaciones: '',
  });

  useEffect(() => {
    // Fetch abogados para el dropdown
    juridicoService.getAbogados({ estatus: 1 }).then(data => setAbogados(data));

    if (isEditing) {
      juridicoService.getExpediente(id).then(data => {
        setForm({
          numero_expediente: data.numero_expediente,
          categoria: data.categoria,
          juzgado: data.juzgado ?? '',
          abogado_id: data.abogado_id ?? '',
          fecha_inicio: data.fecha_inicio ? data.fecha_inicio.split('T')[0] : '',
          estatus: data.estatus,
          observaciones: data.observaciones ?? ''
        });
        setLoading(false);
      }).catch((err) => {
        console.error(err);
        nav('/juridico/expedientes');
      });
    }
  }, [id, isEditing, nav]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEditing) {
        await juridicoService.updateExpediente(id, form);
      } else {
        await juridicoService.createExpediente(form);
      }
      nav('/juridico/expedientes');
    } catch (err) {
      alert(err.response?.data?.message ?? 'Error al guardar el expediente');
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
          <FolderOpen size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">{isEditing ? 'Editar Expediente' : 'Aperturar Expediente'}</h1>
          <p className="text-sm text-gray-500">Registra y clasifica el asunto o juicio jurídico.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <FormGroup>
                <Label htmlFor="numero_expediente">N° de Expediente *</Label>
                <Input 
                  id="numero_expediente" 
                  value={form.numero_expediente} 
                  onChange={e => setForm({ ...form, numero_expediente: e.target.value })} 
                  required 
                  placeholder="Ej. 1234/2026" 
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="categoria">Categoría o Materia *</Label>
                <Input 
                  id="categoria" 
                  value={form.categoria} 
                  onChange={e => setForm({ ...form, categoria: e.target.value })} 
                  required 
                  placeholder="Ej. Legal, Administrativo, Civil, etc." 
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="juzgado">Juzgado o Autoridad Institucional</Label>
                <Input 
                  id="juzgado" 
                  value={form.juzgado} 
                  onChange={e => setForm({ ...form, juzgado: e.target.value })} 
                  placeholder="Ej. Junta Local de Conciliación" 
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="abogado_id">Abogado Asignado</Label>
                <select
                  id="abogado_id" 
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors text-sm"
                  value={form.abogado_id} 
                  onChange={e => setForm({ ...form, abogado_id: e.target.value })} 
                >
                  <option value="">-- Sin asignar --</option>
                  {abogados.map(ab => <option key={ab.id} value={ab.id}>{ab.nombre} ({ab.especialidad || 'General'})</option>)}
                </select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="fecha_inicio">Fecha de Inicio / Radicación</Label>
                <Input 
                  type="date"
                  id="fecha_inicio" 
                  value={form.fecha_inicio} 
                  onChange={e => setForm({ ...form, fecha_inicio: e.target.value })} 
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="estatus">Estatus Procesal</Label>
                <select
                  id="estatus" 
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors text-sm"
                  value={form.estatus} 
                  onChange={e => setForm({ ...form, estatus: e.target.value })} 
                  required
                >
                  <option value="activo">ACTIVO (En Trámite)</option>
                  <option value="concluido">CONCLUIDO (Laudo Firme / Resol.)</option>
                  <option value="suspendido">SUSPENDIDO (Amparo / Apelación)</option>
                  <option value="archivado">ARCHIVADO (Baja Definitiva)</option>
                </select>
              </FormGroup>

              <FormGroup className="md:col-span-2">
                <Label htmlFor="observaciones">Observaciones / Resumen del Caso</Label>
                <textarea 
                  id="observaciones" 
                  rows="4" 
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors text-sm"
                  value={form.observaciones} 
                  onChange={e => setForm({ ...form, observaciones: e.target.value })} 
                  placeholder="Escriba aquí los detalles relevantes o síntesis del expediente..." 
                />
              </FormGroup>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <Button variant="outline" type="button" onClick={() => nav(-1)}>Cancelar</Button>
              <Button variant="primary" type="submit" isLoading={saving} icon={Save}>Guardar Expediente</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpedienteForm;
