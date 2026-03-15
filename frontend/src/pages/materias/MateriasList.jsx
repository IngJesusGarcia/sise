import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Book, AlertCircle } from 'lucide-react';
import materiasService from '../../services/materiasService';
import { Card } from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const MateriasList = () => {
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentMateria, setCurrentMateria] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchMaterias();
  }, []);

  const fetchMaterias = async () => {
    try {
      setLoading(true);
      const data = await materiasService.getAll();
      setMaterias(data);
    } catch (error) {
      console.error('Error fetching materias:', error);
      alert('Error al cargar las materias.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (materia) => {
    setCurrentMateria(materia);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await materiasService.delete(currentMateria.id);
      setIsDeleteModalOpen(false);
      fetchMaterias();
    } catch (error) {
      console.error('Error deleting materia:', error);
      alert('Error al eliminar la materia.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredData = materias.filter(m => 
    m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.clave.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.licenciatura_nombre && m.licenciatura_nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns = [
    { header: 'Clave', accessor: 'clave' },
    { 
      header: 'Materia', 
      cell: (row) => <span className="font-semibold text-gray-800">{row.nombre}</span> 
    },
    { header: 'Licenciatura', accessor: 'licenciatura_nombre' },
    { header: 'Semestre', accessor: 'semestre' },
    { header: 'Créditos', accessor: 'creditos' },
    {
      header: 'Acciones',
      cell: (row) => (
        <div className="flex gap-3">
          <button 
            onClick={() => navigate(`/materias/editar/${row.id}`)}
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
              <Book size={24} />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Catálogo de Materias</h1>
          </div>
          <p className="text-gray-500">Gestión de unidades de aprendizaje por Licenciatura y Semestre.</p>
        </div>
        
        <Button variant="primary" icon={Plus} onClick={() => navigate('/materias/nueva')}>
          Nueva Materia
        </Button>
      </div>

      <Card>
        <div className="p-0">
          {loading ? (
             <div className="h-64 flex flex-col items-center justify-center space-y-4">
               <div className="animate-spin rounded-full h-10 w-10 border-4 border-unich-purple border-t-transparent"></div>
               <p className="text-gray-500 font-medium">Cargando materias...</p>
             </div>
          ) : (
            <Table 
              columns={columns} 
              data={filteredData} 
              onSearch={setSearchTerm}
              searchPlaceholder="Buscar por clave, materia o licenciatura..."
            />
          )}
        </div>
      </Card>

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
          <h4 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar Materia?</h4>
          <p className="text-sm text-gray-500 mb-6">
            Eliminarás <strong>{currentMateria?.nombre}</strong>. Se removerá también de los planes de estudio. Asegúrate que no haya alumnos inscritos a esta materia.
          </p>
          <div className="flex w-full gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
            <Button variant="danger" className="flex-1" onClick={handleDelete} isLoading={deleteLoading}>Eliminar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MateriasList;
