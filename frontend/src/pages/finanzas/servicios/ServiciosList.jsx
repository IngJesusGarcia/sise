import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Plus, Pencil, Trash2, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { serviciosService } from '../../../services/finanzasService';
import { Card } from '../../../components/ui/Card';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';

const fmt = (n) => Number(n ?? 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

const ServiciosList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('');
  const [meta, setMeta] = useState({ total: 0, last_page: 1, current_page: 1 });
  const navigate = useNavigate();

  const fetchItems = useCallback(async (page = 1) => {
    setLoading(true);
    const data = await serviciosService.getAll({ buscar: search || undefined, activo: filtroActivo !== '' ? filtroActivo : undefined, page, per_page: 20 });
    setItems(data.data ?? data);
    setMeta({ total: data.total ?? 0, last_page: data.last_page ?? 1, current_page: data.current_page ?? 1 });
    setLoading(false);
  }, [search, filtroActivo]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleToggle = async (s) => {
    await serviciosService.update(s.id, { activo: !s.activo });
    fetchItems();
  };
  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este servicio?')) return;
    await serviciosService.destroy(id);
    fetchItems();
  };

  const columns = [
    { header: 'Clave', cell: r => <span className="font-mono text-xs font-bold text-unich-purple">{r.clave}</span> },
    { header: 'Nombre del Servicio', cell: r => (
      <div>
        <p className="font-semibold text-sm text-gray-900">{r.nombre}</p>
        {r.descripcion && <p className="text-xs text-gray-400 truncate max-w-xs">{r.descripcion}</p>}
      </div>
    )},
    { header: 'Costo', cell: r => <span className="font-mono font-bold text-emerald-700 text-sm">{fmt(r.costo)}</span> },
    {
      header: 'Activo',
      cell: r => (
        <button onClick={() => handleToggle(r)} className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${r.activo ? 'text-emerald-600' : 'text-gray-400'}`}>
          {r.activo ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
          {r.activo ? 'Activo' : 'Inactivo'}
        </button>
      )
    },
    {
      header: 'Acciones',
      cell: r => (
        <div className="flex gap-1 justify-end">
          <button onClick={() => navigate(`/finanzas/servicios/editar/${r.id}`)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={15} /></button>
          <button onClick={() => handleDelete(r.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
        </div>
      )
    },
  ];

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2"><div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><ShoppingBag size={24} /></div><h1 className="text-3xl font-extrabold text-gray-900">Catálogo de Servicios</h1></div>
          <p className="text-gray-500">{meta.total} servicios registrados</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => navigate('/finanzas/servicios/nuevo')}>Nuevo Servicio</Button>
      </div>
      <Card>
        <div className="p-4 flex flex-wrap gap-3 border-b border-gray-100 bg-gray-50/60">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
            <Search size={16} className="text-gray-400" />
            <input className="flex-1 outline-none text-sm bg-transparent placeholder-gray-400" placeholder="Buscar clave o nombre..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select value={filtroActivo} onChange={e => setFiltroActivo(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">Todos</option><option value="1">Solo activos</option><option value="0">Solo inactivos</option>
          </select>
        </div>
        {loading ? <div className="h-48 flex items-center justify-center"><div className="animate-spin rounded-full h-9 w-9 border-4 border-unich-purple border-t-transparent" /></div>
          : <Table columns={columns} data={items} />}
      </Card>
    </div>
  );
};
export default ServiciosList;
