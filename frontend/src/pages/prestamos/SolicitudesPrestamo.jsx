import React, { useState, useEffect } from 'react';
import { prestamosService } from "../../services/prestamosService";
import { Card, CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { ClipboardList, Check, X, User, Package, Calendar, MessageSquare, Loader2 } from 'lucide-react';
const toast = { success: alert, error: alert };

const SolicitudesPrestamo = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pendiente');

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      const data = await prestamosService.getSolicitudes({ estatus: filter });
      setSolicitudes(data.data || []);
    } catch (error) {
      toast.error('Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, [filter]);

  const handleUpdateEstatus = async (id, estatus) => {
    const action = estatus === 'aprobado' ? 'Aprobar' : 'Rechazar';
    if (!window.confirm(`¿${action} esta solicitud?`)) return;

    try {
      await prestamosService.updateEstatusSolicitud(id, estatus);
      toast.success(`Solicitud ${estatus === 'aprobado' ? 'aprobada' : 'rechazada'}`);
      fetchSolicitudes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al procesar');
    }
  };

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Solicitudes de Préstamo</h1>
          <p className="text-gray-500">Bandeja de gestión para aprobación de solicitudes</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setFilter('pendiente')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'pendiente' ? 'bg-white shadow text-unich-magenta' : 'text-gray-600'}`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setFilter('aprobado')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'aprobado' ? 'bg-white shadow text-unich-magenta' : 'text-gray-600'}`}
          >
            Aprobadas
          </button>
          <button
            onClick={() => setFilter('')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === '' ? 'bg-white shadow text-unich-magenta' : 'text-gray-600'}`}
          >
            Todas
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-unich-magenta" />
          </div>
        ) : solicitudes.length > 0 ? (
          solicitudes.map((solicitud) => (
            <Card key={solicitud.id} className={`border-l-4 ${solicitud.estatus === 'pendiente' ? 'border-l-yellow-400' : 'border-l-blue-400'}`}>
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg h-fit">
                      <ClipboardList className="w-6 h-6 text-unich-purple" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{solicitud.equipo?.nombre_equipo}</span>
                        {getEstatusBadge(solicitud.estatus)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1"><User className="w-4 h-4" /> {solicitud.usuario?.name}</span>
                        <span className="flex items-center gap-1"><Package className="w-4 h-4" /> {solicitud.equipo?.codigo_inventario}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 pt-1">
                        <span className="flex items-center gap-1 group">
                          <Calendar className="w-4 h-4" /> 
                          Del {new Date(solicitud.fecha_prestamo).toLocaleDateString()} al {new Date(solicitud.fecha_devolucion).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700 italic border border-gray-100 flex gap-2">
                        <MessageSquare className="w-4 h-4 text-gray-400 shrink-0" />
                        "{solicitud.motivo}"
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 md:self-center">
                    {solicitud.estatus === 'pendiente' && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleUpdateEstatus(solicitud.id, 'aprobado')}
                          icon={Check}
                        >
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleUpdateEstatus(solicitud.id, 'rechazado')}
                          icon={X}
                        >
                          Rechazar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center p-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hay solicitudes que mostrar</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SolicitudesPrestamo;
