import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import contratosService from '../../../services/contratosService';
import empleadosService from '../../../services/empleadosService';
import { Card, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { FormGroup, Label, Input, Select } from '../../../components/ui/Form';

const ContratoForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [empleados, setEmpleados] = useState([]);
  const [formData, setFormData] = useState({
    empleado_id: '', numero_contrato: '', fecha_inicio: '',
    fecha_fin: '', salario: '', activo: true, observaciones: '',
  });

  useEffect(() => {
    empleadosService.getAll({ per_page: 200 }).then(d => setEmpleados(d.data ?? d));
    if (isEditing) {
      contratosService.getById(id).then(c => {
        setFormData({
          empleado_id:      c.empleado_id,
          numero_contrato:  c.numero_contrato,
          fecha_inicio:     c.fecha_inicio ?? '',
          fecha_fin:        c.fecha_fin ?? '',
          salario:          c.salario ?? '',
          activo:           c.activo,
          observaciones:    c.observaciones ?? '',
        });
      });
    }
  }, [id]);

  const handleChange = e => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.id]: val });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) await contratosService.update(id, formData);
      else await contratosService.create(formData);
      navigate('/rrhh/contratos');
    } catch (err) {
      alert(err.response?.data?.message ?? 'Error al guardar contrato.');
    } finally { setLoading(false); }
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate('/rrhh/contratos')} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors text-gray-500">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Editar Contrato' : 'Nuevo Contrato Laboral'}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormGroup className="md:col-span-2">
                <Label htmlFor="empleado_id">Empleado</Label>
                <Select id="empleado_id" value={formData.empleado_id} onChange={handleChange} required>
                  <option value="">Seleccionar empleado...</option>
                  {empleados.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.numero_empleado} — {e.nombre} {e.apellido_paterno}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="numero_contrato">Número de Contrato</Label>
                <Input id="numero_contrato" value={formData.numero_contrato} onChange={handleChange} required
                  className="font-mono font-bold" placeholder="Ej. CONT-2026-001" />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="salario">Salario Mensual (MXN)</Label>
                <Input id="salario" type="number" min="0" step="0.01" value={formData.salario} onChange={handleChange} required
                  className="font-mono" placeholder="Ej. 18000.00" />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
                <Input id="fecha_inicio" type="date" value={formData.fecha_inicio} onChange={handleChange} required />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="fecha_fin">Fecha de Término <span className="text-xs text-gray-400">(dejar vacío = indefinido)</span></Label>
                <Input id="fecha_fin" type="date" value={formData.fecha_fin} onChange={handleChange} />
              </FormGroup>

              <FormGroup className="md:col-span-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <textarea id="observaciones" value={formData.observaciones} onChange={handleChange} rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-unich-purple/20 focus:border-unich-purple min-h-[80px] resize-none"
                  placeholder="Condiciones especiales, notas del contrato..." />
              </FormGroup>

              <FormGroup className="flex items-center gap-3">
                <input type="checkbox" id="activo" checked={formData.activo} onChange={handleChange}
                  className="w-4 h-4 accent-unich-purple" />
                <Label htmlFor="activo" className="mb-0 cursor-pointer">Contrato vigente / activo</Label>
              </FormGroup>
            </div>
          </CardContent>
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => navigate('/rrhh/contratos')}>Cancelar</Button>
            <Button variant="primary" type="submit" isLoading={loading} icon={Save}>
              {isEditing ? 'Guardar Cambios' : 'Crear Contrato'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default ContratoForm;
