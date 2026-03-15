import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import aspirantesService from '../../services/aspirantesService';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FormGroup, Label, Input, Select } from '../../components/ui/Form';

const AspiranteForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [licenciaturas, setLicenciaturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '', apellido_paterno: '', apellido_materno: '',
    fecha_nacimiento: '', sexo: '', curp: '', correo: '',
    telefono: '', licenciatura_id: '', ciclo_ingreso: String(new Date().getFullYear()),
  });

  useEffect(() => {
    aspirantesService.getLicenciaturas().then(d => setLicenciaturas(d.data ?? d));
    if (isEditing) {
      aspirantesService.getById(id).then(a => setFormData({
        nombre: a.nombre, apellido_paterno: a.apellido_paterno,
        apellido_materno: a.apellido_materno ?? '',
        fecha_nacimiento: a.fecha_nacimiento ?? '', sexo: a.sexo ?? '',
        curp: a.curp ?? '', correo: a.correo ?? '', telefono: a.telefono ?? '',
        licenciatura_id: a.licenciatura_id ?? '', ciclo_ingreso: a.ciclo_ingreso ?? '',
      }));
    }
  }, [id]);

  const handleChange = e => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) await aspirantesService.update(id, formData);
      else await aspirantesService.create(formData);
      navigate('/aspirantes');
    } catch (err) {
      alert(err.response?.data?.message ?? 'Error al guardar el aspirante.');
    } finally { setLoading(false); }
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate('/aspirantes')} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-500 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Editar Aspirante' : 'Registrar Nuevo Aspirante'}</h1>
          <p className="text-gray-500 text-sm">Se generará un folio de seguimiento automáticamente al guardar.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <FormGroup className="md:col-span-1">
                <Label htmlFor="nombre">Nombre(s)</Label>
                <Input id="nombre" value={formData.nombre} onChange={handleChange} required placeholder="Nombre(s)" />
              </FormGroup>
              <FormGroup className="md:col-span-1">
                <Label htmlFor="apellido_paterno">Apellido Paterno</Label>
                <Input id="apellido_paterno" value={formData.apellido_paterno} onChange={handleChange} required />
              </FormGroup>
              <FormGroup className="md:col-span-1">
                <Label htmlFor="apellido_materno">Apellido Materno</Label>
                <Input id="apellido_materno" value={formData.apellido_materno} onChange={handleChange} />
              </FormGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormGroup>
                <Label htmlFor="curp">CURP</Label>
                <Input id="curp" value={formData.curp} onChange={handleChange} maxLength={18}
                  className="font-mono uppercase tracking-widest" placeholder="18 caracteres" />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                <Input id="fecha_nacimiento" type="date" value={formData.fecha_nacimiento} onChange={handleChange} required />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="correo">Correo Electrónico</Label>
                <Input id="correo" type="email" value={formData.correo} onChange={handleChange} placeholder="correo@ejemplo.com" />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="telefono">Teléfono / Celular</Label>
                <Input id="telefono" type="tel" maxLength={15} value={formData.telefono} onChange={handleChange} />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="sexo">Sexo</Label>
                <Select id="sexo" value={formData.sexo} onChange={handleChange}>
                  <option value="">Sin especificar</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="Otro">Otro / Prefiero no decir</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label htmlFor="ciclo_ingreso">Ciclo de Ingreso</Label>
                <Input id="ciclo_ingreso" value={formData.ciclo_ingreso} onChange={handleChange} placeholder="Ej. 2026" />
              </FormGroup>
            </div>

            <FormGroup>
              <Label htmlFor="licenciatura_id">Licenciatura de Interés</Label>
              <Select id="licenciatura_id" value={formData.licenciatura_id} onChange={handleChange}>
                <option value="">Sin selección por ahora</option>
                {licenciaturas.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
              </Select>
            </FormGroup>
          </CardContent>
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => navigate('/aspirantes')}>Cancelar</Button>
            <Button variant="primary" type="submit" isLoading={loading} icon={Save}>
              {isEditing ? 'Actualizar Aspirante' : 'Registrar Aspirante'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default AspiranteForm;
