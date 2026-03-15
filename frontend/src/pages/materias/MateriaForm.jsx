import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import materiasService from '../../services/materiasService';
import api from '../../api/axios'; // For fetching licenciaturas
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FormGroup, Label, Input, Select } from '../../components/ui/Form';

const MateriaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    clave: '',
    nombre: '',
    creditos: 6,
    licenciatura_id: '',
    semestre: 1
  });
  
  const [licenciaturas, setLicenciaturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditing);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchLicenciaturas();
    if (isEditing) {
      loadMateriaData(id);
    }
  }, [id, isEditing]);

  const fetchLicenciaturas = async () => {
    try {
      const response = await api.get('/licenciaturas');
      setLicenciaturas(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching licenciaturas:', error);
    }
  };

  const loadMateriaData = async (materiaId) => {
    try {
      const data = await materiasService.getById(materiaId);
      setFormData({
        clave: data.clave || '',
        nombre: data.nombre || '',
        creditos: data.creditos || 6,
        licenciatura_id: data.licenciatura_id || '',
        semestre: data.semestre || 1
      });
    } catch (error) {
      console.error('Error loading materia:', error);
      alert('No se pudo cargar la materia.');
      navigate('/materias');
    } finally {
      setPageLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.clave) newErrors.clave = 'Requerido';
    if (!formData.nombre) newErrors.nombre = 'Requerido';
    if (!formData.creditos) newErrors.creditos = 'Requerido';
    if (!formData.licenciatura_id) newErrors.licenciatura_id = 'Requerido';
    if (!formData.semestre) newErrors.semestre = 'Requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (isEditing) {
        await materiasService.update(id, formData);
      } else {
        await materiasService.create(formData);
      }
      navigate('/materias');
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert(error.response?.data?.error || 'Error al guardar la materia.');
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
    <div className="animate-fade-in max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <button 
          onClick={() => navigate('/materias')}
          className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Materia' : 'Nueva Materia'}
          </h1>
          <p className="text-gray-500 text-sm">
            Completa los datos de la asignatura y asocíala al plan de estudios.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <FormGroup>
              <Label htmlFor="licenciatura_id">Licenciatura</Label>
              <Select 
                id="licenciatura_id"
                value={formData.licenciatura_id}
                onChange={(e) => setFormData({...formData, licenciatura_id: e.target.value})}
                error={errors.licenciatura_id ? errors.licenciatura_id[0] || errors.licenciatura_id : null}
              >
                <option value="">-- Seleccione una Licenciatura --</option>
                {licenciaturas.map(lic => (
                  <option key={lic.id} value={lic.id}>{lic.nombre}</option>
                ))}
              </Select>
            </FormGroup>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormGroup>
                <Label htmlFor="clave">Clave de la Materia</Label>
                <Input 
                  id="clave" 
                  value={formData.clave}
                  onChange={(e) => setFormData({...formData, clave: e.target.value})}
                  placeholder="Ej. MAT-101"
                  error={errors.clave ? errors.clave[0] || errors.clave : null}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="nombre">Nombre de la Materia</Label>
                <Input 
                  id="nombre" 
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  error={errors.nombre ? errors.nombre[0] || errors.nombre : null}
                />
              </FormGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormGroup>
                <Label htmlFor="semestre">Semestre</Label>
                <Input 
                  id="semestre" 
                  type="number"
                  min="1" max="12"
                  value={formData.semestre}
                  onChange={(e) => setFormData({...formData, semestre: e.target.value})}
                  error={errors.semestre ? errors.semestre[0] || errors.semestre : null}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="creditos">Créditos</Label>
                <Input 
                  id="creditos" 
                  type="number"
                  min="1"
                  value={formData.creditos}
                  onChange={(e) => setFormData({...formData, creditos: e.target.value})}
                  error={errors.creditos ? errors.creditos[0] || errors.creditos : null}
                />
              </FormGroup>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <Button variant="ghost" type="button" onClick={() => navigate('/materias')}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" isLoading={loading} icon={Save}>
                {isEditing ? 'Guardar Cambios' : 'Registrar Materia'}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MateriaForm;
