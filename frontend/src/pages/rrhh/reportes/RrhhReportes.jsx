import React, { useState, useEffect } from 'react';
import { BarChart2, Users, UserX, TrendingUp, FileDown } from 'lucide-react';
import empleadosService from '../../../services/empleadosService';
import rrhhService from '../../../services/rrhhService';
import { Card, CardContent } from '../../../components/ui/Card';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Form';

const fmt = (n) => Number(n ?? 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

const StatCard = ({ icon: Icon, label, value, bg, fg }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-6 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${bg}`}><Icon size={24} className={fg} /></div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-gray-900 mt-0.5">{value}</p>
      </div>
    </CardContent>
  </Card>
);

const RrhhReportes = () => {
  const [stats, setStats] = useState({ total: 0, activos: 0, baja: 0 });
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reporte, setReporte] = useState('activos');
  const [departamentos, setDepartamentos] = useState([]);
  const [filtroDpto, setFiltroDpto] = useState('');

  useEffect(() => {
    rrhhService.getStats().then(setStats);
    empleadosService.getDepartamentos().then(setDepartamentos);
  }, []);

  useEffect(() => {
    setLoading(true);
    const estatus = reporte === 'activos' ? 'activo' : reporte === 'inactivos' ? 'baja' : undefined;
    empleadosService.getAll({
      estatus,
      departamento_id: filtroDpto || undefined,
      per_page: 200
    }).then(d => { setEmpleados(d.data ?? d); setLoading(false); });
  }, [reporte, filtroDpto]);

  const columns = [
    { header: 'Núm. Empleado', cell: row => <span className="font-mono text-xs font-bold text-unich-purple">{row.numero_empleado}</span> },
    { header: 'Nombre', cell: row => <span className="text-sm font-semibold">{row.nombre} {row.apellido_paterno} {row.apellido_materno}</span> },
    { header: 'Departamento', cell: row => <span className="text-sm text-gray-600">{row.departamento?.nombre ?? '—'}</span> },
    { header: 'Puesto', cell: row => <span className="text-sm text-gray-600">{row.puesto?.nombre ?? '—'}</span> },
    { header: 'Contrato', cell: row => <span className="text-xs font-bold uppercase px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{row.tipo_contrato}</span> },
    { header: 'Ingreso', cell: row => <span className="text-sm font-mono text-gray-500">{row.fecha_ingreso}</span> },
    {
      header: 'Estatus',
      cell: row => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
          row.estatus === 'activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
        }`}>{row.estatus}</span>
      )
    },
  ];

  const handleExport = () => {
    const headers = ['Num.Empleado', 'Nombre', 'Dept.', 'Puesto', 'Contrato', 'Fecha Ingreso', 'Estatus'];
    const rows = empleados.map(e => [
      e.numero_empleado,
      `${e.nombre} ${e.apellido_paterno} ${e.apellido_materno ?? ''}`.trim(),
      e.departamento?.nombre ?? '',
      e.puesto?.nombre ?? '',
      e.tipo_contrato,
      e.fecha_ingreso ?? '',
      e.estatus,
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `reporte_${reporte}_empleados.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-violet-100 text-violet-600 rounded-lg"><BarChart2 size={24} /></div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Reportes de Personal</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard icon={Users}    label="Total Empleados" value={stats.total}   bg="bg-blue-100"    fg="text-blue-600" />
        <StatCard icon={TrendingUp} label="Empleados Activos" value={stats.activos} bg="bg-emerald-100" fg="text-emerald-600" />
        <StatCard icon={UserX}    label="Bajas"           value={stats.baja}    bg="bg-red-100"     fg="text-red-600" />
      </div>

      <Card>
        <div className="p-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/60">
          <div className="flex gap-2">
            {[
              { val: 'activos', label: 'Activos' },
              { val: 'inactivos', label: 'Baja / Inactivos' },
              { val: 'todos', label: 'Todos' },
            ].map(tab => (
              <button key={tab.val} onClick={() => setReporte(tab.val)}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                  reporte === tab.val ? 'bg-unich-purple text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>{tab.label}</button>
            ))}
          </div>
          <div className="flex gap-3">
            <Select value={filtroDpto} onChange={e => setFiltroDpto(e.target.value)} className="text-sm min-w-[180px]">
              <option value="">Todos los departamentos</option>
              {departamentos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </Select>
            <Button variant="outline" icon={FileDown} onClick={handleExport}>Exportar CSV</Button>
          </div>
        </div>
        {loading ? (
          <div className="h-52 flex items-center justify-center">
            <div className="animate-spin rounded-full h-9 w-9 border-4 border-unich-purple border-t-transparent" />
          </div>
        ) : (
          <>
            <Table columns={columns} data={empleados} />
            <div className="p-4 border-t border-gray-100 text-sm text-gray-500 text-right">
              {empleados.length} empleados en el reporte
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default RrhhReportes;
