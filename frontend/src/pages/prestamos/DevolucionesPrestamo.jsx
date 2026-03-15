import React, { useState, useEffect } from 'react';
import { prestamosService } from "../../services/prestamosService";
import { Card, CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { CornerUpLeft, User, Package, Calendar, Loader2, CheckCircle2 } from 'lucide-react';
const toast = { success: alert, error: alert };

const DevolucionesPrestamo = () => {
  const [activos, setActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrestamo, setSelectedPrestamo] = useState(null);
  const [formData, setFormData] = useState({
    estado_equipo: 'Bueno',
    observaciones: ''
  });

  const fetchActivos = async () => {
    try {
      setLoading(true);
      const data = await prestamosService.getActivos();
      setActivos(data || []);
    } catch (error) {
      toast.error('Error al cargar préstamos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivos();
  }, []);

  const handleReturn = async (e) => {
    e.preventDefault();
    if (!selectedPrestamo) return;

    try {
      await prestamosService.registrarDevolucion(selectedPrestamo.id, formData);
      toast.success('Devolución registrada correctamente');
      setSelectedPrestamo(null);
      setFormData({ estado_equipo: 'Bueno', observaciones: '' });
      fetchActivos();
    } catch (error) {
      toast.error('Error al registrar devolución');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Devoluciones</h1>
          <p className="text-gray-500">Registrar la entrega de equipos prestados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <CornerUpLeft className="w-5 h-5 text-unich-magenta" /> Préstamos pendientes de entrega
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3">Responsable</th>
                      <th className="px-4 py-3">Equipo</th>
                      <th className="px-4 py-3">Fecha Entrega</th>
                      <th className="px-4 py-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr><td colSpan="4" className="text-center py-4"><Loader2 className="w-6 h-6 animate-spin mx-auto text-unich-magenta" /></td></tr>
                    ) : activos.length > 0 ? (
                      activos.map((prestamo) => (
                        <tr key={prestamo.id} className={`hover:bg-gray-50 cursor-pointer ${selectedPrestamo?.id === prestamo.id ? 'bg-unich-magenta/5 border-l-4 border-l-unich-magenta' : ''}`} onClick={() => setSelectedPrestamo(prestamo)}>
                          <td className="px-4 py-3 font-medium">{prestamo.usuario?.name}</td>
                          <td className="px-4 py-3">
                            <div>{prestamo.equipo?.nombre_equipo}</div>
                            <div className="text-xs text-gray-500">{prestamo.equipo?.codigo_inventario}</div>
                          </td>
                          <td className="px-4 py-3">{new Date(prestamo.fecha_devolucion).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-right">
                            <Button size="sm" variant={selectedPrestamo?.id === prestamo.id ? 'primary' : 'outline'}>Seleccionar</Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="4" className="text-center py-8 text-gray-500">No hay préstamos activos</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className={!selectedPrestamo ? 'opacity-50 pointer-events-none' : ''}>
            <CardContent className="p-6">
              <h3 className="font-bold mb-4">Detallar Devolución</h3>
              {selectedPrestamo ? (
                <form onSubmit={handleReturn} className="space-y-4">
                   <div className="p-3 bg-blue-50 rounded-lg flex items-center gap-3 mb-4">
                    <Package className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="text-xs text-blue-600 font-bold uppercase">Equipo</p>
                      <p className="text-sm font-bold text-gray-800">{selectedPrestamo.equipo?.nombre_equipo}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Estado del Equipo</label>
                    <select
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-unich-magenta"
                      value={formData.estado_equipo}
                      onChange={(e) => setFormData({...formData, estado_equipo: e.target.value})}
                    >
                      <option value="Bueno">Excelente / Nuevo</option>
                      <option value="Regular">De Uso (Bueno)</option>
                      <option value="Dañado">Dañado / Faltante</option>
                      <option value="Mantenimiento">Requiere Mantenimiento</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Observaciones</label>
                    <textarea
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-unich-magenta"
                      rows="3"
                      placeholder="Ej. Se entrega sin cable HDMI..."
                      value={formData.observaciones}
                      onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                    />
                  </div>

                  <Button type="submit" className="w-full" icon={CheckCircle2}>
                    Registrar Entrega
                  </Button>
                  <Button type="button" variant="outline" className="w-full" onClick={() => setSelectedPrestamo(null)}>
                    Cancelar
                  </Button>
                </form>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <CornerUpLeft className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>Selecciona un préstamo de la lista para procesar su devolución</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DevolucionesPrestamo;
