import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import egresadosService from '../../services/egresadosService';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FormGroup, Label, Input, Select } from '../../components/ui/Form';

const EgresadoForm = () => {
  const navigate = useNavigate();
  const [estudiantes, setEstudiantes] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    alumno_id: '',
    periodo_id: '',
    fecha_egreso: new Date().toISOString().split('T')[0],
    promedio_egreso: '',
    creditos_totales: '',
    estatus_titulacion: 'sin_iniciar',
  });

  useEffect(() => {
    const load = async () => {
      const [e, p] = await Promise.all([egresadosService.getEstudiantes(), egresadosService.getPeriodos()]);
      setEstudiantes(e);
      setPeriodos(p);
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.alumno_id || !formData.periodo_id) {
      alert('Seleccione un alumno y el periodo de egreso.');
      return;
    }
    setLoading(true);
    try {
      await egresadosService.create(formData);
      navigate('/egresados');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message ?? 'Error al registrar egresado.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate('/egresados')} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-500 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registrar Nuevo Egresado</h1>
          <p className="text-gray-500 text-sm">El estatus del alumno se actualizará automáticamente a "Egresado".</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-8 space-y-6">
            <FormGroup>
              <Label htmlFor="alumno_id">Estudiante</Label>
              <Select id="alumno_id" value={formData.alumno_id} onChange={handleChange} required>
                <option value="">Buscar por matrícula o nombre...</option>
                {estudiantes.map(e => (
                  <option key={e.id} value={e.id}>{e.matricula} — {e.nombre} {e.apellido_paterno}</option>
                ))}
              </Select>
            </FormGroup>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormGroup>
                <Label htmlFor="periodo_id">Periodo de Egreso</Label>
                <Select id="periodo_id" value={formData.periodo_id} onChange={handleChange} required>
                  <option value="">Seleccione el periodo...</option>
                  {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="fecha_egreso">Fecha de Egreso</Label>
                <Input id="fecha_egreso" type="date" value={formData.fecha_egreso} onChange={handleChange} required />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="promedio_egreso">Promedio de Egreso</Label>
                <Input id="promedio_egreso" type="number" step="0.01" min="0" max="10"
                  value={formData.promedio_egreso} onChange={handleChange} placeholder="Ej. 8.75" />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="creditos_totales">Créditos Acumulados</Label>
                <Input id="creditos_totales" type="number" min="0"
                  value={formData.creditos_totales} onChange={handleChange} placeholder="Ej. 320" />
              </FormGroup>

              <FormGroup className="md:col-span-2">
                <Label htmlFor="estatus_titulacion">Estatus de Titulación</Label>
                <Select id="estatus_titulacion" value={formData.estatus_titulacion} onChange={handleChange}>
                  <option value="sin_iniciar">Sin Iniciar</option>
                  <option value="en_proceso">En Proceso</option>
                  <option value="titulado">Titulado</option>
                </Select>
              </FormGroup>
            </div>
          </CardContent>
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => navigate('/egresados')}>Cancelar</Button>
            <Button variant="primary" type="submit" isLoading={loading} icon={Save}>Registrar Egresado</Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default EgresadoForm;
