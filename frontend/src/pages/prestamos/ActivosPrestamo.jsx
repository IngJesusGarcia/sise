import React, { useState, useEffect } from 'react';
import { prestamosService } from '../../services/prestamosService';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Clock, User, Package, Calendar, ArrowRight, Loader2, CalendarX } from 'lucide-react';
const toast = { success: alert, error: alert };

const ActivosPrestamo = () => {
  const [activos, setActivos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivos = async () => {
    try {
      setLoading(true);
      const data = await prestamosService.getActivos();
      setActivos(data || []);
    } catch (error) {
      toast.error('Error al cargar préstamos activos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivos();
  }, []);

  const isOverdue = (date) => {
    return new Date(date) < new Date();
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Préstamos Activos</h1>
        <p className="text-gray-500">Lista de equipos que se encuentran actualmente en posesión de usuarios</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-unich-magenta" />
          </div>
        ) : activos.length > 0 ? (
          activos.map((prestamo) => (
            <Card key={prestamo.id} className="overflow-hidden">
              <div className={`h-2 ${isOverdue(prestamo.fecha_devolucion) ? 'bg-red-500' : 'bg-blue-500'}`} />
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  {isOverdue(prestamo.fecha_devolucion) && (
                    <Badge variant="danger" className="animate-pulse">Vencido</Badge>
                  )}
                </div>

                <h3 className="font-bold text-lg text-gray-900">{prestamo.equipo?.nombre_equipo}</h3>
                <p className="text-sm text-unich-magenta font-medium mb-4">{prestamo.equipo?.codigo_inventario}</p>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Responsable</p>
                      <p className="text-gray-800 font-medium">{prestamo.usuario?.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Salida</p>
                      <p className="text-sm font-bold text-gray-700">{new Date(prestamo.fecha_prestamo).toLocaleDateString()}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300" />
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Devolución</p>
                      <p className={`text-sm font-bold ${isOverdue(prestamo.fecha_devolucion) ? 'text-red-600' : 'text-gray-700'}`}>
                        {new Date(prestamo.fecha_devolucion).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center p-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hay préstamos activos en este momento</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivosPrestamo;
