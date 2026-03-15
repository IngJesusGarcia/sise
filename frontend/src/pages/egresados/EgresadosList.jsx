import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Plus, Search, ChevronRight } from 'lucide-react';
import egresadosService from '../../services/egresadosService';
import { Card } from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import { Select } from '../../components/ui/Form';

const ESTATUS_COLOR = {
  sin_iniciar: 'bg-gray-100 text-gray-700',
  en_proceso:  'bg-amber-100 text-amber-800',
  titulado:    'bg-emerald-100 text-emerald-800',
};

const EgresadosList = () => {
  const [egresados, setEgresados] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [licenciaturas, setLicenciaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState({ periodo_id: '', licenciatura_id: '', estatus_titulacion: '' });
  const navigate = useNavigate();

  useEffect(() => {
    loadCatalogs();
  }, []);

  useEffect(() => {
    fetchEgresados();
  }, [filtros]);

  const loadCatalogs = async () => {
    const [p, l] = await Promise.all([egresadosService.getPeriodos(), egresadosService.getLicenciaturas()]);
    setPeriodos(p);
    setLicenciaturas(l.data ?? l);
  };

  const fetchEgresados = async () => {
    try {
      setLoading(true);
      const data = await egresadosService.getAll(filtros);
      setEgresados(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = egresados.filter(e => {
    const s = `${e.alumno?.matricula} ${e.alumno?.nombre} ${e.alumno?.apellido_paterno}`.toLowerCase();
    return s.includes(searchTerm.toLowerCase());
  });

  const columns = [
    {
      header: 'Alumno',
      cell: row => (
        <div>
          <p className="font-semibold text-gray-800 text-sm">{row.alumno?.nombre} {row.alumno?.apellido_paterno}</p>
          <p className="text-xs font-mono text-gray-500">{row.alumno?.matricula}</p>
        </div>
      )
    },
    { header: 'Licenciatura', cell: row => <span className="text-sm text-gray-600">{row.alumno?.licenciatura?.nombre}</span> },
    { header: 'Periodo de Egreso', cell: row => <span className="text-sm text-gray-600">{row.periodo?.nombre}</span> },
    { header: 'Fecha Egreso', cell: row => <span className="text-sm font-mono text-gray-600">{row.fecha_egreso}</span> },
    { header: 'Promedio', cell: row => <span className="font-bold text-unich-purple">{row.promedio_egreso ?? '—'}</span> },
    {
      header: 'Estatus Titulación',
      cell: row => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${ESTATUS_COLOR[row.estatus_titulacion] ?? 'bg-gray-100 text-gray-600'}`}>
          {String(row.estatus_titulacion).replace('_', ' ')}
        </span>
      )
    },
    {
      header: '',
      cell: row => (
        <button
          onClick={() => navigate(`/titulacion/seguimiento/${row.alumno_id}`)}
          className="p-2 text-gray-400 hover:text-unich-purple hover:bg-unich-purple/10 rounded-lg transition-colors"
          title="Ver Seguimiento de Titulación"
        >
          <ChevronRight size={18} />
        </button>
      )
    }
  ];

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><GraduationCap size={24} /></div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Padrón de Egresados</h1>
          </div>
          <p className="text-gray-500">Directorio de alumnos egresados y seguimiento de titulación.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => navigate('/egresados/nuevo')}>
          Registrar Egresado
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4 flex flex-wrap gap-3 border-b border-gray-100 bg-gray-50/60">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
            <Search size={16} className="text-gray-400" />
            <input
              className="flex-1 outline-none text-sm bg-transparent placeholder-gray-400"
              placeholder="Buscar matrícula o nombre..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filtros.periodo_id} onChange={e => setFiltros({...filtros, periodo_id: e.target.value})} className="flex-1 min-w-[160px] text-sm">
            <option value="">Todos los periodos</option>
            {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </Select>
          <Select value={filtros.estatus_titulacion} onChange={e => setFiltros({...filtros, estatus_titulacion: e.target.value})} className="flex-1 min-w-[160px] text-sm">
            <option value="">Todos los estatus</option>
            <option value="sin_iniciar">Sin iniciar</option>
            <option value="en_proceso">En proceso</option>
            <option value="titulado">Titulados</option>
          </Select>
        </div>
        {loading ? (
          <div className="h-56 flex items-center justify-center">
            <div className="animate-spin rounded-full h-9 w-9 border-4 border-unich-purple border-t-transparent" />
          </div>
        ) : (
          <Table columns={columns} data={filtered} />
        )}
      </Card>
    </div>
  );
};

export default EgresadosList;
