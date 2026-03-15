import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, FileSignature, Download, AlertCircle } from 'lucide-react';
import { juridicoService } from '../../../services/juridicoService';
import { Card, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/sise/backend/public';

const ConveniosList = () => {
  const [convenios, setConvenios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchConvenios = async () => {
    setLoading(true);
    try {
      const data = await juridicoService.getConvenios({ buscar: searchTerm });
      setConvenios(data.data || []);
    } catch (error) {
      console.error('Error fetching convenios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => fetchConvenios(), 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este convenio? Se borrará también su archivo adjunto.')) {
      try {
        await juridicoService.deleteConvenio(id);
        fetchConvenios();
      } catch (error) {
        alert(error.response?.data?.message || 'Error al eliminar');
      }
    }
  };

  const isVencido = (fecha_vencimiento) => {
    if (!fecha_vencimiento) return false;
    return new Date(fecha_vencimiento) < new Date();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
            <FileSignature size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Convenios y Contratos Institucionales</h1>
            <p className="text-sm text-gray-500">Gestor de acuerdos legales y sus fechas de vencimiento.</p>
          </div>
        </div>
        <Link to="/juridico/convenios/nuevo">
          <Button variant="primary" icon={Plus}>Registrar Convenio</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex gap-4">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por N° de control, tipo de convenio o instituciones..."
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
                  <th className="px-6 py-4 font-semibold">N° Control / Tipo</th>
                  <th className="px-6 py-4 font-semibold">Instituciones Involucradas</th>
                  <th className="px-6 py-4 font-semibold text-center">Fechas (Firma / Vencimiento)</th>
                  <th className="px-6 py-4 font-semibold">Archivo</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">Cargando convenios...</td>
                  </tr>
                ) : convenios.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">No hay convenios o contratos registrados.</td>
                  </tr>
                ) : (
                  convenios.map((cv) => {
                    const expired = isVencido(cv.fecha_vencimiento);
                    return (
                      <tr key={cv.id} className={`transition-colors group ${expired ? 'bg-red-50/30' : 'hover:bg-indigo-50/30'}`}>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{cv.numero_control}</div>
                          <div className="text-xs text-indigo-600 font-medium uppercase tracking-wide">{cv.tipo_convenio}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-800 font-medium">{cv.instituciones}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="text-xs text-gray-500">Firma: {cv.fecha_firma ? new Date(cv.fecha_firma).toLocaleDateString() : 'N/A'}</div>
                          <div className={`text-sm font-semibold mt-1 ${expired ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {cv.fecha_vencimiento ? new Date(cv.fecha_vencimiento).toLocaleDateString() : 'Indefinido'}
                          </div>
                          {expired && <span className="text-[10px] font-bold text-rose-500 bg-rose-100 px-1.5 py-0.5 rounded mt-1 inline-block">VENCIDO</span>}
                        </td>
                        <td className="px-6 py-4">
                          {cv.archivo ? (
                            <a href={`${API_URL.replace('/api', '')}/storage/${cv.archivo}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors font-medium">
                              <Download size={14} /> Ver PDF
                            </a>
                          ) : (
                            <span className="text-gray-400 italic text-xs">Sin archivo</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link to={`/juridico/convenios/editar/${cv.id}`}>
                              <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Editar">
                                <Edit size={18} />
                              </button>
                            </Link>
                            <button 
                              onClick={() => handleDelete(cv.id)}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                              title="Eliminar"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConveniosList;
