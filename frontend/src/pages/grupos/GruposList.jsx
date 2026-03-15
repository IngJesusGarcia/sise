import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Users, AlertCircle } from 'lucide-react';
import gruposService from '../../services/gruposService';
import { Card } from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const GruposList = () => {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal de eliminación
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentGrupo, setCurrentGrupo] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchGrupos();
  }, []);

  const fetchGrupos = async () => {
    try {
      setLoading(true);
      const data = await gruposService.getAll();
      setGrupos(data);
    } catch (error) {
      console.error('Error fetching grupos:', error);
      alert('Error al cargar la lista de grupos.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (grupo) => {
    setCurrentGrupo(grupo);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await gruposService.delete(currentGrupo.id);
      setIsDeleteModalOpen(false);
      fetchGrupos();
    } catch (error) {
      console.error('Error deleting grupo:', error);
      alert('Error al eliminar el grupo.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtrado múltiple usando nombre de materia, docente o clave del grupo
  const filteredData = grupos.filter(g => {
    const claveMatches = String(g.clave_grupo || '').toLowerCase().includes(searchTerm.toLowerCase());
    const materiaMatches = String(g.materia_nombre || '').toLowerCase().includes(searchTerm.toLowerCase());
    const docenteMatches = String(g.docente_nombre_completo || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return claveMatches || materiaMatches || docenteMatches;
  });

  const columns = [
    { header: 'Clave Grupo', accessor: 'clave_grupo' },
    { 
      header: 'Materia', 
      cell: (row) => (
        <div>
          <span className="font-semibold text-gray-800 block">{row.materia_nombre}</span>
          <span className="text-xs text-gray-500">{row.licenciatura_nombre} - Semestre {row.semestre}</span>
        </div>
      )
    },
    { header: 'Docente', accessor: 'docente_nombre_completo' },
    { header: 'Periodo', accessor: 'periodo_nombre' },
    { header: 'Salón', accessor: 'aula' },
    { 
      header: 'Ocupación', 
      cell: (row) => (
        <span className={`font-mono text-sm px-2 py-1 rounded ${row.inscritos >= row.capacidad ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {row.inscritos} / {row.capacidad}
        </span>
      )
    },
    {
      header: 'Acciones',
      cell: (row) => (
        <div className="flex gap-2">
          <button 
            onClick={() => navigate(`/grupos/editar/${row.id}`)}
            className="text-gray-400 hover:text-unich-purple hover:bg-unich-purple/10 p-2 rounded-lg transition-colors"
            title="Editar Grupo"
          >
            <Edit2 size={18} />
          </button>
          <button 
            onClick={() => confirmDelete(row)}
            className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
            title="Eliminar Grupo"
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
              <Users size={24} />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Gestión de Grupos</h1>
          </div>
          <p className="text-gray-500">Administra la apertura de grupos, asignaciones docentes y capacidad para el periodo lectivo.</p>
        </div>
        
        <Button variant="primary" icon={Plus} onClick={() => navigate('/grupos/nuevo')}>
          Nuevo Grupo
        </Button>
      </div>

      <Card>
        <div className="p-0">
          {loading ? (
             <div className="h-64 flex flex-col items-center justify-center space-y-4">
               <div className="animate-spin rounded-full h-10 w-10 border-4 border-unich-purple border-t-transparent"></div>
               <p className="text-gray-500 font-medium">Cargando catálogo de grupos...</p>
             </div>
          ) : (
            <Table 
              columns={columns} 
              data={filteredData} 
              onSearch={setSearchTerm}
              searchPlaceholder="Buscar por clave de grupo, materia o docente..."
            />
          )}
        </div>
      </Card>

      {/* MODAL DE ELIMINACIÓN */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Cierre y Eliminación"
        maxWidth="sm"
      >
        <div className="py-4 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <AlertCircle size={32} />
          </div>
          <h4 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar Grupo?</h4>
          <p className="text-sm text-gray-500 mb-6">
            Vas a eliminar el grupo <strong>{currentGrupo?.clave_grupo}</strong> de la materia <strong>{currentGrupo?.materia_nombre}</strong>. Si existen estudiantes inscritos las constancias serán afectadas. Esta acción no se puede revertir.
          </p>
          <div className="flex w-full gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
            <Button variant="danger" className="flex-1" onClick={handleDelete} isLoading={deleteLoading}>Eliminar Grupo</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GruposList;
