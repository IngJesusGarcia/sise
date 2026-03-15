import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, FolderOpen, AlertCircle } from 'lucide-react';
import { juridicoService } from '../../../services/juridicoService';
import { Card, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

const ExpedientesList = () => {
  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchExpedientes = async () => {
    setLoading(true);
    try {
      const data = await juridicoService.getExpedientes({ buscar: searchTerm });
      setExpedientes(data.data || []); // Accessing the paginated array
    } catch (error) {
      console.error('Error fetching expedientes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => fetchExpedientes(), 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar permanentemente este expediente?')) {
      try {
        await juridicoService.deleteExpediente(id);
        fetchExpedientes();
      } catch (error) {
        alert(error.response?.data?.message || 'Error al eliminar');
      }
    }
  };

  const getStatusBadge = (estatus) => {
    const variants = {
      'activo': 'success',
      'concluido': 'secondary',
      'suspendido': 'warning',
      'archivado': 'secondary'
    };
    return <Badge variant={variants[estatus] || 'secondary'}>{estatus ? estatus.toUpperCase() : 'DESCONOCIDO'}</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
            <FolderOpen size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Control de Expedientes Jurídicos</h1>
            <p className="text-sm text-gray-500">Listado general de casos, juicios y asuntos legales en proceso.</p>
          </div>
        </div>
        <Link to="/juridico/expedientes/nuevo">
          <Button variant="primary" icon={Plus}>Aperturar Expediente</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex gap-4">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por # expediente, categoría, juzgado o abogado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">N° Expediente / Categoría</th>
                  <th className="px-6 py-4 font-semibold">Juzgado / Institución</th>
                  <th className="px-6 py-4 font-semibold">Abogado Asignado</th>
                  <th className="px-6 py-4 font-semibold">Estatus</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">Cargando expedientes...</td>
                  </tr>
                ) : expedientes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center opacity-60">
                        <AlertCircle className="w-12 h-12 mb-3 text-gray-400" />
                        <p className="text-lg">No hay expedientes jurídicos registrados.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  expedientes.map((exp) => (
                    <tr key={exp.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{exp.numero_expediente}</div>
                        <div className="text-xs text-indigo-600 font-medium">{exp.categoria}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700">{exp.juzgado || <span className="text-gray-400 italic">No especificado</span>}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-800 font-medium">{exp.abogado?.nombre || <span className="text-gray-400 italic">Sin Asignar</span>}</div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(exp.estatus)}
                        <div className="text-xs text-gray-400 mt-1">Inicio: {exp.fecha_inicio ? new Date(exp.fecha_inicio).toLocaleDateString() : 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link to={`/juridico/expedientes/editar/${exp.id}`}>
                            <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Editar">
                              <Edit size={18} />
                            </button>
                          </Link>
                          <button 
                            onClick={() => handleDelete(exp.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpedientesList;
