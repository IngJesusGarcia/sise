import React, { useState, useEffect } from 'react';
import { prestamosService } from "../../services/prestamosService";
import { Card, CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { List, Search, Plus, Trash2, Edit2, Package, MapPin, Calendar, Info, Loader2 } from 'lucide-react';
const toast = { success: alert, error: alert };

const EquiposPrestamo = () => {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipo, setEditingEquipo] = useState(null);
  const [formData, setFormData] = useState({
    codigo_inventario: '',
    nombre_equipo: '',
    categoria: '',
    descripcion: '',
    ubicacion: '',
    fecha_registro: new Date().toISOString().split('T')[0]
  });

  const fetchEquipos = async () => {
    try {
      setLoading(true);
      const data = await prestamosService.getEquipos({ search });
      setEquipos(data.data || []);
    } catch (error) {
      toast.error('Error al cargar equipos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipos();
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEquipo) {
        await prestamosService.updateEquipo(editingEquipo.id, formData);
        toast.success('Equipo actualizado');
      } else {
        await prestamosService.createEquipo(formData);
        toast.success('Equipo registrado');
      }
      setIsModalOpen(false);
      setEditingEquipo(null);
      setFormData({
        codigo_inventario: '',
        nombre_equipo: '',
        categoria: '',
        descripcion: '',
        ubicacion: '',
        fecha_registro: new Date().toISOString().split('T')[0]
      });
      fetchEquipos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar');
    }
  };

  const handleEdit = (equipo) => {
    setEditingEquipo(equipo);
    setFormData({
      codigo_inventario: equipo.codigo_inventario,
      nombre_equipo: equipo.nombre_equipo,
      categoria: equipo.categoria,
      descripcion: equipo.descripcion || '',
      ubicacion: equipo.ubicacion || '',
      estado: equipo.estado,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este equipo?')) return;
    try {
      await prestamosService.deleteEquipo(id);
      toast.success('Equipo eliminado');
      fetchEquipos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar');
    }
  };

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'disponible': return <Badge variant="success">Disponible</Badge>;
      case 'prestado': return <Badge variant="warning">Prestado</Badge>;
      case 'mantenimiento': return <Badge variant="danger">Mantenimiento</Badge>;
      default: return <Badge>{estado}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Catálogo de Equipos</h1>
          <p className="text-gray-500">Gestión de activos institucionales para préstamo</p>
        </div>
        <Button onClick={() => { setEditingEquipo(null); setIsModalOpen(true); }} icon={Plus}>
          Nuevo Equipo
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, código o categoría..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-unich-magenta"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Equipo</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Ubicación</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-unich-magenta" />
                    </td>
                  </tr>
                ) : equipos.length > 0 ? (
                  equipos.map((equipo) => (
                    <tr key={equipo.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-unich-magenta">{equipo.codigo_inventario}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{equipo.nombre_equipo}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">{equipo.descripcion}</div>
                      </td>
                      <td className="px-4 py-3">{equipo.categoria}</td>
                      <td className="px-4 py-3">{getStatusBadge(equipo.estado)}</td>
                      <td className="px-4 py-3 text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {equipo.ubicacion || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button onClick={() => handleEdit(equipo)} className="text-blue-600 hover:text-blue-800">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(equipo.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">No hay equipos registrados</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">{editingEquipo ? 'Editar Equipo' : 'Nuevo Equipo'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Código de Inventario</label>
                  <input
                    required
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    value={formData.codigo_inventario}
                    onChange={(e) => setFormData({...formData, codigo_inventario: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre del Equipo</label>
                  <input
                    required
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    value={formData.nombre_equipo}
                    onChange={(e) => setFormData({...formData, nombre_equipo: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Categoría</label>
                    <input
                      required
                      type="text"
                      className="w-full p-2 border rounded-lg"
                      value={formData.categoria}
                      onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Estado</label>
                    <select
                      className="w-full p-2 border rounded-lg"
                      value={formData.estado || 'disponible'}
                      onChange={(e) => setFormData({...formData, estado: e.target.value})}
                    >
                      <option value="disponible">Disponible</option>
                      <option value="prestado">Prestado</option>
                      <option value="mantenimiento">Mantenimiento</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ubicación</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    value={formData.ubicacion}
                    onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <textarea
                    className="w-full p-2 border rounded-lg"
                    rows="2"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  />
                </div>
                {!editingEquipo && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Fecha de Registro</label>
                    <input
                      required
                      type="date"
                      className="w-full p-2 border rounded-lg"
                      value={formData.fecha_registro}
                      onChange={(e) => setFormData({...formData, fecha_registro: e.target.value})}
                    />
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="flex-1">Guardar</Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => { setIsModalOpen(false); setEditingEquipo(null); }}
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

export default EquiposPrestamo;
