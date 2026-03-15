import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import inscripcionesService from '../../services/inscripcionesService';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FormGroup, Label, Select } from '../../components/ui/Form';

const InscripcionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    estudiante_id: '',
    grupo_id: '',
    periodo_id: '',
    estatus: 'inscrito'
  });
  
  const [estudiantes, setEstudiantes] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadDependencies();
  }, []);

  const loadDependencies = async () => {
    try {
      const [estudiantesRes, gruposRes, periodosRes] = await Promise.all([
        inscripcionesService.getEstudiantes(),
        inscripcionesService.getGrupos(),
        inscripcionesService.getPeriodos()
      ]);
      
      setEstudiantes(estudiantesRes.data || estudiantesRes);
      setGrupos(gruposRes.data || gruposRes);
      setPeriodos(periodosRes.data || periodosRes);

      if (isEditing) {
        await loadInscripcionData(id);
      } else {
        setPageLoading(false);
      }
    } catch (error) {
      console.error('Error loading form dependencies:', error);
      alert('Error de conexión al cargar catálogos base.');
    }
  };

  const loadInscripcionData = async (inscripcionId) => {
    try {
      const data = await inscripcionesService.getById(inscripcionId);
      setFormData({
        estudiante_id: data.estudiante_id || '',
        grupo_id: data.grupo_id || '',
        periodo_id: data.periodo_id || '',
        estatus: data.estatus || 'inscrito'
      });
    } catch (error) {
      console.error('Error loading inscripcion:', error);
      alert('No se pudo cargar el registro.');
      navigate('/inscripciones');
    } finally {
      setPageLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.estudiante_id) newErrors.estudiante_id = 'Requerido';
    if (!formData.grupo_id) newErrors.grupo_id = 'Requerido';
    if (!formData.periodo_id) newErrors.periodo_id = 'Requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (isEditing) {
        await inscripcionesService.update(id, formData);
      } else {
        await inscripcionesService.create(formData);
      }
      navigate('/inscripciones');
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert(error.response?.data?.error || 'Error al guardar la inscripción.');
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

  // Find the selected group to show capacities inline
  const selectedGrupo = grupos.find(g => Number(g.id) === Number(formData.grupo_id));

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <button 
          onClick={() => navigate('/inscripciones')}
          className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Inscripción' : 'Registrar Nueva Inscripción'}
          </h1>
          <p className="text-gray-500 text-sm">
            Asigna un estudiante activo a un grupo de clase específico.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
              <FormGroup>
                <Label htmlFor="periodo_id">Periodo Lectivo</Label>
                <Select 
                  id="periodo_id"
                  value={formData.periodo_id}
                  onChange={(e) => setFormData({...formData, periodo_id: e.target.value})}
                  error={errors.periodo_id ? errors.periodo_id[0] || errors.periodo_id : null}
                >
                  <option value="">-- Seleccione un Periodo --</option>
                  {periodos.map(per => (
                    <option key={per.id} value={per.id}>{per.nombre} ({per.tipo})</option>
                  ))}
                </Select>
              </FormGroup>

              {isEditing && (
                <FormGroup>
                  <Label htmlFor="estatus">Estatus de Inscripción</Label>
                  <Select 
                    id="estatus"
                    value={formData.estatus}
                    onChange={(e) => setFormData({...formData, estatus: e.target.value})}
                  >
                    <option value="inscrito">Inscrito (Regular)</option>
                    <option value="baja">Baja (Libera cupo)</option>
                    <option value="recursando">Recursando</option>
                  </Select>
                </FormGroup>
              )}
            </div>

            <FormGroup>
              <Label htmlFor="estudiante_id">Seleccionar Estudiante</Label>
              <Select 
                id="estudiante_id"
                value={formData.estudiante_id}
                onChange={(e) => setFormData({...formData, estudiante_id: e.target.value})}
                error={errors.estudiante_id ? errors.estudiante_id[0] || errors.estudiante_id : null}
              >
                <option value="">-- Buscar un estudiante --</option>
                {estudiantes.map(est => (
                  <option key={est.id} value={est.id}>
                    {est.matricula} - {est.apellido_paterno} {est.apellido_materno} {est.nombre}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <div className="flex justify-between items-baseline mb-2">
                <Label htmlFor="grupo_id" className="mb-0">Asignar a Grupo</Label>
                {selectedGrupo && (
                    <span className={`text-xs font-bold px-2 py-1 rounded ${selectedGrupo.inscritos >= selectedGrupo.capacidad ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        Cupo: {selectedGrupo.inscritos} de {selectedGrupo.capacidad}
                    </span>
                )}
              </div>
              <Select 
                id="grupo_id"
                value={formData.grupo_id}
                onChange={(e) => setFormData({...formData, grupo_id: e.target.value})}
                error={errors.grupo_id ? errors.grupo_id[0] || errors.grupo_id : null}
              >
                <option value="">-- Seleccione un Grupo Disponible--</option>
                {grupos.map(g => (
                  <option key={g.id} value={g.id} disabled={!isEditing && g.inscritos >= g.capacidad}>
                    {g.clave_grupo} — {g.materia_nombre} ({g.inscritos}/{g.capacidad})
                  </option>
                ))}
              </Select>
            </FormGroup>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <Button variant="ghost" type="button" onClick={() => navigate('/inscripciones')}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" isLoading={loading} icon={Save}>
                {isEditing ? 'Guardar Cambios' : 'Confirmar Inscripción'}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InscripcionForm;
