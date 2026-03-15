import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Scale, AlertCircle } from 'lucide-react';
import { juridicoService } from '../../../services/juridicoService';
import { Card, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

const DemandasList = () => {
  const [demandas, setDemandas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDemandas = async () => {
    setLoading(true);
    try {
      const data = await juridicoService.getDemandas({ buscar: searchTerm });
      setDemandas(data.data || []);
    } catch (error) {
      console.error('Error fetching demandas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => fetchDemandas(), 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar permanentemente esta demanda laboral?')) {
      try {
        await juridicoService.deleteDemanda(id);
        fetchDemandas();
      } catch (error) {
        alert(error.response?.data?.message || 'Error al eliminar demanda');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
            <Scale size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Demandas Laborales</h1>
            <p className="text-sm text-gray-500">Control de juicios laborales y etapas procesales contra la universidad.</p>
          </div>
        </div>
        <Link to="/juridico/demandas/nuevo">
          <Button variant="primary" icon={Plus}>Registrar Demanda</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex gap-4">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por progresivo o nombre del trabajador..."
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
                  <th className="px-6 py-4 font-semibold">Progresivo / Fecha</th>
                  <th className="px-6 py-4 font-semibold">Trabajador Demandante</th>
                  <th className="px-6 py-4 font-semibold">N° Expediente</th>
                  <th className="px-6 py-4 font-semibold">Estatus / Resultado</th>
                  <th className="px-6 py-4 font-semibold">Amparo</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">Cargando demandas...</td>
                  </tr>
                ) : demandas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center opacity-60">
                        <AlertCircle className="w-12 h-12 mb-3 text-gray-400" />
                        <p className="text-lg">No hay demandas laborales registradas.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  demandas.map((dm) => (
                    <tr key={dm.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{dm.numero_progresivo}</div>
                        <div className="text-xs text-gray-500">{dm.fecha_demanda ? new Date(dm.fecha_demanda).toLocaleDateString() : 'Sin Fecha'}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {dm.nombre_trabajador}
                      </td>
                      <td className="px-6 py-4 text-indigo-600 font-medium">
                        {dm.numero_expediente || '-'}
                      </td>
                      <td className="px-6 py-4">
                        {dm.resultado ? (
                          <Badge variant="success">{dm.resultado}</Badge>
                        ) : (
                          <span className="text-gray-500 italic text-xs uppercase tracking-wider">En Trámite</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {dm.amparo ? <Badge variant="warning">SI</Badge> : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link to={`/juridico/demandas/editar/${dm.id}`}>
                            <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Editar Expediente Laboral">
                              <Edit size={18} />
                            </button>
                          </Link>
                          <button 
                            onClick={() => handleDelete(dm.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                            title="Eliminar Demanda"
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

export default DemandasList;
