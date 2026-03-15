import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Mail, Download, AlertCircle } from 'lucide-react';
import { juridicoService } from '../../../services/juridicoService';
import { Card, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/sise/backend/public';

const CorrespondenciaJuridicaList = () => {
  const [correspondencia, setCorrespondencia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCorrespondencia = async () => {
    setLoading(true);
    try {
      const data = await juridicoService.getCorrespondencias({ buscar: searchTerm });
      setCorrespondencia(data.data || []);
    } catch (error) {
      console.error('Error fetching correspondencia jurídica:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => fetchCorrespondencia(), 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este documento jurídico?')) {
      try {
        await juridicoService.deleteCorrespondencia(id);
        fetchCorrespondencia();
      } catch (error) {
        alert(error.response?.data?.message || 'Error al eliminar');
      }
    }
  };

  const statusColors = {
    'registrado': 'secondary',
    'en_proceso': 'warning',
    'atendido': 'success',
    'archivado': 'secondary',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
            <Mail size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Correspondencia Jurídica</h1>
            <p className="text-sm text-gray-500">Gestión de oficios, notificaciones y requerimientos legales.</p>
          </div>
        </div>
        <Link to="/juridico/correspondencia/nuevo">
          <Button variant="primary" icon={Plus}>Registrar Documento</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex gap-4">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por folio, asunto o abogado asignado..."
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
                  <th className="px-6 py-4 font-semibold">Folio / Fecha</th>
                  <th className="px-6 py-4 font-semibold">Tipo y Asunto</th>
                  <th className="px-6 py-4 font-semibold">Turnado a</th>
                  <th className="px-6 py-4 font-semibold">Estatus</th>
                  <th className="px-6 py-4 font-semibold text-center">Archivo</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">Cargando correspondencia...</td>
                  </tr>
                ) : correspondencia.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center opacity-60">
                        <AlertCircle className="w-12 h-12 mb-3 text-gray-400" />
                        <p className="text-lg">No hay correspondencia jurídica registrada.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  correspondencia.map((doc) => (
                    <tr key={doc.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{doc.folio}</div>
                        <div className="text-xs text-gray-500">{new Date(doc.fecha).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-indigo-600 font-medium uppercase tracking-wide">{doc.tipo_documento}</div>
                        <div className="font-medium text-gray-800 line-clamp-2">{doc.asunto}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700">{doc.abogado?.nombre || <span className="text-gray-400 italic">No asignado</span>}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={statusColors[doc.estatus] || 'secondary'}>
                          {doc.estatus.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {doc.archivo ? (
                          <a href={`${API_URL.replace('/api', '')}/storage/${doc.archivo}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors" title="Descargar PDF">
                            <Download size={16} />
                          </a>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link to={`/juridico/correspondencia/editar/${doc.id}`}>
                            <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Editar Documento">
                              <Edit size={18} />
                            </button>
                          </Link>
                          <button 
                            onClick={() => handleDelete(doc.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                            title="Eliminar Documento"
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

export default CorrespondenciaJuridicaList;
