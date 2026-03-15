import React, { useState, useEffect } from 'react';
import { prestamosService } from "../../services/prestamosService";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { History, Search, Filter, Calendar, User, Package, Loader2 } from 'lucide-react';
const toast = { success: alert, error: alert };

const HistorialPrestamo = () => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    equipo_id: '',
    usuario_id: '',
    fecha_inicio: '',
    fecha_fin: ''
  });

  const fetchHistorial = async () => {
    try {
      setLoading(true);
      const data = await prestamosService.getHistorial(filters);
      setHistorial(data.data || []);
    } catch (error) {
      toast.error('Error al cargar historial');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorial();
  }, [filters]);

  const getEstatusBadge = (estatus) => {
    switch (estatus) {
      case 'pendiente': return <Badge variant="warning">Pendiente</Badge>;
      case 'aprobado': return <Badge variant="primary">Aprobado</Badge>;
      case 'rechazado': return <Badge variant="danger">Rechazado</Badge>;
      case 'devuelto': return <Badge variant="success">Devuelto</Badge>;
      default: return <Badge>{estatus}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Historial de Préstamos</h1>
        <p className="text-gray-500">Consulta histórica completa de todos los movimientos de equipos</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha Inicio</label>
              <input 
                type="date" 
                className="w-full text-sm border rounded-lg p-2"
                value={filters.fecha_inicio}
                onChange={(e) => setFilters({...filters, fecha_inicio: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha Fin</label>
              <input 
                type="date" 
                className="w-full text-sm border rounded-lg p-2"
                value={filters.fecha_fin}
                onChange={(e) => setFilters({...filters, fecha_fin: e.target.value})}
              />
            </div>
            <div className="md:col-span-2 flex items-end">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="ID Usuario o Equipo..."
                  className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg"
                />
              </div>
              <button 
                onClick={() => setFilters({ equipo_id: '', usuario_id: '', fecha_inicio: '', fecha_fin: '' })}
                className="ml-2 px-3 py-2 text-sm text-gray-500 hover:text-unich-magenta font-medium"
              >
                Limpiar
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3">Fecha Solicitud</th>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Equipo</th>
                  <th className="px-4 py-3">Estatus</th>
                  <th className="px-4 py-3">Periodo Préstamo</th>
                  <th className="px-4 py-3">Entrega Real</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin mx-auto text-unich-magenta" /></td></tr>
                ) : historial.length > 0 ? (
                  historial.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500">{new Date(item.fecha_solicitud).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                         <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-unich-purple/10 flex items-center justify-center text-[10px] text-unich-purple font-bold">
                             {item.usuario?.name.charAt(0)}
                           </div>
                           <span className="font-medium text-gray-900">{item.usuario?.name}</span>
                         </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{item.equipo?.nombre_equipo}</div>
                        <div className="text-[10px] text-gray-500">{item.equipo?.codigo_inventario}</div>
                      </td>
                      <td className="px-4 py-3">{getEstatusBadge(item.estatus)}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {new Date(item.fecha_prestamo).toLocaleDateString()} - {new Date(item.fecha_devolucion).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {item.devolucion ? (
                          <div className="text-xs">
                             <span className="text-green-600 block font-bold">{new Date(item.devolucion.fecha_devolucion_real).toLocaleDateString()}</span>
                             <span className="text-gray-400 italic">Estado: {item.devolucion.estado_equipo}</span>
                          </div>
                        ) : (
                          <span className="text-gray-300">Pendiente</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="text-center py-12 text-gray-400 italic">No hay registros históricos</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HistorialPrestamo;
