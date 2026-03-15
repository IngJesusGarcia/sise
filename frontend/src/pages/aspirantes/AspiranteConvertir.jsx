import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle, GraduationCap } from 'lucide-react';
import aspirantesService from '../../services/aspirantesService';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FormGroup, Label, Input, Select } from '../../components/ui/Form';

const AspiranteConvertir = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [aspirante, setAspirante] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    matricula: '',
    plan_estudio_id: '1', // We default to 1 - in a full system this would be a select
    semestre_actual: '1',
    turno: 'Matutino',
  });

  useEffect(() => {
    aspirantesService.getById(id).then(setAspirante);
  }, [id]);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await aspirantesService.convertirAlumno(id, formData);
      setSuccess(resp.alumno);
    } catch (err) {
      alert(err.response?.data?.error ?? err.response?.data?.message ?? 'Error al matricular alumno.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="animate-fade-in max-w-2xl mx-auto mt-10 text-center">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">¡Nuevo Alumno Registrado!</h2>
        <p className="text-gray-500 mb-8">El aspirante fue matriculado exitosamente en el sistema.</p>
        <Card className="mb-8 border-dashed bg-gray-50/50">
          <CardContent className="p-8">
            <span className="block text-xs uppercase font-bold text-gray-400 tracking-widest mb-1">Matrícula Asignada</span>
            <span className="block text-4xl font-mono font-black text-unich-purple mb-6">{success.matricula}</span>
            <div className="grid grid-cols-2 gap-4 text-left border-t border-gray-200 pt-6">
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase">Nombre</span>
                <span className="font-semibold text-gray-800">{success.nombre} {success.apellido_paterno}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase">Licenciatura</span>
                <span className="font-semibold text-gray-800">{success.licenciatura?.nombre ?? '—'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => navigate('/aspirantes')}>Volver a Aspirantes</Button>
          <Button variant="primary" icon={GraduationCap} onClick={() => navigate('/estudiantes')}>Ver Alumnos</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate('/aspirantes')} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-500 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Matricular Aspirante Admitido</h1>
          <p className="text-gray-500 text-sm">Convierte este aspirante en un alumno activo del sistema.</p>
        </div>
      </div>

      {aspirante && (
        <Card className="bg-blue-50/50 border-blue-200">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <GraduationCap size={24} />
            </div>
            <div>
              <p className="font-bold text-gray-800">{aspirante.nombre} {aspirante.apellido_paterno} {aspirante.apellido_materno}</p>
              <p className="text-sm text-gray-600">Folio: <span className="font-mono font-bold">{aspirante.folio}</span> · CURP: {aspirante.curp ?? '—'}</p>
              <p className="text-sm text-gray-600">Licenciatura solicitada: <strong>{aspirante.licenciatura?.nombre ?? '—'}</strong></p>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-8 space-y-5">
            <FormGroup>
              <Label htmlFor="matricula">Matrícula a Asignar</Label>
              <Input id="matricula" value={formData.matricula} onChange={e => setFormData({...formData, matricula: e.target.value})}
                required className="font-mono text-xl font-bold text-unich-purple tracking-widest" placeholder="Ej. 2026A001" maxLength={15} />
            </FormGroup>
            <div className="grid grid-cols-2 gap-5">
              <FormGroup>
                <Label htmlFor="semestre_actual">Semestre de Ingreso</Label>
                <Select id="semestre_actual" value={formData.semestre_actual} onChange={e => setFormData({...formData, semestre_actual: e.target.value})}>
                  {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={String(n)}>Semestre {n}</option>)}
                </Select>
              </FormGroup>
              <FormGroup>
                <Label htmlFor="turno">Turno</Label>
                <Select id="turno" value={formData.turno} onChange={e => setFormData({...formData, turno: e.target.value})}>
                  <option value="Matutino">Matutino</option>
                  <option value="Vespertino">Vespertino</option>
                  <option value="Mixto">Mixto</option>
                </Select>
              </FormGroup>
            </div>
          </CardContent>
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => navigate('/aspirantes')}>Cancelar</Button>
            <Button variant="primary" type="submit" isLoading={loading} icon={GraduationCap}>
              Confirmar Matrícula
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default AspiranteConvertir;
