import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, CalendarDays } from 'lucide-react';
import periodosService from '../../services/periodosService';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FormGroup, Label, Input, Select } from '../../components/ui/Form';

const PeriodoForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'semestral',
    fecha_inicio: '',
    fecha_fin: '',
    fecha_inicio_inscripciones: '',
    fecha_fin_inscripciones: '',
  });

  useEffect(() => {
    if (isEditing) {
      periodosService.getById(id).then(p => setFormData({
        nombre: p.nombre,
        tipo: p.tipo,
        fecha_inicio: p.fecha_inicio ?? '',
        fecha_fin: p.fecha_fin ?? '',
        fecha_inicio_inscripciones: p.fecha_inicio_inscripciones ?? '',
        fecha_fin_inscripciones: p.fecha_fin_inscripciones ?? '',
      }));
    }
  }, [id]);

  const handleChange = e => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) await periodosService.update(id, formData);
      else await periodosService.create(formData);
      navigate('/periodos');
    } catch (err) {
      alert(err.response?.data?.message ?? 'Error al guardar el periodo.');
    } finally { setLoading(false); }
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate('/periodos')} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-500 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Editar Periodo Escolar' : 'Nuevo Periodo Escolar'}</h1>
          <p className="text-gray-500 text-sm">Los periodos nuevos se crean como Inactivos. Actívalos desde la lista.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormGroup className="md:col-span-1">
                <Label htmlFor="nombre">Nombre del Periodo</Label>
                <Input id="nombre" value={formData.nombre} onChange={handleChange} required
                  placeholder="Ej. 2026-A, 2026-B, ENE-JUN 2026..." className="font-mono font-bold text-unich-purple" />
                <p className="text-xs text-gray-400 mt-1">Nombre corto e identificador único del periodo.</p>
              </FormGroup>
              <FormGroup className="md:col-span-1">
                <Label htmlFor="tipo">Tipo de Periodo</Label>
                <Select id="tipo" value={formData.tipo} onChange={handleChange} required>
                  <option value="semestral">Semestral (6 meses)</option>
                  <option value="cuatrimestral">Cuatrimestral (4 meses)</option>
                  <option value="anual">Anual (12 meses)</option>
                </Select>
              </FormGroup>
            </div>

            <div className="border-t border-gray-100 pt-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Fechas del Periodo Académico</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormGroup>
                  <Label htmlFor="fecha_inicio">Inicio del Periodo</Label>
                  <Input id="fecha_inicio" type="date" value={formData.fecha_inicio} onChange={handleChange} required />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="fecha_fin">Fin del Periodo</Label>
                  <Input id="fecha_fin" type="date" value={formData.fecha_fin} onChange={handleChange} required />
                </FormGroup>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-200 pt-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Periodo de Inscripciones <span className="font-normal normal-case tracking-normal">(opcional)</span></p>
              <p className="text-xs text-gray-400 mb-4">Ventana de tiempo en la que los alumnos pueden inscribirse a grupos.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormGroup>
                  <Label htmlFor="fecha_inicio_inscripciones">Inicio de Inscripciones</Label>
                  <Input id="fecha_inicio_inscripciones" type="date" value={formData.fecha_inicio_inscripciones} onChange={handleChange} />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="fecha_fin_inscripciones">Cierre de Inscripciones</Label>
                  <Input id="fecha_fin_inscripciones" type="date" value={formData.fecha_fin_inscripciones} onChange={handleChange} />
                </FormGroup>
              </div>
            </div>
          </CardContent>
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => navigate('/periodos')}>Cancelar</Button>
            <Button variant="primary" type="submit" isLoading={loading} icon={CalendarDays}>
              {isEditing ? 'Guardar Cambios' : 'Crear Periodo'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default PeriodoForm;
