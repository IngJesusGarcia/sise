import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Plus, Search, Globe } from 'lucide-react';
import movilidadService from '../../services/movilidadService';
import { Card } from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';

const ESTATUS_CFG = {
  activo:     'bg-emerald-100 text-emerald-800',
  completado: 'bg-blue-100 text-blue-800',
  cancelado:  'bg-red-100 text-red-800',
};

const MovilidadList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    movilidadService.getAll()
      .then(d => setItems(Array.isArray(d) ? d : d.data ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(m => {
    const s = `${m.universidad_origen} ${m.programa_origen} ${m.nombre_visitante} ${m.alumno?.nombre}`.toLowerCase();
    return s.includes(searchTerm.toLowerCase());
  });

  const columns = [
    {
      header: 'Estudiante / Visitante',
      cell: row => (
        <div>
          <p className="font-semibold text-sm text-gray-800">
            {row.alumno ? `${row.alumno.nombre} ${row.alumno.apellido_paterno}` : row.nombre_visitante ?? 'Visitante'}
          </p>
          {row.alumno && <p className="text-xs font-mono text-gray-500">{row.alumno.matricula}</p>}
        </div>
      )
    },
    {
      header: 'Universidad de Origen',
      cell: row => (
        <div className="flex items-center gap-2">
          <Globe size={14} className="text-gray-400 shrink-0" />
          <span className="text-sm text-gray-700 font-medium">{row.universidad_origen}</span>
        </div>
      )
    },
    { header: 'Programa', cell: row => <span className="text-sm text-gray-600">{row.programa_origen}</span> },
    { header: 'Periodo', cell: row => <span className="text-sm font-mono font-bold text-unich-purple">{row.periodo_movilidad}</span> },
    {
      header: 'Materias Equivalentes',
      cell: row => (
        <span className="text-xs text-gray-500 max-w-[160px] block truncate" title={row.materias_equivalentes}>
          {row.materias_equivalentes || '—'}
        </span>
      )
    },
    {
      header: 'Estatus',
      cell: row => (
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${ESTATUS_CFG[row.estatus] ?? 'bg-gray-100 text-gray-600'}`}>
          {row.estatus}
        </span>
      )
    }
  ];

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-teal-100 text-teal-600 rounded-lg"><Plane size={24} /></div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Movilidad Estudiantil</h1>
          </div>
          <p className="text-gray-500">Estudiantes visitantes de otras instituciones con materias equivalentes validadas.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => navigate('/movilidad/nuevo')}>
          Registrar Movilidad
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 bg-gray-50/60 flex gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1">
            <Search size={16} className="text-gray-400" />
            <input className="flex-1 outline-none text-sm bg-transparent placeholder-gray-400"
              placeholder="Buscar por institución, programa o estudiante..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>
        {loading ? (
          <div className="h-52 flex items-center justify-center">
            <div className="animate-spin rounded-full h-9 w-9 border-4 border-unich-purple border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="h-52 flex flex-col items-center justify-center text-gray-400 gap-3">
            <Plane size={36} className="opacity-30" />
            <p className="font-medium">Sin registros de movilidad estudiantil</p>
          </div>
        ) : (
          <Table columns={columns} data={filtered} />
        )}
      </Card>
    </div>
  );
};

export default MovilidadList;
