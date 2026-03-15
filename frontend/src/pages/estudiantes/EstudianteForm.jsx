import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import estudiantesService from '../../services/estudiantesService';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FormGroup, Label, Input, Select } from '../../components/ui/Form';

const EstudianteForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    licenciatura_id: '',
    plan_estudio_id: '1', // Defaulting to 1 as dummy/test unless fetched correctly
    matricula: '',
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    fecha_nacimiento: '',
    sexo: '',
    curp: '',
    correo: '',
    telefono: '',
    semestre_actual: 1,
    turno: 'Matutino',
    estatus: 'activo'
  });
  
  const [licenciaturas, setLicenciaturas] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadDependencies();
  }, []);

  const loadDependencies = async () => {
    try {
      const { data: cat } = await estudiantesService.getLicenciaturas();
      setLicenciaturas(cat || []);

      if (isEditing) {
        await loadEstudianteData(id);
      } else {
        setPageLoading(false);
      }
    } catch (error) {
      console.error('Error loading form dependencies:', error);
      alert('Error de conexión al cargar catálogos base.');
    }
  };

  const loadEstudianteData = async (estId) => {
    try {
      const data = await estudiantesService.getById(estId);
      // Format simple date required by text input date
      let fechaNac = data.fecha_nacimiento;
      if (fechaNac && fechaNac.includes('T')) fechaNac = fechaNac.split('T')[0];

      setFormData({
        licenciatura_id: data.licenciatura_id || '',
        plan_estudio_id: data.plan_estudio_id || '1',
        matricula: data.matricula || '',
        nombre: data.nombre || '',
        apellido_paterno: data.apellido_paterno || '',
        apellido_materno: data.apellido_materno || '',
        fecha_nacimiento: fechaNac || '',
        sexo: data.sexo || '',
        curp: data.curp || '',
        correo: data.correo || '',
        telefono: data.telefono || '',
        semestre_actual: data.semestre_actual || 1,
        turno: data.turno || 'Matutino',
        estatus: data.estatus || 'activo'
      });
    } catch (error) {
      console.error('Error loading estudiante:', error);
      alert('No se pudo cargar el alumno.');
      navigate('/estudiantes');
    } finally {
      setPageLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.matricula) newErrors.matricula = 'Matrícula es obligatoria';
    if (!formData.nombre) newErrors.nombre = 'Nombre es obligatorio';
    if (!formData.apellido_paterno) newErrors.apellido_paterno = 'Apellidos son obligatorios';
    if (!formData.licenciatura_id) newErrors.licenciatura_id = 'Programa es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    
    // Safety for backend Plan Estudio
    if (!formData.plan_estudio_id) formData.plan_estudio_id = 1;

    try {
      if (isEditing) {
        await estudiantesService.update(id, formData);
      } else {
        await estudiantesService.create(formData);
      }
      navigate('/estudiantes');
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert(error.response?.data?.error || error.response?.data?.message || 'Error al guardar el estudiante.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-unich-purple border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <button 
          onClick={() => navigate('/estudiantes')}
          className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Expediente: Editar Perfil' : 'Inscripción de Nuevo Alumno'}
          </h1>
          <p className="text-gray-500 text-sm">
            Toda la información personal y de expediente para la vida universitaria.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* IDENTIDAD ACADÉMICA */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Identidad Institucional</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormGroup>
                <Label htmlFor="matricula">Matrícula Escolar*</Label>
                <Input 
                  id="matricula" 
                  value={formData.matricula}
                  onChange={(e) => setFormData({...formData, matricula: e.target.value})}
                  disabled={isEditing}
                  placeholder="Ej. UCH-20261X"
                  error={errors.matricula ? errors.matricula[0] || errors.matricula : null}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="licenciatura_id">Programa de Licenciatura*</Label>
                <Select 
                  id="licenciatura_id"
                  value={formData.licenciatura_id}
                  onChange={(e) => setFormData({...formData, licenciatura_id: e.target.value})}
                  error={errors.licenciatura_id ? errors.licenciatura_id[0] || errors.licenciatura_id : null}
                >
                  <option value="">-- Seleccione una Carrera --</option>
                  {licenciaturas.map(lic => (
                    <option key={lic.id} value={lic.id}>{lic.nombre}</option>
                  ))}
                </Select>
              </FormGroup>

              <div className="grid grid-cols-2 gap-4">
                <FormGroup>
                  <Label htmlFor="semestre_actual">Semestre Actual</Label>
                  <Select 
                    id="semestre_actual"
                    value={formData.semestre_actual}
                    onChange={(e) => setFormData({...formData, semestre_actual: e.target.value})}
                  >
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n}>{n}°</option>)}
                  </Select>
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="turno">Turno</Label>
                  <Select 
                    id="turno"
                    value={formData.turno}
                    onChange={(e) => setFormData({...formData, turno: e.target.value})}
                  >
                    <option value="Matutino">Matutino</option>
                    <option value="Vespertino">Vespertino</option>
                    <option value="Mixto">Mixto</option>
                  </Select>
                </FormGroup>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <FormGroup>
                  <Label htmlFor="estatus">Estatus Académico</Label>
                  <Select 
                    id="estatus"
                    value={formData.estatus}
                    onChange={(e) => setFormData({...formData, estatus: e.target.value})}
                  >
                    <option value="activo">Activo (Regular/Irregular)</option>
                    <option value="baja_temporal">Baja Temporal</option>
                    <option value="baja_definitiva">Baja Definitiva</option>
                    <option value="egresado">Egresado</option>
                    <option value="titulado">Titulado</option>
                  </Select>
                </FormGroup>
            </div>
          </CardContent>
        </Card>

        {/* DATOS PERSONALES */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Información Personal</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormGroup>
                <Label htmlFor="nombre">Nombre(s)*</Label>
                <Input 
                  id="nombre" 
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  error={errors.nombre ? errors.nombre[0] || errors.nombre : null}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="apellido_paterno">Apellido Paterno*</Label>
                <Input 
                  id="apellido_paterno" 
                  value={formData.apellido_paterno}
                  onChange={(e) => setFormData({...formData, apellido_paterno: e.target.value})}
                  error={errors.apellido_paterno ? errors.apellido_paterno[0] || errors.apellido_paterno : null}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="apellido_materno">Apellido Materno</Label>
                <Input 
                  id="apellido_materno" 
                  value={formData.apellido_materno}
                  onChange={(e) => setFormData({...formData, apellido_materno: e.target.value})}
                  error={errors.apellido_materno ? errors.apellido_materno[0] || errors.apellido_materno : null}
                />
              </FormGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormGroup>
                <Label htmlFor="curp">CURP</Label>
                <Input 
                  id="curp" 
                  value={formData.curp}
                  onChange={(e) => setFormData({...formData, curp: e.target.value.toUpperCase()})}
                  error={errors.curp ? errors.curp[0] || errors.curp : null}
                  maxLength={18}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                <Input 
                  id="fecha_nacimiento" 
                  type="date"
                  value={formData.fecha_nacimiento}
                  onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})}
                  error={errors.fecha_nacimiento ? errors.fecha_nacimiento[0] || errors.fecha_nacimiento : null}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="sexo">Sexo de Nacimiento</Label>
                <Select 
                  id="sexo"
                  value={formData.sexo}
                  onChange={(e) => setFormData({...formData, sexo: e.target.value})}
                >
                  <option value="">-- No especificado --</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="Otro">Otro/Prefiero no decir</option>
                </Select>
              </FormGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormGroup>
                <Label htmlFor="correo">Correo Electrónico de Contacto</Label>
                <Input 
                  id="correo" 
                  type="email"
                  value={formData.correo}
                  onChange={(e) => setFormData({...formData, correo: e.target.value})}
                  error={errors.correo ? errors.correo[0] || errors.correo : null}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="telefono">Teléfono Principal</Label>
                <Input 
                  id="telefono" 
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  error={errors.telefono ? errors.telefono[0] || errors.telefono : null}
                />
              </FormGroup>
            </div>

          </CardContent>
        </Card>

        {/* CONTROLES */}
        <div className="flex justify-end gap-3 pb-8">
            <Button variant="ghost" type="button" onClick={() => navigate('/estudiantes')}>
            Descartar Cambios
            </Button>
            <Button variant="primary" type="submit" isLoading={loading} icon={Save}>
            {isEditing ? 'Guardar Cambios Rápidos' : 'Crear Padrón'}
            </Button>
        </div>

      </form>
    </div>
  );
};

export default EstudianteForm;
