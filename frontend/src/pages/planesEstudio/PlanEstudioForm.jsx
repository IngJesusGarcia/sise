import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, BookCopy } from 'lucide-react';
import planesEstudioService from '../../services/planesEstudioService';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FormGroup, Label, Input, Select } from '../../components/ui/Form';

const PlanEstudioForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [licenciaturas, setLicenciaturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    licenciatura_id: '',
    clave: '',
    anio_inicio: String(new Date().getFullYear()),
    vigente: true,
    observaciones: '',
  });

  useEffect(() => {
    planesEstudioService.getLicenciaturas().then(d => setLicenciaturas(d.data ?? d));
    if (isEditing) {
      planesEstudioService.getById(id).then(p => setFormData({
        licenciatura_id: p.licenciatura_id,
        clave: p.clave,
        anio_inicio: p.anio_inicio,
        vigente: p.vigente,
        observaciones: p.observaciones ?? '',
      }));
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
      const saved = isEditing
        ? await planesEstudioService.update(id, formData)
        : await planesEstudioService.create(formData);
      // Navigate to malla curricular after creating
      navigate(isEditing ? '/planes-estudio' : `/planes-estudio/${saved.id}/malla`);
    } catch (err) {
      alert(err.response?.data?.message ?? 'Error al guardar el plan de estudio.');
    } finally { setLoading(false); }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate('/planes-estudio')} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-500 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Editar Plan de Estudio' : 'Nuevo Plan de Estudio'}</h1>
          <p className="text-gray-500 text-sm">Después de crear el plan podrás asignar las materias por semestre.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-8 space-y-5">
            <FormGroup>
              <Label htmlFor="licenciatura_id">Licenciatura</Label>
              <Select id="licenciatura_id" value={formData.licenciatura_id} onChange={handleChange} required>
                <option value="">Seleccionar licenciatura...</option>
                {licenciaturas.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
              </Select>
            </FormGroup>

            <div className="grid grid-cols-2 gap-5">
              <FormGroup>
                <Label htmlFor="clave">Clave del Plan</Label>
                <Input id="clave" value={formData.clave} onChange={handleChange} required
                  className="font-mono font-bold uppercase tracking-widest" maxLength={20}
                  placeholder="Ej. LDS-2026, LID-24..." />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="anio_inicio">Año de Inicio</Label>
                <Input id="anio_inicio" type="number" min="2000" max="2099" value={formData.anio_inicio} onChange={handleChange} required />
              </FormGroup>
            </div>

            <FormGroup>
              <Label htmlFor="observaciones">Observaciones / Notas</Label>
              <textarea id="observaciones" rows={3} value={formData.observaciones} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-unich-purple/30 focus:border-unich-purple resize-none"
                placeholder="Notas adicionales sobre el plan de estudios..." />
            </FormGroup>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <input id="vigente" type="checkbox" checked={formData.vigente} onChange={handleChange}
                className="w-5 h-5 rounded accent-unich-purple cursor-pointer" />
              <label htmlFor="vigente" className="text-sm font-medium text-gray-700 cursor-pointer">
                Plan vigente <span className="font-normal text-gray-500">— visible para inscripciones y asignación de alumnos</span>
              </label>
            </div>
          </CardContent>
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => navigate('/planes-estudio')}>Cancelar</Button>
            <Button variant="primary" type="submit" isLoading={loading} icon={BookCopy}>
              {isEditing ? 'Guardar Cambios' : 'Crear y Configurar Malla →'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default PlanEstudioForm;
