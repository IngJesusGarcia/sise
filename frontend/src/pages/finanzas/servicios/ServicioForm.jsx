import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { serviciosService } from '../../../services/finanzasService';
import { Card, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { FormGroup, Label, Input } from '../../../components/ui/Form';

const ServicioForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ clave: '', nombre: '', descripcion: '', costo: '', activo: true });

  useEffect(() => {
    if (isEditing) serviciosService.getById(id).then(s => setForm({ clave: s.clave, nombre: s.nombre, descripcion: s.descripcion ?? '', costo: s.costo, activo: s.activo }));
  }, [id]);

  const handleChange = e => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.id]: val });
  };

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true);
    try {
      if (isEditing) await serviciosService.update(id, form);
      else await serviciosService.create(form);
      navigate('/finanzas/servicios');
    } catch (err) { alert(err.response?.data?.message ?? 'Error.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/finanzas/servicios')} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors text-gray-500"><ArrowLeft size={20} /></button>
        <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}</h1>
      </div>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-8 space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <FormGroup>
                <Label htmlFor="clave">Clave del Servicio</Label>
                <Input id="clave" value={form.clave} onChange={handleChange} required className="font-mono uppercase" placeholder="Ej. CONST-EST" />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="costo">Costo (MXN)</Label>
                <Input id="costo" type="number" min="0" step="0.01" value={form.costo} onChange={handleChange} required className="font-mono" placeholder="Ej. 250.00" />
              </FormGroup>
            </div>
            <FormGroup>
              <Label htmlFor="nombre">Nombre del Servicio</Label>
              <Input id="nombre" value={form.nombre} onChange={handleChange} required placeholder="Ej. Constancia de Estudios" />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="descripcion">Descripción</Label>
              <textarea id="descripcion" value={form.descripcion} onChange={handleChange} rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-unich-purple/20 focus:border-unich-purple resize-none"
                placeholder="Descripción del servicio..." />
            </FormGroup>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="activo" checked={form.activo} onChange={handleChange} className="w-4 h-4 accent-unich-purple" />
              <Label htmlFor="activo" className="mb-0 cursor-pointer">Servicio activo</Label>
            </div>
          </CardContent>
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => navigate('/finanzas/servicios')}>Cancelar</Button>
            <Button variant="primary" type="submit" isLoading={loading} icon={Save}>{isEditing ? 'Guardar Cambios' : 'Crear Servicio'}</Button>
          </div>
        </Card>
      </form>
    </div>
  );
};
export default ServicioForm;
