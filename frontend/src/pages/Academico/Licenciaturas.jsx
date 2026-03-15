import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, BookOpen, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { FormGroup, Label, Input, Select } from '../../components/ui/Form';

const Licenciaturas = () => {
  const [licenciaturas, setLicenciaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentLicenciatura, setCurrentLicenciatura] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({ clave: '', nombre: '', area: '', estatus: 'activa' });
  const [formLoading, setFormLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchLicenciaturas();
  }, []);

  const fetchLicenciaturas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/licenciaturas');
      setLicenciaturas(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching licenciaturas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (licenciatura = null) => {
    setErrors({});
    if (licenciatura) {
      setCurrentLicenciatura(licenciatura);
      setFormData({
        clave: licenciatura.clave || '',
        nombre: licenciatura.nombre || '',
        area: licenciatura.area || '',
        estatus: licenciatura.estatus || 'activa'
      });
    } else {
      setCurrentLicenciatura(null);
      setFormData({ clave: '', nombre: '', area: '', estatus: 'activa' });
    }
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.clave) newErrors.clave = 'La clave es requerida';
    if (!formData.nombre) newErrors.nombre = 'El nombre es requerido';
    if (!formData.area) newErrors.area = 'El área es requerida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormLoading(true);
    try {
      if (currentLicenciatura) {
        // Update
        await api.put(`/licenciaturas/${currentLicenciatura.id}`, formData);
      } else {
        // Create
        await api.post('/licenciaturas', formData);
      }
      setIsModalOpen(false);
      fetchLicenciaturas();
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        console.error('Error saving licenciatura:', error);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = (licenciatura) => {
    setCurrentLicenciatura(licenciatura);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try {
      await api.delete(`/licenciaturas/${currentLicenciatura.id}`);
      setIsDeleteModalOpen(false);
      fetchLicenciaturas();
    } catch (error) {
      console.error('Error deleting licenciatura:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const filteredData = licenciaturas.filter(l => 
    l.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.clave.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.area && l.area.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns = [
    { header: 'Clave', accessor: 'clave' },
    { 
      header: 'Programa Educativo', 
      cell: (row) => <span className="font-semibold text-gray-800">{row.nombre}</span> 
    },
    { header: 'Área de Conocimiento', accessor: 'area' },
    { 
      header: 'Estatus', 
      cell: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${row.estatus === 'activa' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {row.estatus === 'activa' ? 'ACTIVA' : 'INACTIVA'}
        </span>
      )
    },
    {
      header: 'Acciones',
      cell: (row) => (
        <div className="flex gap-3">
          <button 
            onClick={() => handleOpenModal(row)}
            className="text-gray-400 hover:text-unich-purple hover:bg-unich-purple/10 p-2 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit2 size={18} />
          </button>
          <button 
            onClick={() => confirmDelete(row)}
            className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
            title="Eliminar"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-unich-purple/10 text-unich-purple rounded-lg">
              <BookOpen size={24} />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Licenciaturas</h1>
          </div>
          <p className="text-gray-500">Gestión de programas educativos e ingenierías (Catálogo SISE).</p>
        </div>
        
        <Button variant="primary" icon={Plus} onClick={() => handleOpenModal()}>
          Nueva Licenciatura
        </Button>
      </div>

      <Card>
        <div className="p-0">
          {loading ? (
             <div className="h-64 flex flex-col items-center justify-center space-y-4">
               <div className="animate-spin rounded-full h-10 w-10 border-4 border-unich-purple border-t-transparent"></div>
               <p className="text-gray-500 font-medium">Cargando catálogo...</p>
             </div>
          ) : (
            <Table 
              columns={columns} 
              data={filteredData} 
              onSearch={setSearchTerm}
              searchPlaceholder="Buscar por clave, nombre o área..."
            />
          )}
        </div>
      </Card>

      {/* CREATE / EDIT MODAL */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentLicenciatura ? 'Editar Licenciatura' : 'Nueva Licenciatura'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormGroup>
              <Label htmlFor="clave">Clave SEP / Institucional</Label>
              <Input 
                id="clave" 
                value={formData.clave}
                onChange={(e) => setFormData({...formData, clave: e.target.value})}
                placeholder="Ej. LIC-DS-01"
                error={errors.clave ? errors.clave[0] || errors.clave : null}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="estatus">Estatus</Label>
              <Select 
                id="estatus"
                value={formData.estatus}
                onChange={(e) => setFormData({...formData, estatus: e.target.value})}
              >
                <option value="activa">Activa - En Oferta</option>
                <option value="inactiva">Inactiva - En Revisión</option>
              </Select>
            </FormGroup>
          </div>

          <FormGroup>
            <Label htmlFor="nombre">Nombre Oficial del Programa Educativo</Label>
            <Input 
              id="nombre" 
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              placeholder="Ej. Licenciatura en Desarrollo de Software"
              error={errors.nombre ? errors.nombre[0] || errors.nombre : null}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="area">Área de Conocimiento</Label>
            <Input 
              id="area" 
              value={formData.area}
              onChange={(e) => setFormData({...formData, area: e.target.value})}
              placeholder="Ej. Ingeniería y Tecnología, Salud, Sociales..."
              error={errors.area ? errors.area[0] || errors.area : null}
            />
          </FormGroup>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} type="button">Cancelar</Button>
            <Button variant="primary" type="submit" isLoading={formLoading}>
              {currentLicenciatura ? 'Guardar Cambios' : 'Registrar Licenciatura'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Eliminación"
        maxWidth="sm"
      >
        <div className="py-4 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <AlertCircle size={32} />
          </div>
          <h4 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar Registro?</h4>
          <p className="text-sm text-gray-500 mb-6">
            Estás a punto de eliminar definitivamente <strong>{currentLicenciatura?.nombre}</strong>. Esta acción no se puede deshacer y podría afectar el historial académico.
          </p>
          <div className="flex w-full gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
            <Button variant="danger" className="flex-1" onClick={handleDelete} isLoading={formLoading}>Eliminar</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default Licenciaturas;
