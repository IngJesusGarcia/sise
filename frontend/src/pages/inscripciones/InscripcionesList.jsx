import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, ClipboardList, AlertCircle } from 'lucide-react';
import inscripcionesService from '../../services/inscripcionesService';
import { Card } from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const InscripcionesList = () => {
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal de eliminación
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentInscripcion, setCurrentInscripcion] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchInscripciones();
  }, []);

  const fetchInscripciones = async () => {
    try {
      setLoading(true);
      const data = await inscripcionesService.getAll();
      setInscripciones(data);
    } catch (error) {
      console.error('Error fetching inscripciones:', error);
      alert('Error al cargar la lista de inscripciones.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (inscripcion) => {
    setCurrentInscripcion(inscripcion);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await inscripcionesService.delete(currentInscripcion.id);
      setIsDeleteModalOpen(false);
      fetchInscripciones();
    } catch (error) {
      console.error('Error deleting inscripcion:', error);
      alert('Error al eliminar la inscripción.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtrado múltiple
  const filteredData = inscripciones.filter(i => {
    const matriculaMatches = String(i.matricula || '').toLowerCase().includes(searchTerm.toLowerCase());
    const alumnoMatches = String(i.alumno_nombre_completo || '').toLowerCase().includes(searchTerm.toLowerCase());
    const materiaMatches = String(i.materia_nombre || '').toLowerCase().includes(searchTerm.toLowerCase());
    const grupoMatches = String(i.clave_grupo || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return matriculaMatches || alumnoMatches || materiaMatches || grupoMatches;
  });

  const estatusColors = {
    'inscrito': 'bg-blue-100 text-blue-800',
    'baja': 'bg-red-100 text-red-800',
    'recursando': 'bg-orange-100 text-orange-800'
  };

  const columns = [
    { header: 'Matrícula', accessor: 'matricula' },
    { 
      header: 'Estudiante', 
      cell: (row) => <span className="font-semibold text-gray-800">{row.alumno_nombre_completo}</span>
    },
    { 
      header: 'Grupo / Materia', 
      cell: (row) => (
        <div>
          <span className="font-bold text-unich-purple">{row.clave_grupo}</span>
          <span className="block text-xs text-gray-500">{row.materia_nombre}</span>
        </div>
      )
    },
    { header: 'Periodo', accessor: 'periodo_nombre' },
    { 
      header: 'Estatus', 
      cell: (row) => (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${estatusColors[row.estatus] || 'bg-gray-100 text-gray-800'}`}>
          {String(row.estatus).toUpperCase()}
        </span>
      )
    },
    { header: 'Fecha', accessor: 'fecha_inscripcion' },
    {
      header: 'Acciones',
      cell: (row) => (
        <div className="flex gap-2">
          <button 
            onClick={() => navigate(`/inscripciones/editar/${row.id}`)}
            className="text-gray-400 hover:text-unich-purple hover:bg-unich-purple/10 p-2 rounded-lg transition-colors"
            title="Editar Inscripción"
          >
            <Edit2 size={18} />
          </button>
          <button 
            onClick={() => confirmDelete(row)}
            className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
            title="Cancelar Inscripción"
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
              <ClipboardList size={24} />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Control de Inscripciones</h1>
          </div>
          <p className="text-gray-500">Gestión de asignación de estudiantes a grupos académicos y materias.</p>
        </div>
        
        <Button variant="primary" icon={Plus} onClick={() => navigate('/inscripciones/nueva')}>
          Nueva Inscripción
        </Button>
      </div>

      <Card>
        <div className="p-0">
          {loading ? (
             <div className="h-64 flex flex-col items-center justify-center space-y-4">
               <div className="animate-spin rounded-full h-10 w-10 border-4 border-unich-purple border-t-transparent"></div>
               <p className="text-gray-500 font-medium">Cargando registro de inscripciones...</p>
             </div>
          ) : (
            <Table 
              columns={columns} 
              data={filteredData} 
              onSearch={setSearchTerm}
              searchPlaceholder="Buscar por matrícula, estudiante, grupo o materia..."
            />
          )}
        </div>
      </Card>

      {/* MODAL DE ELIMINACIÓN */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Cancelar Inscripción"
        maxWidth="sm"
      >
        <div className="py-4 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <AlertCircle size={32} />
          </div>
          <h4 className="text-xl font-bold text-gray-900 mb-2">¿Borrar Registro de Inscripción?</h4>
          <p className="text-sm text-gray-500 mb-6">
            Eliminarás al estudiante <strong>{currentInscripcion?.alumno_nombre_completo}</strong> del grupo <strong>{currentInscripcion?.clave_grupo}</strong>. El cupo del grupo será liberado.
          </p>
          <div className="flex w-full gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>Mantener</Button>
            <Button variant="danger" className="flex-1" onClick={handleDelete} isLoading={deleteLoading}>Eliminar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InscripcionesList;
