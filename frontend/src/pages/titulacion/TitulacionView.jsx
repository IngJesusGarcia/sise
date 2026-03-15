import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookMarked, Plus, CheckCircle2, Clock, XCircle, ChevronRight } from 'lucide-react';
import titulacionService from '../../services/titulacionService';
import { Card } from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';

const RESULTADO_CFG = {
  aprobado:        { badge: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2, color: 'text-emerald-600' },
  reprobado:       { badge: 'bg-red-100 text-red-800',         icon: XCircle,       color: 'text-red-600'     },
  'Mención Honorífica': { badge: 'bg-purple-100 text-purple-800', icon: CheckCircle2, color: 'text-purple-600' },
};

const TitulacionView = () => {
  const [actas, setActas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchActas();
  }, []);

  const fetchActas = async () => {
    try {
      setLoading(true);
      const data = await titulacionService.getAll();
      setActas(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = actas.filter(a => {
    const s = `${a.alumno?.matricula} ${a.alumno?.nombre} ${a.alumno?.apellido_paterno} ${a.numero_acta}`.toLowerCase();
    return s.includes(searchTerm.toLowerCase());
  });

  const columns = [
    {
      header: 'No. Acta',
      cell: row => <span className="font-mono font-bold text-sm text-unich-purple">{row.numero_acta}</span>
    },
    {
      header: 'Sustentante',
      cell: row => (
        <div>
          <p className="font-semibold text-sm text-gray-800">{row.alumno?.nombre} {row.alumno?.apellido_paterno}</p>
          <p className="text-xs font-mono text-gray-500">{row.alumno?.matricula}</p>
        </div>
      )
    },
    { header: 'Modalidad', cell: row => <span className="text-sm text-gray-600">{row.modalidad?.nombre}</span> },
    {
      header: 'Trabajo / Tema',
      cell: row => <span className="text-sm text-gray-600 max-w-xs block truncate" title={row.titulo_trabajo}>{row.titulo_trabajo ?? '—'}</span>
    },
    { header: 'Fecha Examen', cell: row => <span className="text-sm font-mono text-gray-600">{row.fecha_examen}</span> },
    {
      header: 'Resultado',
      cell: row => {
        const cfg = RESULTADO_CFG[row.resultado] ?? { badge: 'bg-gray-100 text-gray-700' };
        return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${cfg.badge}`}>{row.resultado}</span>;
      }
    },
    {
      header: '',
      cell: row => (
        <button className="p-2 text-gray-400 hover:text-unich-purple hover:bg-unich-purple/10 rounded-lg transition-colors">
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
            <div className="p-2 bg-unich-purple/10 text-unich-purple rounded-lg"><BookMarked size={24} /></div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Proceso de Titulación</h1>
          </div>
          <p className="text-gray-500">Gestión de actas de examen profesional y registro de título académico.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => navigate('/titulacion/nuevo')}>
          Registrar Examen Prof.
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 bg-gray-50/60 flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1">
            <span className="text-gray-400 text-sm">🔍</span>
            <input
              className="flex-1 outline-none text-sm bg-transparent placeholder-gray-400"
              placeholder="Buscar por nombre, matrícula o número de acta..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
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

export default TitulacionView;
