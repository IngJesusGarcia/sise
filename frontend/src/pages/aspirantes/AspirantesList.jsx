import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Plus, Search, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import aspirantesService from '../../services/aspirantesService';
import { Card } from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import { Select } from '../../components/ui/Form';

const ESTATUS_CFG = {
  registrado: { cls: 'bg-blue-100 text-blue-800',    icon: Clock,         label: 'Registrado' },
  admitido:   { cls: 'bg-emerald-100 text-emerald-800', icon: CheckCircle, label: 'Admitido'  },
  rechazado:  { cls: 'bg-red-100 text-red-800',       icon: XCircle,       label: 'Rechazado' },
  convertido: { cls: 'bg-purple-100 text-purple-800', icon: CheckCircle,   label: 'Convertido a Alumno' },
};

const AspirantesList = () => {
  const [aspirantes, setAspirantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstatus, setFiltroEstatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAspirantes();
  }, [filtroEstatus]);

  const fetchAspirantes = async () => {
    try {
      setLoading(true);
      const data = await aspirantesService.getAll({ estatus: filtroEstatus || undefined });
      // Handle paginated or plain array
      setAspirantes(data.data ?? data);
    } catch (e) {
      console.error(e);
      alert('Error al cargar aspirantes.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar lo registro del aspirante?')) return;
    try {
      await aspirantesService.destroy(id);
      fetchAspirantes();
    } catch (e) {
      alert('No se pudo eliminar el registro.');
    }
  };

  const handleChangeEstatus = async (aspirante, nuevoEstatus) => {
    try {
      await aspirantesService.update(aspirante.id, { estatus: nuevoEstatus });
      fetchAspirantes();
    } catch (e) {
      alert('Error al actualizar estatus.');
    }
  };

  const filtered = aspirantes.filter(a => {
    const s = `${a.folio} ${a.nombre} ${a.apellido_paterno} ${a.curp}`.toLowerCase();
    return s.includes(searchTerm.toLowerCase());
  });

  const columns = [
    {
      header: 'Folio',
      cell: row => <span className="font-mono font-bold text-xs text-unich-purple">{row.folio}</span>
    },
    {
      header: 'Nombre Completo',
      cell: row => (
        <div>
          <p className="font-semibold text-sm text-gray-800">{row.nombre} {row.apellido_paterno} {row.apellido_materno}</p>
          <p className="text-xs text-gray-500 font-mono">{row.curp ?? '—'}</p>
        </div>
      )
    },
    { header: 'Correo', cell: row => <span className="text-sm text-gray-600">{row.correo ?? '—'}</span> },
    { header: 'Licenciatura Deseada', cell: row => <span className="text-sm text-gray-700">{row.licenciatura?.nombre ?? '—'}</span> },
    {
      header: 'Estatus',
      cell: row => {
        const cfg = ESTATUS_CFG[row.estatus] ?? { cls: 'bg-gray-100 text-gray-600', label: row.estatus };
        return <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${cfg.cls}`}>{cfg.label}</span>;
      }
    },
    {
      header: 'Acciones',
      cell: row => (
        <div className="flex gap-1 items-center justify-end">
          {row.estatus === 'registrado' && (
            <>
              <button onClick={() => handleChangeEstatus(row, 'admitido')}
                className="px-2 py-1 text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg font-semibold transition-colors">
                Admitir
              </button>
              <button onClick={() => handleChangeEstatus(row, 'rechazado')}
                className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-semibold transition-colors">
                Rechazar
              </button>
            </>
          )}
          {row.estatus === 'admitido' && (
            <button onClick={() => navigate(`/aspirantes/${row.id}/convertir`)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs bg-unich-purple hover:bg-unich-purple/90 text-white rounded-lg font-bold transition-colors">
              <ArrowRight size={13} /> Matricular
            </button>
          )}
          <button onClick={() => navigate(`/aspirantes/editar/${row.id}`)}
            className="p-2 text-gray-400 hover:text-unich-purple hover:bg-unich-purple/10 rounded-lg transition-colors text-xs">
            Editar
          </button>
          {row.estatus !== 'convertido' && (
            <button onClick={() => handleDelete(row.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><UserPlus size={24} /></div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Módulo de Admisión</h1>
          </div>
          <p className="text-gray-500">Registro y seguimiento de aspirantes hasta su conversión a alumnos activos.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => navigate('/aspirantes/nuevo')}>
          Registrar Aspirante
        </Button>
      </div>

      <Card>
        <div className="p-4 flex flex-wrap gap-3 border-b border-gray-100 bg-gray-50/60">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
            <Search size={16} className="text-gray-400" />
            <input
              className="flex-1 outline-none text-sm bg-transparent placeholder-gray-400"
              placeholder="Buscar por folio, nombre o CURP..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filtroEstatus} onChange={e => setFiltroEstatus(e.target.value)} className="flex-1 min-w-[160px] text-sm">
            <option value="">Todos los estatus</option>
            <option value="registrado">Registrado (Pendiente)</option>
            <option value="admitido">Admitidos</option>
            <option value="rechazado">Rechazados</option>
            <option value="convertido">Convertidos a Alumno</option>
          </Select>
        </div>
        {loading ? (
          <div className="h-52 flex items-center justify-center">
            <div className="animate-spin rounded-full h-9 w-9 border-4 border-unich-purple border-t-transparent" />
          </div>
        ) : (
          <Table columns={columns} data={filtered} />
        )}
      </Card>
    </div>
  );
};

export default AspirantesList;
