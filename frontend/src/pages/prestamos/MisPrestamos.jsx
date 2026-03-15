import React, { useState, useEffect } from 'react';
import { prestamosService } from "../../services/prestamosService";
import { Card, CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Package, PlusCircle, History, Clock, Info, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
const toast = { success: alert, error: alert };

const MisPrestamos = () => {
  const [equipos, setEquipos] = useState([]);
  const [misSolicitudes, setMisSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('solicitar');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEquipo, setSelectedEquipo] = useState(null);
  const [formData, setFormData] = useState({
    fecha_prestamo: '',
    fecha_devolucion: '',
    motivo: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [equiposData, solicitudesData] = await Promise.all([
        prestamosService.getEquiposDisponibles(),
        prestamosService.getSolicitudes()
      ]);
      setEquipos(equiposData);
      setMisSolicitudes(solicitudesData.data || []);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSolicitar = async (e) => {
    e.preventDefault();
    try {
      await prestamosService.createSolicitud({
        equipo_id: selectedEquipo.id,
        ...formData
      });
      toast.success('Solicitud enviada con éxito. Espera aprobación del área.');
      setIsModalOpen(false);
      setFormData({ fecha_prestamo: '', fecha_devolucion: '', motivo: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al enviar solicitud');
    }
  };

  const getEstatusBadge = (estatus) => {
    switch (estatus) {
      case 'pendiente': return <Badge variant="warning">Pendiente</Badge>;
      case 'aprobado': return <Badge variant="primary">Aprobado / En Uso</Badge>;
      case 'rechazado': return <Badge variant="danger">Rechazado</Badge>;
      case 'devuelto': return <Badge variant="success">Entregado</Badge>;
      default: return <Badge>{estatus}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mis Préstamos</h1>
          <p className="text-gray-500">Gestiona tus solicitudes de equipo institucional</p>
        </div>
        <div className="flex p-1 bg-gray-100 rounded-xl w-full md:w-fit">
          <button
            onClick={() => setActiveTab('solicitar')}
            className={`flex-1 md:flex-none px-6 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'solicitar' ? 'bg-white text-unich-magenta shadow-sm' : 'text-gray-500'}`}
          >
            <PlusCircle className="w-4 h-4" /> Solicitar Equipo
          </button>
          <button
            onClick={() => setActiveTab('historial')}
            className={`flex-1 md:flex-none px-6 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'historial' ? 'bg-white text-unich-magenta shadow-sm' : 'text-gray-500'}`}
          >
            <History className="w-4 h-4" /> Mi Historial
          </button>
        </div>
      </div>

      {activeTab === 'solicitar' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
             <div className="col-span-full py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-unich-magenta opacity-50" /></div>
          ) : equipos.length > 0 ? (
            equipos.map((equipo) => (
              <Card key={equipo.id} className="hover:shadow-md transition-shadow flex flex-col h-full border-t-4 border-t-unich-magenta">
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-unich-magenta/5 rounded-lg text-unich-magenta">
                      <Package className="w-6 h-6" />
                    </div>
                    <Badge variant="success">Disponible</Badge>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{equipo.nombre_equipo}</h3>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{equipo.codigo_inventario}</div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-6 flex-1">
                    {equipo.descripcion || 'Sin descripción adicional disponible.'}
                  </p>
                  <Button
                    onClick={() => { setSelectedEquipo(equipo); setIsModalOpen(true); }}
                    className="w-full"
                    icon={PlusCircle}
                  >
                    Solicitar Equipo
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-100">
               <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
               <h3 className="text-xl font-bold text-gray-400">No hay equipos disponibles</h3>
               <p className="text-gray-400">Inténtalo más tarde o contacta al área de préstamos.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-unich-magenta opacity-50" /></div>
          ) : misSolicitudes.length > 0 ? (
            misSolicitudes.map((sol) => (
              <Card key={sol.id}>
                <CardContent className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-50 rounded-xl shrink-0">
                      <Clock className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-800">{sol.equipo?.nombre_equipo}</span>
                        {getEstatusBadge(sol.estatus)}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-4">
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(sol.fecha_prestamo).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1 font-medium italic">"{sol.motivo}"</span>
                      </div>
                    </div>
                  </div>
                  {sol.estatus === 'aprobado' && (
                    <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-100 flex items-center gap-2 text-sm font-bold">
                       <ArrowRight className="w-4 h-4" /> Entrega prevista: {new Date(sol.fecha_devolucion).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-20">
               <History className="w-16 h-16 text-gray-200 mx-auto mb-4" />
               <p className="text-gray-400">Aún no has solicitado ningún préstamo.</p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg shadow-2xl">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Solicitud de Préstamo</h2>
              <p className="text-gray-500 text-sm mb-6">Completa los detalles para tu préstamo de: <span className="text-unich-magenta font-bold">{selectedEquipo?.nombre_equipo}</span></p>
              
              <form onSubmit={handleSolicitar} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">Fecha de Préstamo</label>
                    <input
                      required
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-unich-magenta outline-none transition-all"
                      value={formData.fecha_prestamo}
                      onChange={(e) => setFormData({...formData, fecha_prestamo: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">Fecha de Devolución</label>
                    <input
                      required
                      type="date"
                      min={formData.fecha_prestamo || new Date().toISOString().split('T')[0]}
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-unich-magenta outline-none transition-all"
                      value={formData.fecha_devolucion}
                      onChange={(e) => setFormData({...formData, fecha_devolucion: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Motivo del Préstamo</label>
                  <textarea
                    required
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-unich-magenta outline-none transition-all"
                    rows="4"
                    placeholder="Describe para qué necesitas el equipo..."
                    value={formData.motivo}
                    onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 font-bold">
                  <Button type="submit" className="flex-1 order-2 sm:order-1" icon={CheckCircle}>Enviar Solicitud</Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 order-1 sm:order-2"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MisPrestamos;
