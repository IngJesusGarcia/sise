import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightLeft, Plus, Search } from 'lucide-react';
import movimientosService from '../../services/movimientosService';
import { Card } from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';

const TIPO_COLORS = {
  cambio_licenciatura: 'bg-purple-100 text-purple-800',
  cambio_grupo:        'bg-blue-100 text-blue-800',
  cambio_turno:        'bg-amber-100 text-amber-800',
  cambio_sede:         'bg-teal-100 text-teal-800',
};

const MovimientosList = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    movimientosService.getAll()
      .then(d => setMovimientos(Array.isArray(d) ? d : d.data ?? []))
      .catch(() => setMovimientos([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = movimientos.filter(m => {
    const s = `${m.tipo_movimiento} ${m.alumno?.nombre} ${m.alumno?.matricula}`.toLowerCase();
    return s.includes(searchTerm.toLowerCase());
  });

  const columns = [
    {
      header: 'Tipo de Movimiento',
      cell: row => (
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${TIPO_COLORS[row.tipo_movimiento] ?? 'bg-gray-100 text-gray-600'}`}>
          {String(row.tipo_movimiento).replace('_', ' ')}
        </span>
      )
    },
    {
      header: 'Estudiante',
      cell: row => (
        <div>
          <p className="font-semibold text-sm text-gray-800">{row.alumno?.nombre} {row.alumno?.apellido_paterno}</p>
          <p className="text-xs font-mono text-gray-500">{row.alumno?.matricula}</p>
        </div>
      )
    },
    { header: 'Valor Anterior', cell: row => <span className="text-sm text-red-500 line-through">{row.valor_anterior}</span> },
    { header: 'Valor Nuevo', cell: row => <span className="text-sm text-emerald-700 font-semibold">{row.valor_nuevo}</span> },
    { header: 'Motivo', cell: row => <span className="text-sm text-gray-600 max-w-xs block truncate" title={row.motivo}>{row.motivo ?? '—'}</span> },
    { header: 'Fecha', cell: row => <span className="text-sm font-mono text-gray-600">{row.fecha_movimiento}</span> },
  ];

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><ArrowRightLeft size={24} /></div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Movimientos Académicos</h1>
          </div>
          <p className="text-gray-500">Historial de cambios de licenciatura, grupo, turno y sede de alumnos.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => navigate('/movimientos-academicos/nuevo')}>
          Registrar Movimiento
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 bg-gray-50/60 flex gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1">
            <Search size={16} className="text-gray-400" />
            <input className="flex-1 outline-none text-sm bg-transparent placeholder-gray-400"
              placeholder="Buscar por alumno o tipo de movimiento..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>
        {loading ? (
          <div className="h-52 flex items-center justify-center">
            <div className="animate-spin rounded-full h-9 w-9 border-4 border-unich-purple border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="h-52 flex flex-col items-center justify-center text-gray-400 gap-3">
            <ArrowRightLeft size={36} className="opacity-30" />
            <p className="font-medium">Sin movimientos académicos registrados</p>
          </div>
        ) : (
          <Table columns={columns} data={filtered} />
        )}
      </Card>
    </div>
  );
};

export default MovimientosList;
