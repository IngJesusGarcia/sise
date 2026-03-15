import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import gruposService from '../../services/gruposService';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FormGroup, Label, Input, Select } from '../../components/ui/Form';

const GrupoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    clave_grupo: '',
    materia_id: '',
    docente_id: '',
    periodo_id: '',
    salon: '',
    cupo_maximo: 30
  });
  
  const [materias, setMaterias] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadDependencies();
  }, []);

  const loadDependencies = async () => {
    try {
      const [materiasRes, docentesRes, periodosRes] = await Promise.all([
        gruposService.getMaterias(),
        gruposService.getDocentes(),
        gruposService.getPeriodos()
      ]);
      
      setMaterias(materiasRes.data || materiasRes);
      setDocentes(docentesRes.data || docentesRes);
      setPeriodos(periodosRes.data || periodosRes);

      if (isEditing) {
        await loadGrupoData(id);
      } else {
        setPageLoading(false);
      }
    } catch (error) {
      console.error('Error loading form dependencies:', error);
      alert('Error de conexión al cargar catálogos base.');
    }
  };

  const loadGrupoData = async (grupoId) => {
    try {
      const data = await gruposService.getById(grupoId);
      setFormData({
        clave_grupo: data.clave_grupo || '',
        materia_id: data.materia_id || '',
        docente_id: data.docente_id || '',
        periodo_id: data.periodo_id || '',
        salon: data.salon || '',
        cupo_maximo: data.cupo_maximo || 30
      });
    } catch (error) {
      console.error('Error loading grupo:', error);
      alert('No se pudo cargar el grupo.');
      navigate('/grupos');
    } finally {
      setPageLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.clave_grupo) newErrors.clave_grupo = 'Requerido';
    if (!formData.materia_id) newErrors.materia_id = 'Requerido';
    if (!formData.periodo_id) newErrors.periodo_id = 'Requerido';
    if (!formData.cupo_maximo) newErrors.cupo_maximo = 'Requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (isEditing) {
        await gruposService.update(id, formData);
      } else {
        await gruposService.create(formData);
      }
      navigate('/grupos');
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert(error.response?.data?.error || 'Error al guardar el grupo.');
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
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <button 
          onClick={() => navigate('/grupos')}
          className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Grupo Académico' : 'Apertura de Nuevo Grupo'}
          </h1>
          <p className="text-gray-500 text-sm">
            Configura un nuevo bloque para inscripciones y asigna horarios y docentes.
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

              <FormGroup>
                <Label htmlFor="clave_grupo">Clave del Grupo / Sección</Label>
                <Input 
                  id="clave_grupo" 
                  value={formData.clave_grupo}
                  onChange={(e) => setFormData({...formData, clave_grupo: e.target.value})}
                  placeholder="Ej. MAT1A, 301-A, DSW-501"
                  error={errors.clave_grupo ? errors.clave_grupo[0] || errors.clave_grupo : null}
                />
              </FormGroup>
            </div>

            <FormGroup>
              <Label htmlFor="materia_id">Materia / Unidad de Aprendizaje</Label>
              <Select 
                id="materia_id"
                value={formData.materia_id}
                onChange={(e) => setFormData({...formData, materia_id: e.target.value})}
                error={errors.materia_id ? errors.materia_id[0] || errors.materia_id : null}
              >
                <option value="">-- Seleccione una Materia --</option>
                {materias.map(mat => (
                  <option key={mat.id} value={mat.id}>
                    {mat.nombre} ({mat.clave}) - {mat.licenciatura_nombre} - Semestre {mat.semestre}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="docente_id">Docente Titular (Opcional por ahora)</Label>
              <Select 
                id="docente_id"
                value={formData.docente_id}
                onChange={(e) => setFormData({...formData, docente_id: e.target.value})}
                error={errors.docente_id ? errors.docente_id[0] || errors.docente_id : null}
              >
                <option value="">-- Sin asignar --</option>
                {docentes.map(doc => (
                  <option key={doc.id} value={doc.id}>
                    {doc.grado_academico} {doc.nombre} {doc.apellido_paterno} {doc.apellido_materno}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormGroup>
                <Label htmlFor="salon">Aula / Salón (Físico o Virtual)</Label>
                <Input 
                  id="salon" 
                  value={formData.salon}
                  onChange={(e) => setFormData({...formData, salon: e.target.value})}
                  placeholder="Ej. Edificio B - 105, Laboratorio TIC, Zoom..."
                  error={errors.salon ? errors.salon[0] || errors.salon : null}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="cupo_maximo">Cupo Máximo Esperado</Label>
                <Input 
                  id="cupo_maximo" 
                  type="number"
                  min="1"
                  max="100"
                  value={formData.cupo_maximo}
                  onChange={(e) => setFormData({...formData, cupo_maximo: e.target.value})}
                  error={errors.cupo_maximo ? errors.cupo_maximo[0] || errors.cupo_maximo : null}
                />
              </FormGroup>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <Button variant="ghost" type="button" onClick={() => navigate('/grupos')}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" isLoading={loading} icon={Save}>
                {isEditing ? 'Guardar Cambios' : 'Aperturar Grupo'}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default GrupoForm;
