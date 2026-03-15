import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookCopy, Plus, Search, CheckCircle2, XCircle, Grid3x3 } from 'lucide-react';
import planesEstudioService from '../../services/planesEstudioService';
import { Card } from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import { Select } from '../../components/ui/Form';

const PlanesEstudioList = () => {
  const [planes, setPlanes] = useState([]);
  const [licenciaturas, setLicenciaturas] = useState([]);
  const [filtroLic, setFiltroLic] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    planesEstudioService.getLicenciaturas().then(d => setLicenciaturas(d.data ?? d));
  }, []);

  useEffect(() => { fetchPlanes(); }, [filtroLic]);

  const fetchPlanes = async () => {
    try {
      setLoading(true);
      const data = await planesEstudioService.getAll({ licenciatura_id: filtroLic || undefined });
      setPlanes(Array.isArray(data) ? data : data.data ?? []);
    } catch { } finally { setLoading(false); }
  };

  const handleToggleVigente = async (plan) => {
    try {
      await planesEstudioService.update(plan.id, { vigente: !plan.vigente });
      fetchPlanes();
    } catch (e) { alert('Error al actualizar el plan.'); }
  };

  const filtered = planes.filter(p =>
    `${p.clave} ${p.licenciatura?.nombre} ${p.anio_inicio}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Clave',
      cell: row => <span className="font-mono font-bold text-sm text-unich-purple">{row.clave}</span>
    },
    {
      header: 'Licenciatura',
      cell: row => <span className="text-sm font-semibold text-gray-800">{row.licenciatura?.nombre}</span>
    },
    {
      header: 'Año', cell: row => <span className="text-sm font-mono text-gray-600">{row.anio_inicio}</span>
    },
    {
      header: 'Materias',
      cell: row => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
          {row.total_materias ?? '—'} materias
        </span>
      )
    },
    {
      header: 'Vigente',
      cell: row => row.vigente
        ? <CheckCircle2 size={18} className="text-emerald-500" />
        : <XCircle size={18} className="text-gray-300" />
    },
    {
      header: 'Acciones',
      cell: row => (
        <div className="flex items-center gap-1 justify-end">
          <button onClick={() => navigate(`/planes-estudio/${row.id}/malla`)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-unich-purple/10 hover:bg-unich-purple/20 text-unich-purple rounded-lg font-bold transition-colors">
            <Grid3x3 size={13} /> Malla
          </button>
          <button onClick={() => navigate(`/planes-estudio/editar/${row.id}`)}
            className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
            Editar
          </button>
          <button onClick={() => handleToggleVigente(row)}
            className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-colors ${row.vigente ? 'bg-red-50 hover:bg-red-100 text-red-600' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'}`}>
            {row.vigente ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-violet-100 text-violet-600 rounded-lg"><BookCopy size={24} /></div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Planes de Estudio</h1>
          </div>
          <p className="text-gray-500">Configura la malla curricular por licenciatura. Define materias y semestres.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => navigate('/planes-estudio/nuevo')}>
          Nuevo Plan
        </Button>
      </div>

      <Card>
        <div className="p-4 flex flex-wrap gap-3 border-b border-gray-100 bg-gray-50/60">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
            <Search size={16} className="text-gray-400" />
            <input className="flex-1 outline-none text-sm bg-transparent placeholder-gray-400"
              placeholder="Buscar por clave o licenciatura..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <Select value={filtroLic} onChange={e => setFiltroLic(e.target.value)} className="text-sm min-w-[200px]">
            <option value="">Todas las licenciaturas</option>
            {licenciaturas.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
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

export default PlanesEstudioList;
