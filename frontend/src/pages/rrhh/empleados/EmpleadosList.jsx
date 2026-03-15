import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Search, CheckCircle, XCircle, Eye, Pencil } from 'lucide-react';
import empleadosService from '../../../services/empleadosService';
import { Card } from '../../../components/ui/Card';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Form';

const ESTATUS_CFG = {
  activo:   { cls: 'bg-emerald-100 text-emerald-800', label: 'Activo' },
  baja:     { cls: 'bg-red-100 text-red-700',         label: 'Baja' },
  licencia: { cls: 'bg-amber-100 text-amber-700',     label: 'Licencia' },
  jubilado: { cls: 'bg-gray-100 text-gray-600',       label: 'Jubilado' },
};

const fmt = (n) => Number(n ?? 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

const EmpleadosList = () => {
  const [empleados, setEmpleados] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroDpto, setFiltroDpto] = useState('');
  const [filtroEstatus, setFiltroEstatus] = useState('');
  const [meta, setMeta] = useState({ total: 0, last_page: 1, current_page: 1 });
  const navigate = useNavigate();

  const fetchEmpleados = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const data = await empleadosService.getAll({
        buscar: searchTerm || undefined,
        departamento_id: filtroDpto || undefined,
        estatus: filtroEstatus || undefined,
        page,
        per_page: 15,
      });
      setEmpleados(data.data ?? data);
      setMeta({ total: data.total ?? 0, last_page: data.last_page ?? 1, current_page: data.current_page ?? 1 });
    } catch { } finally { setLoading(false); }
  }, [searchTerm, filtroDpto, filtroEstatus]);

  useEffect(() => { fetchEmpleados(); }, [fetchEmpleados]);
  useEffect(() => {
    empleadosService.getDepartamentos().then(d => setDepartamentos(d));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este empleado?')) return;
    await empleadosService.destroy(id);
    fetchEmpleados();
  };

  const columns = [
    {
      header: 'Empleado',
      cell: row => (
        <div>
          <p className="font-semibold text-sm text-gray-900">{row.nombre} {row.apellido_paterno} {row.apellido_materno}</p>
          <p className="text-xs text-gray-500 font-mono">{row.numero_empleado}</p>
        </div>
      )
    },
    { header: 'Departamento', cell: row => <span className="text-sm text-gray-700">{row.departamento?.nombre ?? '—'}</span> },
    { header: 'Puesto', cell: row => <span className="text-sm text-gray-600">{row.puesto?.nombre ?? '—'}</span> },
    { header: 'Contrato', cell: row => (
      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold uppercase bg-blue-100 text-blue-700">
        {row.tipo_contrato}
      </span>
    )},
    {
      header: 'Salario',
      cell: row => (
        <span className="text-sm font-mono font-semibold text-gray-800">
          {row.contrato_activo ? fmt(row.contrato_activo.salario) : '—'}
        </span>
      )
    },
    {
      header: 'Estatus',
      cell: row => {
        const cfg = ESTATUS_CFG[row.estatus] ?? { cls: 'bg-gray-100 text-gray-600', label: row.estatus };
        return <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${cfg.cls}`}>{cfg.label}</span>;
      }
    },
    {
      header: 'Acciones',
      cell: row => (
        <div className="flex gap-1 justify-end">
          <button onClick={() => navigate(`/rrhh/empleados/${row.id}`)}
            className="p-2 text-gray-400 hover:text-unich-purple hover:bg-unich-purple/10 rounded-lg transition-colors">
            <Eye size={16} />
          </button>
          <button onClick={() => navigate(`/rrhh/empleados/editar/${row.id}`)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Pencil size={16} />
          </button>
          <button onClick={() => handleDelete(row.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <XCircle size={16} />
          </button>
        </div>
      )
    },
  ];

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Users size={24} /></div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Empleados</h1>
          </div>
          <p className="text-gray-500">Padrón de empleados · {meta.total} registros</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => navigate('/rrhh/empleados/nuevo')}>
          Nuevo Empleado
        </Button>
      </div>

      <Card>
        <div className="p-4 flex flex-wrap gap-3 border-b border-gray-100 bg-gray-50/60">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
            <Search size={16} className="text-gray-400" />
            <input className="flex-1 outline-none text-sm bg-transparent placeholder-gray-400"
              placeholder="Buscar por nombre, número de empleado o RFC..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <Select value={filtroDpto} onChange={e => setFiltroDpto(e.target.value)} className="text-sm min-w-[180px]">
            <option value="">Todos los departamentos</option>
            {departamentos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
          </Select>
          <Select value={filtroEstatus} onChange={e => setFiltroEstatus(e.target.value)} className="text-sm min-w-[140px]">
            <option value="">Todos los estatus</option>
            <option value="activo">Activo</option>
            <option value="baja">Baja</option>
            <option value="licencia">Licencia</option>
            <option value="jubilado">Jubilado</option>
          </Select>
        </div>
        {loading ? (
          <div className="h-52 flex items-center justify-center">
            <div className="animate-spin rounded-full h-9 w-9 border-4 border-unich-purple border-t-transparent" />
          </div>
        ) : <Table columns={columns} data={empleados} />}
        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-center gap-3">
            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => fetchEmpleados(p)}
                className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                  meta.current_page === p ? 'bg-unich-purple text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}>{p}</button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default EmpleadosList;
