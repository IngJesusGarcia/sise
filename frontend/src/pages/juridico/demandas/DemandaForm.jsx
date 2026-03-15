import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Scale } from 'lucide-react';
import { juridicoService } from '../../../services/juridicoService';
import { Card, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { FormGroup, Label, Input } from '../../../components/ui/Form';
import { Badge } from '../../../components/ui/Badge';

const DemandaForm = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    numero_progresivo: '',
    fecha_demanda: '',
    nombre_trabajador: '',
    numero_expediente: '',
    prestacion_principal: '',
    fecha_emplazamiento: '',
    fecha_contestacion: '',
    desahogo_pruebas: '',
    fecha_laudo: '',
    resultado: '',
    amparo: false,
    ejecucion_laudo: '',
    interlocutoria: '',
    observaciones: '',
  });

  useEffect(() => {
    if (isEditing) {
      juridicoService.getDemanda(id).then(data => {
        setForm({
          numero_progresivo: data.numero_progresivo,
          fecha_demanda: data.fecha_demanda ? data.fecha_demanda.split('T')[0] : '',
          nombre_trabajador: data.nombre_trabajador,
          numero_expediente: data.numero_expediente ?? '',
          prestacion_principal: data.prestacion_principal ?? '',
          fecha_emplazamiento: data.fecha_emplazamiento ? data.fecha_emplazamiento.split('T')[0] : '',
          fecha_contestacion: data.fecha_contestacion ? data.fecha_contestacion.split('T')[0] : '',
          desahogo_pruebas: data.desahogo_pruebas ?? '',
          fecha_laudo: data.fecha_laudo ? data.fecha_laudo.split('T')[0] : '',
          resultado: data.resultado ?? '',
          amparo: data.amparo,
          ejecucion_laudo: data.ejecucion_laudo ?? '',
          interlocutoria: data.interlocutoria ?? '',
          observaciones: data.observaciones ?? ''
        });
        setLoading(false);
      }).catch((err) => {
        console.error(err);
        nav('/juridico/demandas');
      });
    }
  }, [id, isEditing, nav]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEditing) {
        await juridicoService.updateDemanda(id, form);
      } else {
        await juridicoService.createDemanda(form);
      }
      nav('/juridico/demandas');
    } catch (err) {
      alert(err.response?.data?.message ?? 'Error al guardar la demanda');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-64 flex items-center justify-center"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
        <button onClick={() => nav(-1)} className="p-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition">
          <ArrowLeft size={20} />
        </button>
        <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
          <Scale size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">{isEditing ? 'Editar Demanda Laboral' : 'Registrar Demanda Laboral'}</h1>
          <p className="text-sm text-gray-500">Control de fechas y etapas del juicio laboral frente a la institución.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECCIÓN 1: DATOS GENERALES */}
        <Card>
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-semibold text-gray-800">1. Datos Generales y Trabajador</h3>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormGroup>
                <Label htmlFor="numero_progresivo">N° Progresivo (Control Interno) *</Label>
                <Input id="numero_progresivo" value={form.numero_progresivo} onChange={e => setForm({ ...form, numero_progresivo: e.target.value })} required />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="numero_expediente">N° Expediente Asignado</Label>
                <Input id="numero_expediente" value={form.numero_expediente} onChange={e => setForm({ ...form, numero_expediente: e.target.value })} />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="fecha_demanda">Fecha de la Demanda</Label>
                <Input type="date" id="fecha_demanda" value={form.fecha_demanda} onChange={e => setForm({ ...form, fecha_demanda: e.target.value })} />
              </FormGroup>
              <FormGroup className="md:col-span-2">
                <Label htmlFor="nombre_trabajador">Nombre del Trabajador Demandante *</Label>
                <Input id="nombre_trabajador" value={form.nombre_trabajador} onChange={e => setForm({ ...form, nombre_trabajador: e.target.value })} required />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="prestacion_principal">Prestación Principal Reclamada</Label>
                <Input id="prestacion_principal" value={form.prestacion_principal} onChange={e => setForm({ ...form, prestacion_principal: e.target.value })} placeholder="Ej. Reinstalación, Finiquito..." />
              </FormGroup>
            </div>
          </CardContent>
        </Card>

        {/* SECCIÓN 2: ETAPAS PROCESALES */}
        <Card>
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-semibold text-gray-800">2. Etapas Procesales del Juicio</h3>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormGroup>
                <Label htmlFor="fecha_emplazamiento">Fecha Emplazamiento</Label>
                <Input type="date" id="fecha_emplazamiento" value={form.fecha_emplazamiento} onChange={e => setForm({ ...form, fecha_emplazamiento: e.target.value })} />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="fecha_contestacion">Fecha Contestación</Label>
                <Input type="date" id="fecha_contestacion" value={form.fecha_contestacion} onChange={e => setForm({ ...form, fecha_contestacion: e.target.value })} />
              </FormGroup>
              <FormGroup className="md:col-span-3">
                <Label htmlFor="desahogo_pruebas">Desahogo de Pruebas</Label>
                <Input id="desahogo_pruebas" value={form.desahogo_pruebas} onChange={e => setForm({ ...form, desahogo_pruebas: e.target.value })} placeholder="Status o descripción de las pruebas..." />
              </FormGroup>
            </div>
          </CardContent>
        </Card>

        {/* SECCIÓN 3: RESOLUCIÓN Y AMPARO */}
        <Card>
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">3. Resolución Judicial (Laudo) y Amparos</h3>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="amparo" className="w-4 h-4 text-indigo-600 rounded" checked={form.amparo} onChange={e => setForm({ ...form, amparo: e.target.checked })} />
              <label htmlFor="amparo" className="text-sm font-medium text-gray-700 select-none cursor-pointer">¿Juicio de Amparo?</label>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormGroup>
                <Label htmlFor="fecha_laudo">Fecha del Laudo</Label>
                <Input type="date" id="fecha_laudo" value={form.fecha_laudo} onChange={e => setForm({ ...form, fecha_laudo: e.target.value })} />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="resultado">Resultado del Laudo</Label>
                <select id="resultado" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors text-sm" value={form.resultado} onChange={e => setForm({ ...form, resultado: e.target.value })}>
                  <option value="">En Proceso (Sin Laudo)</option>
                  <option value="Absolutorio">Absolutorio (A favor de la UNICH)</option>
                  <option value="Condenatorio">Condenatorio (En contra de la UNICH)</option>
                  <option value="Convenio">Resuelto por Convenio Parcial/Total</option>
                </select>
              </FormGroup>
              <FormGroup>
                <Label htmlFor="ejecucion_laudo">Detalle / Ejecución del Laudo</Label>
                <textarea id="ejecucion_laudo" rows="2" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-600 bg-gray-50/50" value={form.ejecucion_laudo} onChange={e => setForm({ ...form, ejecucion_laudo: e.target.value })} />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="interlocutoria">Incidente / Interlocutoria</Label>
                <textarea id="interlocutoria" rows="2" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-600 bg-gray-50/50" value={form.interlocutoria} onChange={e => setForm({ ...form, interlocutoria: e.target.value })} />
              </FormGroup>
            </div>
          </CardContent>
        </Card>

        {/* SECCIÓN 4: OBSERVACIONES GENERALES */}
        <Card>
          <CardContent className="p-6">
            <FormGroup>
              <Label htmlFor="observaciones">Observaciones Adicionales Generales</Label>
              <textarea 
                id="observaciones" 
                rows="3" 
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors text-sm"
                value={form.observaciones} 
                onChange={e => setForm({ ...form, observaciones: e.target.value })} 
                placeholder="Anotaciones extra relevantes del caso..." 
              />
            </FormGroup>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" type="button" onClick={() => nav(-1)}>Cancelar</Button>
          <Button variant="primary" type="submit" isLoading={saving} icon={Save}>Guardar Demanda Laboral</Button>
        </div>

      </form>
    </div>
  );
};

export default DemandaForm;
