import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Gavel } from 'lucide-react';
import { juridicoService } from '../../../services/juridicoService';
import { Card, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

const AbogadosList = () => {
  const [abogados, setAbogados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAbogados = async () => {
    setLoading(true);
    try {
      const data = await juridicoService.getAbogados({ buscar: searchTerm });
      setAbogados(data);
    } catch (error) {
      console.error('Error fetching abogados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAbogados();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este abogado?')) {
      try {
        await juridicoService.deleteAbogado(id);
        fetchAbogados();
      } catch (error) {
        alert(error.response?.data?.message || 'Error al eliminar abogado');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
            <Gavel size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Catálogo de Abogados</h1>
            <p className="text-sm text-gray-500">Gestión de representantes legales e institucionales.</p>
          </div>
        </div>
        <Link to="/juridico/abogados/nuevo">
          <Button variant="primary" icon={Plus}>Registrar Abogado</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre o especialidad..."
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
                  <th className="px-6 py-4 font-semibold">Nombre</th>
                  <th className="px-6 py-4 font-semibold">Contacto</th>
                  <th className="px-6 py-4 font-semibold">Especialidad</th>
                  <th className="px-6 py-4 font-semibold">Estatus</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
                        Cargando abogados...
                      </div>
                    </td>
                  </tr>
                ) : abogados.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">No se encontraron abogados registrados.</td>
                  </tr>
                ) : (
                  abogados.map((ab) => (
                    <tr key={ab.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">{ab.nombre}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900">{ab.telefono || '-'}</div>
                        <div className="text-xs text-gray-500">{ab.correo || '-'}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {ab.especialidad || <span className="text-gray-400 italic">No especificada</span>}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={ab.estatus ? 'success' : 'danger'}>
                          {ab.estatus ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link to={`/juridico/abogados/editar/${ab.id}`}>
                            <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Editar Abogado">
                              <Edit size={18} />
                            </button>
                          </Link>
                          <button 
                            onClick={() => handleDelete(ab.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                            title="Eliminar Abogado"
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

export default AbogadosList;
