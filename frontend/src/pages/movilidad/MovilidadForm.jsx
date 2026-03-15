import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plane } from 'lucide-react';
import movilidadService from '../../services/movilidadService';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FormGroup, Label, Input, Select } from '../../components/ui/Form';

const MovilidadForm = () => {
  const navigate = useNavigate();
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [esVisitanteExterno, setEsVisitanteExterno] = useState(false);
  const [formData, setFormData] = useState({
    estudiante_id: '',
    nombre_visitante: '',
    universidad_origen: '',
    programa_origen: '',
    periodo_movilidad: '',
    materias_equivalentes: '',
    estatus: 'activo',
  });

  useEffect(() => {
    movilidadService.getEstudiantes().then(d => setEstudiantes(d.data ?? d));
  }, []);

  const handleChange = e => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    const payload = esVisitanteExterno
      ? { ...formData, estudiante_id: undefined }
      : { ...formData, nombre_visitante: undefined };

    try {
      await movilidadService.create(payload);
      navigate('/movilidad');
    } catch (err) {
      alert(err.response?.data?.message ?? 'Error al registrar movilidad.');
    } finally { setLoading(false); }
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate('/movilidad')} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-500 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registrar Movilidad Estudiantil</h1>
          <p className="text-gray-500 text-sm">Estudiante visitante proveniente de otra institución de educación superior.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-8 space-y-6">

            {/* Toggle: alumno local vs visitante externo */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!esVisitanteExterno} readOnly
                  onChange={() => setEsVisitanteExterno(false)}
                  className="w-4 h-4 text-unich-purple border-gray-300 rounded" />
                <span className="text-sm font-medium text-gray-700">Alumno del padrón UNICH (intercambio saliente)</span>
              </label>
              <span className="text-gray-300">|</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={esVisitanteExterno} readOnly
                  onChange={() => setEsVisitanteExterno(true)}
                  className="w-4 h-4 text-unich-purple border-gray-300 rounded" />
                <span className="text-sm font-medium text-gray-700">Visitante externo (ingreso a UNICH)</span>
              </label>
            </div>

            {!esVisitanteExterno ? (
              <FormGroup>
                <Label htmlFor="estudiante_id">Alumno UNICH en Movilidad</Label>
                <Select id="estudiante_id" value={formData.estudiante_id} onChange={handleChange}>
                  <option value="">Seleccionar alumno...</option>
                  {estudiantes.map(e => <option key={e.id} value={e.id}>{e.matricula} — {e.nombre} {e.apellido_paterno}</option>)}
                </Select>
              </FormGroup>
            ) : (
              <FormGroup>
                <Label htmlFor="nombre_visitante">Nombre del Estudiante Visitante</Label>
                <Input id="nombre_visitante" value={formData.nombre_visitante} onChange={handleChange}
                  required={esVisitanteExterno} placeholder="Nombre completo del visitante" />
              </FormGroup>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormGroup className="md:col-span-2">
                <Label htmlFor="universidad_origen">Universidad / Institución de Origen</Label>
                <Input id="universidad_origen" value={formData.universidad_origen} onChange={handleChange} required
                  placeholder="Ej. Universidad Nacional Autónoma de México" />
              </FormGroup>
              <FormGroup className="md:col-span-2">
                <Label htmlFor="programa_origen">Programa / Carrera de Origen</Label>
                <Input id="programa_origen" value={formData.programa_origen} onChange={handleChange} required
                  placeholder="Ej. Licenciatura en Comunicación" />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="periodo_movilidad">Periodo de Movilidad</Label>
                <Input id="periodo_movilidad" value={formData.periodo_movilidad} onChange={handleChange} required
                  placeholder="Ej. 2026-A, 2026-B..." />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="estatus">Estatus</Label>
                <Select id="estatus" value={formData.estatus} onChange={handleChange}>
                  <option value="activo">Activo</option>
                  <option value="completado">Completado</option>
                  <option value="cancelado">Cancelado</option>
                </Select>
              </FormGroup>
            </div>

            <FormGroup>
              <Label htmlFor="materias_equivalentes">Materias Equivalentes Validadas</Label>
              <textarea id="materias_equivalentes" rows={4} value={formData.materias_equivalentes} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-unich-purple/30 focus:border-unich-purple resize-none"
                placeholder="Lista de materias equivalentes validadas y sus correspondencias. Ej:&#10;• Álgebra Lineal ↔ Matemáticas Avanzadas (8 créditos)&#10;• Comunicación Oral ↔ Expresión Oral (6 créditos)" />
              <p className="text-xs text-gray-400 mt-1">Puedes usar formato libre o lista de materias con sus créditos.</p>
            </FormGroup>
          </CardContent>
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => navigate('/movilidad')}>Cancelar</Button>
            <Button variant="primary" type="submit" isLoading={loading} icon={Plane}>Registrar Movilidad</Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default MovilidadForm;
