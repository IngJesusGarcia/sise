import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Plus, Search, CheckCircle, XCircle, Lock, Clock } from 'lucide-react';
import periodosService from '../../services/periodosService';
import { Card } from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import { Select } from '../../components/ui/Form';

const PeriodosList = () => {
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchPeriodos(); }, [filtroTipo]);

  const fetchPeriodos = async () => {
    try {
      setLoading(true);
      const data = await periodosService.getAll({ tipo: filtroTipo || undefined });
      setPeriodos(Array.isArray(data) ? data : data.data ?? []);
    } catch { } finally { setLoading(false); }
  };

  const handleActivar = async (periodo) => {
    if (!window.confirm(`¿Activar el periodo "${periodo.nombre}"? El periodo activo anterior se desactivará.`)) return;
    try {
      await periodosService.activar(periodo.id);
      fetchPeriodos();
    } catch (e) { alert(e.response?.data?.message ?? 'Error al activar.'); }
  };

  const handleCerrar = async (periodo) => {
    if (!window.confirm(`¿Cerrar el periodo "${periodo.nombre}"?`)) return;
    try {
      await periodosService.cerrar(periodo.id);
      fetchPeriodos();
    } catch (e) { alert(e.response?.data?.message ?? 'Error al cerrar periodo.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este periodo? Esta acción no se puede deshacer.')) return;
    try {
      await periodosService.destroy(id);
      fetchPeriodos();
    } catch (e) { alert('No se pudo eliminar. Es posible que tenga datos asociados.'); }
  };

  const filtered = periodos.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Periodo',
      cell: row => (
        <div className="flex items-center gap-3">
          {row.activo
            ? <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow shadow-emerald-300 animate-pulse inline-block" />
            : <span className="w-2.5 h-2.5 rounded-full bg-gray-300 inline-block" />}
          <span className="font-bold text-unich-purple">{row.nombre}</span>
        </div>
      )
    },
    {
      header: 'Tipo', cell: row => (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-blue-100 text-blue-800">
          {row.tipo}
        </span>
      )
    },
    { header: 'Inicio', cell: row => <span className="text-sm font-mono text-gray-600">{row.fecha_inicio}</span> },
    { header: 'Fin', cell: row => <span className="text-sm font-mono text-gray-600">{row.fecha_fin}</span> },
    {
      header: 'Inscripciones',
      cell: row => row.fecha_inicio_inscripciones
        ? <span className="text-xs text-gray-500">{row.fecha_inicio_inscripciones} → {row.fecha_fin_inscripciones}</span>
        : <span className="text-xs text-gray-300">—</span>
    },
    {
      header: 'Estatus',
      cell: row => row.activo
        ? <span className="flex items-center gap-1 text-xs font-bold text-emerald-700"><CheckCircle size={14} /> Activo</span>
        : <span className="flex items-center gap-1 text-xs text-gray-400"><Clock size={14} /> Inactivo</span>
    },
    {
      header: 'Acciones',
      cell: row => (
        <div className="flex gap-1 justify-end">
          {!row.activo && (
            <button onClick={() => handleActivar(row)}
              className="px-2.5 py-1 text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg font-bold transition-colors">
              Activar
            </button>
          )}
          {row.activo && (
            <button onClick={() => handleCerrar(row)}
              className="px-2.5 py-1 text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg font-bold transition-colors flex items-center gap-1">
              <Lock size={12} /> Cerrar
            </button>
          )}
          <button onClick={() => navigate(`/periodos/editar/${row.id}`)}
            className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
            Editar
          </button>
          {!row.activo && (
            <button onClick={() => handleDelete(row.id)}
              className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <XCircle size={16} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><CalendarDays size={24} /></div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Periodos Escolares</h1>
          </div>
          <p className="text-gray-500">Gestión de periodos académicos. Solo puede haber un periodo activo a la vez.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => navigate('/periodos/nuevo')}>
          Nuevo Periodo
        </Button>
      </div>

      {/* Active period banner */}
      {periodos.find(p => p.activo) && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3">
          <CheckCircle size={18} className="text-emerald-600 shrink-0" />
          <span className="text-sm font-semibold text-emerald-800">
            Periodo activo actual: <span className="text-base font-black">{periodos.find(p => p.activo)?.nombre}</span>
          </span>
        </div>
      )}

      <Card>
        <div className="p-4 flex flex-wrap gap-3 border-b border-gray-100 bg-gray-50/60">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
            <Search size={16} className="text-gray-400" />
            <input className="flex-1 outline-none text-sm bg-transparent placeholder-gray-400"
              placeholder="Buscar periodo..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <Select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className="text-sm min-w-[160px]">
            <option value="">Todos los tipos</option>
            <option value="semestral">Semestral</option>
            <option value="cuatrimestral">Cuatrimestral</option>
            <option value="anual">Anual</option>
          </Select>
        </div>
        {loading ? (
          <div className="h-52 flex items-center justify-center">
            <div className="animate-spin rounded-full h-9 w-9 border-4 border-unich-purple border-t-transparent" />
          </div>
        ) : <Table columns={columns} data={filtered} />}
      </Card>
    </div>
  );
};

export default PeriodosList;
