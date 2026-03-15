import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Gavel } from 'lucide-react';
import { juridicoService } from '../../../services/juridicoService';
import { Card, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { FormGroup, Label, Input } from '../../../components/ui/Form';

const AbogadoForm = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    correo: '',
    especialidad: '',
    estatus: true
  });

  useEffect(() => {
    if (isEditing) {
      juridicoService.getAbogado(id).then(data => {
        setForm({
          nombre: data.nombre,
          telefono: data.telefono ?? '',
          correo: data.correo ?? '',
          especialidad: data.especialidad ?? '',
          estatus: data.estatus
        });
        setLoading(false);
      }).catch((err) => {
        console.error(err);
        nav('/juridico/abogados');
      });
    }
  }, [id, isEditing, nav]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEditing) {
        await juridicoService.updateAbogado(id, form);
      } else {
        await juridicoService.createAbogado(form);
      }
      nav('/juridico/abogados');
    } catch (err) {
      alert(err.response?.data?.message ?? 'Error al guardar el abogado');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-64 flex items-center justify-center"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
        <button onClick={() => nav(-1)} className="p-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition">
          <ArrowLeft size={20} />
        </button>
        <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
          <Gavel size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">{isEditing ? 'Editar Abogado' : 'Registrar Nuevo Abogado'}</h1>
          <p className="text-sm text-gray-500">Ingresa los datos del representante legal o abogado institucional.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormGroup className="md:col-span-2">
                <Label htmlFor="nombre">Nombre Completo *</Label>
                <Input 
                  id="nombre" 
                  value={form.nombre} 
                  onChange={e => setForm({ ...form, nombre: e.target.value })} 
                  required 
                  placeholder="Ej. Lic. Juan Pérez López" 
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input 
                  id="telefono" 
                  value={form.telefono} 
                  onChange={e => setForm({ ...form, telefono: e.target.value })} 
                  placeholder="Ej. 9671112233" 
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="correo">Correo Electrónico</Label>
                <Input 
                  type="email" 
                  id="correo" 
                  value={form.correo} 
                  onChange={e => setForm({ ...form, correo: e.target.value })} 
                  placeholder="Ej. abogado@unich.edu.mx" 
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="especialidad">Especialidad (Opcional)</Label>
                <Input 
                  id="especialidad" 
                  value={form.especialidad} 
                  onChange={e => setForm({ ...form, especialidad: e.target.value })} 
                  placeholder="Ej. Derecho Laboral, Civil, etc." 
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="estatus">Estatus Operativo</Label>
                <select 
                  id="estatus" 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors text-sm font-medium text-gray-900"
                  value={form.estatus ? '1' : '0'}
                  onChange={e => setForm({ ...form, estatus: e.target.value === '1' })}
                >
                  <option value="1">Activo y Disponible</option>
                  <option value="0">Inactivo / Fuera del sistema</option>
                </select>
              </FormGroup>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <Button variant="outline" type="button" onClick={() => nav(-1)}>Cancelar</Button>
              <Button variant="primary" type="submit" isLoading={saving} icon={Save}>Guardar Abogado</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AbogadoForm;
