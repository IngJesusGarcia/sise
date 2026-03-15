import React, { useState, useEffect, useCallback } from 'react';
import { ArrowUpCircle, ArrowDownCircle, RefreshCw, SlidersHorizontal, Search } from 'lucide-react';
import { inventarioService } from '../../../services/inventarioService';
import { Card } from '../../../components/ui/Card';
import Table from '../../../components/ui/Table';

const fmt = (n) => Number(n ?? 0).toLocaleString('es-MX');

const TIPO_CFG = {
  entrada:       { cls: 'bg-emerald-100 text-emerald-800', icon: ArrowUpCircle,   label: 'Entrada' },
  salida:        { cls: 'bg-red-100 text-red-700',         icon: ArrowDownCircle, label: 'Salida' },
  transferencia: { cls: 'bg-blue-100 text-blue-800',       icon: RefreshCw,       label: 'Transferencia' },
  ajuste:        { cls: 'bg-gray-100 text-gray-600',       icon: SlidersHorizontal, label: 'Ajuste' },
};

const MovimientosAlmacen = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [buscar, setBuscar] = useState('');
  const [meta, setMeta] = useState({ total: 0, last_page: 1, current_page: 1 });

  const fetchItems = useCallback(async (page = 1) => {
    setLoading(true);
    const data = await inventarioService.getMovimientos({ tipo: filtroTipo || undefined, page, per_page: 25 });
    setItems(data.data ?? data);
    setMeta({ total: data.total ?? 0, last_page: data.last_page ?? 1, current_page: data.current_page ?? 1 });
    setLoading(false);
  }, [filtroTipo]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filtered = buscar
    ? items.filter(m => m.material?.nombre?.toLowerCase().includes(buscar.toLowerCase()) || m.referencia?.toLowerCase().includes(buscar.toLowerCase()))
    : items;

  const columns = [
    {
      header: 'Tipo',
      cell: r => {
        const cfg = TIPO_CFG[r.tipo] ?? TIPO_CFG.ajuste;
        const Icon = cfg.icon;
        return <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold w-fit ${cfg.cls}`}><Icon size={12} />{cfg.label}</span>;
      }
    },
    { header: 'Material', cell: r => (
      <div>
        <p className="font-semibold text-sm text-gray-900">{r.material?.nombre ?? '—'}</p>
        <p className="text-xs font-mono text-gray-400">{r.material?.codigo}</p>
      </div>
    )},
    { header: 'Almacén', cell: r => <span className="text-sm text-gray-600">{r.almacen?.nombre ?? '—'}</span> },
    {
      header: 'Cantidad',
      cell: r => (
        <div className="text-right">
          <span className={`font-black text-lg font-mono ${r.tipo === 'salida' ? 'text-red-600' : 'text-emerald-700'}`}>
            {r.tipo === 'salida' ? '-' : '+'}{fmt(r.cantidad)}
          </span>
        </div>
      )
    },
    {
      header: 'Stock Anterior → Nuevo',
      cell: r => (
        <span className="text-xs font-mono text-gray-400">
          {r.cantidad_anterior ?? '—'} → <strong className="text-gray-700">{r.cantidad_nueva ?? '—'}</strong>
        </span>
      )
    },
    { header: 'Referencia', cell: r => <span className="font-mono text-xs text-unich-purple">{r.referencia ?? '—'}</span> },
    { header: 'Motivo', cell: r => <span className="text-xs text-gray-500 max-w-[180px] truncate block">{r.motivo ?? '—'}</span> },
    { header: 'Registrado por', cell: r => <span className="text-xs text-gray-400">{r.registrador?.name ?? 'Sistema'}</span> },
    { header: 'Fecha', cell: r => <span className="text-xs font-mono text-gray-400">{r.created_at?.split('T')[0]}</span> },
  ];

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-teal-100 text-teal-600 rounded-lg"><RefreshCw size={24} /></div>
        <h1 className="text-3xl font-extrabold text-gray-900">Movimientos de Almacén</h1>
        <span className="text-gray-400 text-sm font-medium">{meta.total} registros</span>
      </div>
      <Card>
        <div className="p-4 border-b border-gray-100 bg-gray-50/60 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[180px]">
            <Search size={15} className="text-gray-400" />
            <input className="flex-1 outline-none text-sm bg-transparent placeholder-gray-400" placeholder="Buscar material o referencia..." value={buscar} onChange={e => setBuscar(e.target.value)} />
          </div>
          {['', 'entrada', 'salida', 'ajuste', 'transferencia'].map(t => (
            <button key={t} onClick={() => setFiltroTipo(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${filtroTipo === t ? 'bg-unich-purple text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {t || 'Todos'}
            </button>
          ))}
        </div>
        {loading ? <div className="h-48 flex items-center justify-center"><div className="animate-spin rounded-full h-9 w-9 border-4 border-unich-purple border-t-transparent" /></div>
          : <Table columns={columns} data={filtered} />}
        {meta.last_page > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-center gap-2">
            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => fetchItems(p)} className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${meta.current_page === p ? 'bg-unich-purple text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>{p}</button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
export default MovimientosAlmacen;
