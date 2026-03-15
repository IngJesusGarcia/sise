import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, User, AlertCircle } from 'lucide-react';
import estudiantesService from '../../services/estudiantesService';
import { Card } from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const EstudiantesList = () => {
  const [pagination, setPagination] = useState({
    data: [],
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  
  // Modal state for deletion
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentEstudiante, setCurrentEstudiante] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchEstudiantes();
  }, [page, searchTerm]);

  const fetchEstudiantes = async () => {
    try {
      setLoading(true);
      const res = await estudiantesService.getAll({ 
        page, 
        search: searchTerm,
        per_page: 15
      });
      
      // The backend returns a paginated structure { current_page, data, ... }
      if (res.data && Array.isArray(res.data)) {
        setPagination({
          ...res,
          onPageChange: (newPage) => setPage(newPage)
        });
      } else {
        // Fallback for simple array responses if any
        setPagination({
          data: res,
          current_page: 1,
          last_page: 1,
          total: res.length,
          from: 1,
          to: res.length,
          onPageChange: (newPage) => setPage(newPage)
        });
      }
    } catch (error) {
      console.error('Error fetching estudiantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (est) => {
    setCurrentEstudiante(est);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await estudiantesService.delete(currentEstudiante.id);
      setIsDeleteModalOpen(false);
      fetchEstudiantes();
    } catch (error) {
      console.error('Error deleting estudiante:', error);
      alert('Error al eliminar el estudiante.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const estatusColors = {
    'activo': 'bg-green-100 text-green-800',
    'baja_temporal': 'bg-yellow-100 text-yellow-800',
    'baja_definitiva': 'bg-red-100 text-red-800',
    'egresado': 'bg-blue-100 text-blue-800',
    'titulado': 'bg-purple-100 text-purple-800'
  };

  const columns = [
    { header: 'Matrícula', accessor: 'matricula', cell: (row) => <span className="font-mono text-sm">{row.matricula}</span> },
    { 
      header: 'Estudiante', 
      cell: (row) => (
        <div>
          <span className="font-semibold text-gray-800 block text-sm">
            {row.apellido_paterno} {row.apellido_materno} {row.nombre}
          </span>
          <span className="text-xs text-gray-500">{row.curp || row.correo}</span>
        </div>
      )
    },
    { 
      header: 'Programa Académico', 
      cell: (row) => (
        <div>
          <span className="block text-sm text-gray-700">{row.licenciatura?.nombre || 'N/A'}</span>
          <span className="text-xs text-unich-purple font-medium">Semestre {row.semestre_actual}</span>
        </div>
      )
    },
    {
      header: 'Estatus',
      cell: (row) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${estatusColors[row.estatus] || 'bg-gray-100 text-gray-800'}`}>
          {String(row.estatus).replace('_', ' ').toUpperCase()}
        </span>
      )
    },
    {
      header: 'Acciones',
      cell: (row) => (
        <div className="flex gap-1 justify-end">
          <button 
            onClick={() => navigate(`/estudiantes/perfil/${row.id}`)}
            className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
            title="Ver Perfil"
          >
            <Eye size={18} />
          </button>
          <button 
            onClick={() => navigate(`/estudiantes/editar/${row.id}`)}
            className="text-gray-400 hover:text-unich-purple hover:bg-unich-purple/10 p-2 rounded-lg transition-colors"
            title="Editar Estudiante"
          >
            <Edit2 size={18} />
          </button>
          <button 
            onClick={() => confirmDelete(row)}
            className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
            title="Eliminar Estudiante"
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
              <User size={24} />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Directorio Escolar</h1>
          </div>
          <p className="text-gray-500">Gestión centralizada del padrón de alumnos y comunidad universitaria.</p>
        </div>
        
        <Button variant="primary" icon={Plus} onClick={() => navigate('/estudiantes/nuevo')}>
          Nuevo Estudiante
        </Button>
      </div>

      <Card>
        <div className="p-0">
          {loading ? (
             <div className="h-64 flex flex-col items-center justify-center space-y-4">
               <div className="animate-spin rounded-full h-10 w-10 border-4 border-unich-purple border-t-transparent"></div>
               <p className="text-gray-500 font-medium">Cargando padrón de estudiantes...</p>
             </div>
          ) : (
            <Table 
              columns={columns} 
              pagination={pagination} 
              onSearch={(val) => {
                setSearchTerm(val);
                setPage(1); // Reset to first page on search
              }}
              searchPlaceholder="Buscar por matrícula, nombre, apellidos o CURP..."
            />
          )}
        </div>
      </Card>

      {/* MODAL DE ELIMINACIÓN */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Baja del Sistema"
        maxWidth="sm"
      >
        <div className="py-4 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <AlertCircle size={32} />
          </div>
          <h4 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar Estudiante?</h4>
          <p className="text-sm text-gray-500 mb-6">
            Eliminarás el registro completo de <strong>{currentEstudiante?.nombre} {currentEstudiante?.apellido_paterno}</strong>. Esto borrará su historial e inscripciones. Para procesos terminados, es mejor cambiar su estatus a <i>baja definitiva</i>.
          </p>
          <div className="flex w-full gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
            <Button variant="danger" className="flex-1" onClick={handleDelete} isLoading={deleteLoading}>Forzar Eliminación</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EstudiantesList;
