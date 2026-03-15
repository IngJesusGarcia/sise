import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, BookMarked } from 'lucide-react';
import titulacionService from '../../services/titulacionService';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FormGroup, Label, Input, Select } from '../../components/ui/Form';

const TitulacionForm = () => {
  const navigate = useNavigate();
  const [modalidades, setModalidades] = useState([]);
  const [egresados, setEgresados] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    alumno_id: '',
    modalidad_titulacion_id: '',
    fecha_examen: new Date().toISOString().split('T')[0],
    resultado: 'aprobado',
    titulo_trabajo: '',
    presidente: '',
    secretario: '',
    sinodal1: '',
    sinodal2: '',
    sinodal3: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [m, e] = await Promise.all([titulacionService.getModalidades(), titulacionService.getEgresados()]);
        setModalidades(m);
        setEgresados(e);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.alumno_id || !formData.modalidad_titulacion_id) {
      alert('Seleccione el alumno y la modalidad de titulación.');
      return;
    }
    setLoading(true);
    try {
      await titulacionService.createActa(formData);
      navigate('/titulacion');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message ?? 'Error al registrar el acta de examen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate('/titulacion')} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-500 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Acta de Examen Profesional</h1>
          <p className="text-gray-500 text-sm">Registro del examen de titulación para el expediente académico.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <div className="px-6 pt-6 pb-2 border-b border-gray-100">
            <h2 className="font-bold text-gray-700 uppercase tracking-wide text-xs">I. Datos del Sustentante</h2>
          </div>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormGroup className="md:col-span-2">
              <Label htmlFor="alumno_id">Alumno Egresado</Label>
              <Select id="alumno_id" value={formData.alumno_id} onChange={handleChange} required>
                <option value="">Seleccionar egresado...</option>
                {egresados.map(e => (
                  <option key={e.id} value={e.alumno_id}>
                    {e.alumno?.matricula} — {e.alumno?.nombre} {e.alumno?.apellido_paterno}
                  </option>
                ))}
              </Select>
            </FormGroup>
            <FormGroup>
              <Label htmlFor="modalidad_titulacion_id">Modalidad de Titulación</Label>
              <Select id="modalidad_titulacion_id" value={formData.modalidad_titulacion_id} onChange={handleChange} required>
                <option value="">Seleccionar modalidad...</option>
                {modalidades.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </Select>
            </FormGroup>
            <FormGroup>
              <Label htmlFor="resultado">Resultado del Examen</Label>
              <Select id="resultado" value={formData.resultado} onChange={handleChange}>
                <option value="aprobado">Aprobado</option>
                <option value="Mención Honorífica">Mención Honorífica</option>
                <option value="reprobado">No Aprobado</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label htmlFor="fecha_examen">Fecha de Examen</Label>
              <Input id="fecha_examen" type="date" value={formData.fecha_examen} onChange={handleChange} required />
            </FormGroup>
            <FormGroup className="md:col-span-2">
              <Label htmlFor="titulo_trabajo">Título del Trabajo / Tema</Label>
              <Input id="titulo_trabajo" type="text" maxLength={300} value={formData.titulo_trabajo} onChange={handleChange} placeholder="Ej. Implementación de estrategias pedagógicas interculturales..." />
            </FormGroup>
          </CardContent>
        </Card>

        <Card>
          <div className="px-6 pt-6 pb-2 border-b border-gray-100">
            <h2 className="font-bold text-gray-700 uppercase tracking-wide text-xs">II. Jurado Examinador</h2>
          </div>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormGroup>
              <Label htmlFor="presidente">Presidente del Jurado</Label>
              <Input id="presidente" type="text" value={formData.presidente} onChange={handleChange} placeholder="Nombre completo y cargo..." />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="secretario">Secretario</Label>
              <Input id="secretario" type="text" value={formData.secretario} onChange={handleChange} placeholder="Nombre completo..." />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="sinodal1">Sinodal 1</Label>
              <Input id="sinodal1" type="text" value={formData.sinodal1} onChange={handleChange} />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="sinodal2">Sinodal 2</Label>
              <Input id="sinodal2" type="text" value={formData.sinodal2} onChange={handleChange} />
            </FormGroup>
            <FormGroup className="md:col-span-2">
              <Label htmlFor="sinodal3">Sinodal 3 (Asesor/Director de Tesis)</Label>
              <Input id="sinodal3" type="text" value={formData.sinodal3} onChange={handleChange} />
            </FormGroup>
          </CardContent>
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => navigate('/titulacion')}>Cancelar</Button>
            <Button variant="primary" type="submit" isLoading={loading} icon={BookMarked}>Asentar Acta</Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default TitulacionForm;
