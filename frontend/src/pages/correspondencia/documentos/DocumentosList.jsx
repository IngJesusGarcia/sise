import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, Search, Eye, Inbox, Send, Activity, Archive, CheckCircle, XCircle } from 'lucide-react';
import { correspondenciaService } from '../../../services/correspondenciaService';
import { Card } from '../../../components/ui/Card';
import Table from '../../../components/ui/Table';
import { useNavigate } from 'react-router-dom';

const ESTATUS_CFG = {
  registrado:  { cls: 'bg-gray-100 text-gray-700',       icon: Activity,    label: 'Registrado' },
  en_proceso:  { cls: 'bg-amber-100 text-amber-800',     icon: Activity,    label: 'En Proceso' },
  aprobado:    { cls: 'bg-emerald-100 text-emerald-800', icon: CheckCircle, label: 'Aprobado' },
  rechazado:   { cls: 'bg-red-100 text-red-700',         icon: XCircle,     label: 'Rechazado' },
  archivado:   { cls: 'bg-blue-100 text-blue-800',       icon: Archive,     label: 'Archivado' },
};

const DocumentosList = ({ mode = 'todos' }) => {
  // mode can be: 'todos', 'entrada', 'salida'
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buscar, setBuscar] = useState('');
  const [filtroEstatus, setFiltroEstatus] = useState('');
  const [meta, setMeta] = useState({ total: 0, last_page: 1, current_page: 1 });

  const fetchItems = useCallback(async (page = 1) => {
    setLoading(true);
    const params = { page, per_page: 20, buscar: buscar || undefined, estatus: filtroEstatus || undefined };
    if (mode === 'entrada') params.entrada = 1;
    if (mode === 'salida') params.salida = 1;

    try {
      const { data, total, last_page, current_page } = await correspondenciaService.getDocumentos(params);
      setItems(data ?? []);
      setMeta({ total: total ?? 0, last_page: last_page ?? 1, current_page: current_page ?? 1 });
    } finally {
      setLoading(false);
    }
  }, [buscar, filtroEstatus, mode]);

  useEffect(() => {
    const t = setTimeout(() => fetchItems(), 300);
    return () => clearTimeout(t);
  }, [fetchItems]);

  const ModeIcon = mode === 'entrada' ? Inbox : mode === 'salida' ? Send : FileText;
  const title = mode === 'entrada' ? 'Bandeja de Entrada' : mode === 'salida' ? 'Bandeja de Salida' : 'Oficios y Correspondencia';

  const columns = [
    { header: 'Folio / Fecha', cell: r => (
      <div>
        <p className="font-mono font-black text-indigo-700 text-sm">{r.folio}</p>
        <p className="text-xs text-gray-400 font-mono">{r.fecha}</p>
      </div>
    )},
    { header: 'Tipo', cell: r => <span className="text-xs font-bold text-gray-500 uppercase">{r.tipo?.nombre ?? '—'}</span> },
    { header: 'Asunto', cell: r => (
      <div>
        <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">{r.asunto}</p>
        <p className="text-xs text-gray-500 truncate max-w-[200px]">{r.descripcion}</p>
      </div>
    )},
    { header: 'Origen → Destino', cell: r => (
      <div className="text-xs">
        <p className="text-gray-500">De: <span className="font-semibold text-gray-800">{r.area_origen}</span></p>
        <p className="text-gray-500">Para: <span className="font-semibold text-gray-800">{r.area_destino}</span></p>
      </div>
    )},
    {
      header: 'Estatus',
      cell: r => {
        const cfg = ESTATUS_CFG[r.estatus] ?? ESTATUS_CFG.registrado;
        const Icon = cfg.icon;
        return <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold w-fit ${cfg.cls}`}><Icon size={12} />{cfg.label}</span>;
      }
    },
    {
      header: 'Acciones',
      cell: r => (
        <button onClick={() => nav(`/correspondencia/documentos/${r.id}`)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
          <Eye size={18} />
        </button>
      )
    }
  ];

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl"><ModeIcon size={24} /></div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500">{meta.total} documentos encontrados</p>
          </div>
        </div>
        <button onClick={() => nav('/correspondencia/documentos/nuevo')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition">
          <Plus size={18} /> Nuevo Oficio
        </button>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
            <Search size={16} className="text-gray-400" />
            <input className="flex-1 outline-none text-sm bg-transparent placeholder-gray-400" placeholder="Buscar por folio, asunto o áreas..." value={buscar} onChange={e => setBuscar(e.target.value)} />
          </div>
          {Object.entries(ESTATUS_CFG).map(([k, v]) => (
            <button key={k} onClick={() => setFiltroEstatus(filtroEstatus === k ? '' : k)}
              className={`px-3 py-1.5 flex items-center gap-1.5 rounded-lg text-xs font-bold transition-colors border ${filtroEstatus === k ? v.cls : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              <v.icon size={14} /> {v.label}
            </button>
          ))}
        </div>

        {loading ? <div className="h-64 flex items-center justify-center"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>
          : <Table columns={columns} data={items} />}

        {meta.last_page > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-center gap-2 bg-gray-50/30">
            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => fetchItems(p)} className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${meta.current_page === p ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-600'}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default DocumentosList;
