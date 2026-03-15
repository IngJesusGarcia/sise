import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, ArrowRightLeft } from 'lucide-react';
import movimientosService from '../../services/movimientosService';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FormGroup, Label, Input, Select } from '../../components/ui/Form';

const MovimientoForm = () => {
  const navigate = useNavigate();
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    estudiante_id: '',
    tipo_movimiento: 'cambio_grupo',
    valor_anterior: '',
    valor_nuevo: '',
    motivo: '',
    fecha_movimiento: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    movimientosService.getEstudiantes().then(d => setEstudiantes(d.data ?? d));
  }, []);

  const handleChange = e => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await movimientosService.create(formData);
      navigate('/movimientos-academicos');
    } catch (err) {
      alert(err.response?.data?.message ?? 'Error al registrar el movimiento.');
    } finally { setLoading(false); }
  };

  const TIPOS = [
    { val: 'cambio_licenciatura', label: 'Cambio de Licenciatura / Carrera' },
    { val: 'cambio_grupo',        label: 'Cambio de Grupo' },
    { val: 'cambio_turno',        label: 'Cambio de Turno (Matutino ↔ Vespertino)' },
    { val: 'cambio_sede',         label: 'Cambio de Sede / Campus' },
  ];

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate('/movimientos-academicos')} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-500 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registrar Movimiento Académico</h1>
          <p className="text-gray-500 text-sm">Documenta cualquier cambio en la situación académica de un estudiante.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-8 space-y-6">
            <FormGroup>
              <Label htmlFor="estudiante_id">Estudiante</Label>
              <Select id="estudiante_id" value={formData.estudiante_id} onChange={handleChange} required>
                <option value="">Seleccionar estudiante...</option>
                {estudiantes.map(e => (
                  <option key={e.id} value={e.id}>{e.matricula} — {e.nombre} {e.apellido_paterno}</option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="tipo_movimiento">Tipo de Movimiento</Label>
              <Select id="tipo_movimiento" value={formData.tipo_movimiento} onChange={handleChange}>
                {TIPOS.map(t => <option key={t.val} value={t.val}>{t.label}</option>)}
              </Select>
            </FormGroup>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormGroup>
                <Label htmlFor="valor_anterior">Situación Anterior</Label>
                <Input id="valor_anterior" value={formData.valor_anterior} onChange={handleChange}
                  required placeholder="Ej. Grupo A-101, Turno Matutino..." />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="valor_nuevo">Situación Nueva (Destino)</Label>
                <Input id="valor_nuevo" value={formData.valor_nuevo} onChange={handleChange}
                  required placeholder="Ej. Grupo B-204, Turno Vespertino..." className="text-emerald-700 font-medium" />
              </FormGroup>
            </div>

            <FormGroup>
              <Label htmlFor="motivo">Motivo o Justificación</Label>
              <textarea
                id="motivo"
                rows={3}
                value={formData.motivo}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-unich-purple/30 focus:border-unich-purple resize-none"
                placeholder="Describe brevemente el motivo del cambio..."
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="fecha_movimiento">Fecha del Movimiento</Label>
              <Input id="fecha_movimiento" type="date" value={formData.fecha_movimiento} onChange={handleChange} required />
            </FormGroup>
          </CardContent>
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => navigate('/movimientos-academicos')}>Cancelar</Button>
            <Button variant="primary" type="submit" isLoading={loading} icon={ArrowRightLeft}>Asentar Movimiento</Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default MovimientoForm;
