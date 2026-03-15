import React, { useState, useEffect } from 'react';
import { Search, Award, BookOpen, TrendingUp, Target, CheckCircle, XCircle, Clock, FileText, Layers, GraduationCap } from 'lucide-react';
import kardexService from '../../services/kardexService';
import { Card, CardContent } from '../../components/ui/Card';
import { FormGroup, Select } from '../../components/ui/Form';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// ── Helpers ──────────────────────────────────────────────────────────────────

const ESTATUS_CFG = {
  aprobada:  { cls: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500', label: 'APROBADA' },
  reprobada: { cls: 'bg-red-100 text-red-800 border-red-200',             dot: 'bg-red-500',     label: 'REPROBADA' },
  pendiente: { cls: 'bg-gray-100 text-gray-400 border-gray-200',          dot: 'bg-gray-300',    label: 'PENDIENTE' },
};

const gradeColor = (n) => {
  if (n === null || n === undefined) return 'text-gray-300';
  return n >= 70 ? 'text-emerald-700' : 'text-red-600';
};

// ── Donut chart ───────────────────────────────────────────────────────────────

const COLORS = ['#22c55e', '#ef4444', '#e5e7eb'];

const ProgressDonut = ({ aprobadas, reprobadas, pendientes }) => {
  const data = [
    { name: 'Aprobadas', value: aprobadas },
    { name: 'Reprobadas', value: reprobadas },
    { name: 'Pendientes', value: pendientes },
  ].filter(d => d.value > 0);

  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(v, n) => [`${v} materias`, n]} />
        <Legend iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
};

// ── Progress Bar ──────────────────────────────────────────────────────────────

const ProgressBar = ({ value, label, color = 'bg-unich-purple' }) => (
  <div>
    <div className="flex justify-between items-center mb-1 text-xs">
      <span className="text-gray-500 font-medium">{label}</span>
      <span className="font-black text-gray-800">{value}%</span>
    </div>
    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} rounded-full transition-all duration-700`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  </div>
);

// ── KPI Cards ─────────────────────────────────────────────────────────────────

const KpiCard = ({ icon: Icon, label, value, sub, iconBg, iconColor }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`p-3 rounded-xl ${iconBg}`}>
      <Icon size={24} className={iconColor} />
    </div>
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-3xl font-black text-gray-900 leading-none mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const KardexDetalle = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterEstatus, setFilterEstatus] = useState('todas');

  useEffect(() => {
    kardexService.getAllEstudiantes()
      .then(d => setEstudiantes(d.data ?? d))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedId) { setData(null); return; }
    setLoading(true);
    kardexService.getKardex(selectedId)
      .then(setData)
      .catch(() => alert('Error al cargar el kardex.'))
      .finally(() => setLoading(false));
  }, [selectedId]);

  // Filter detalle_kardex by estatus
  const detalleVisible = (data?.detalle_por_semestre ?? {});

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-unich-purple/10 text-unich-purple rounded-lg"><FileText size={24} /></div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Kardex Académico Inteligente</h1>
          </div>
          <p className="text-gray-500">Avance de carrera calculado automáticamente por plan de estudios.</p>
        </div>
        <div className="w-full md:w-96">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-unich-purple/30 shadow-sm"
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
            >
              <option value="">Seleccionar estudiante...</option>
              {estudiantes.map(e => (
                <option key={e.id} value={e.id}>
                  {e.matricula} — {e.apellido_paterno} {e.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="h-64 flex flex-col items-center justify-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-unich-purple border-t-transparent" />
          <p className="text-gray-500 font-medium">Calculando expediente académico...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !data && (
        <Card className="border-dashed shadow-none bg-gray-50 flex items-center justify-center p-16">
          <div className="text-center">
            <GraduationCap size={52} strokeWidth={1} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium text-lg">Selecciona un estudiante para generar su Kardex.</p>
            <p className="text-gray-400 text-sm mt-1">El sistema calculará el avance académico automáticamente.</p>
          </div>
        </Card>
      )}

      {/* Data */}
      {!loading && data && (
        <>
          {/* Student Header Card */}
          <Card className="border-t-4 border-t-unich-purple overflow-hidden">
            <div className="bg-gradient-to-r from-unich-purple/5 to-transparent p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-black text-gray-900">
                  {data.estudiante.nombre} {data.estudiante.apellido_paterno} {data.estudiante.apellido_materno}
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-600">
                  <span className="font-mono bg-white border px-2.5 py-0.5 rounded-lg shadow-sm font-bold text-unich-purple">
                    {data.estudiante.matricula}
                  </span>
                  <span className="text-gray-300">·</span>
                  <span className="font-semibold">{data.licenciatura?.nombre ?? 'Sin licenciatura'}</span>
                  {data.plan_estudio && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span className="font-mono text-xs text-gray-500">Plan: {data.plan_estudio.clave}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-medium">Semestre Actual</p>
                  <p className="text-2xl font-black text-unich-purple">{data.estudiante.semestre_actual}°</p>
                </div>
                <div className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase ${
                  data.estudiante.estatus === 'activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}>
                  {String(data.estudiante.estatus).replace('_', ' ')}
                </div>
              </div>
            </div>
          </Card>

          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard icon={Award} label="Promedio General" value={data.promedio_general}
              sub="(Materias con calificación)" iconBg="bg-amber-100" iconColor="text-amber-500" />
            <KpiCard icon={Layers} label="Créditos Acumulados" value={data.creditos_acumulados}
              sub={`de ${data.creditos_totales} totales`} iconBg="bg-blue-100" iconColor="text-blue-600" />
            <KpiCard icon={TrendingUp} label="Avance de Carrera" value={`${data.avance_carrera}%`}
              sub="Basado en créditos" iconBg="bg-unich-purple/10" iconColor="text-unich-purple" />
            <KpiCard icon={Target} label="Eficiencia Terminal" value={`${data.eficiencia_terminal}%`}
              sub="" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
          </div>

          {/* Summary row: donut + progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-widest">Distribución de Materias</h3>
                <div className="flex items-center gap-6">
                  <ProgressDonut
                    aprobadas={data.materias_aprobadas}
                    reprobadas={data.materias_reprobadas}
                    pendientes={data.materias_pendientes}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                  {[
                    { label: 'Aprobadas', val: data.materias_aprobadas, cls: 'text-emerald-600' },
                    { label: 'Reprobadas', val: data.materias_reprobadas, cls: 'text-red-600' },
                    { label: 'Pendientes', val: data.materias_pendientes, cls: 'text-gray-400' },
                  ].map(s => (
                    <div key={s.label} className="bg-gray-50 rounded-xl p-3">
                      <p className={`text-2xl font-black ${s.cls}`}>{s.val}</p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-5">
                <h3 className="font-bold text-gray-700 text-sm uppercase tracking-widest">Progreso Académico</h3>
                <ProgressBar
                  value={data.avance_carrera}
                  label={`Créditos: ${data.creditos_acumulados} / ${data.creditos_totales}`}
                  color="bg-unich-purple"
                />
                <ProgressBar
                  value={data.creditos_totales > 0 ? Math.round((data.materias_aprobadas / data.total_materias) * 100) : 0}
                  label={`Materias aprobadas: ${data.materias_aprobadas} / ${data.total_materias}`}
                  color="bg-emerald-500"
                />
                <ProgressBar
                  value={data.creditos_totales > 0 ? Math.round((data.materias_reprobadas / data.total_materias) * 100) : 0}
                  label={`Materias reprobadas: ${data.materias_reprobadas} / ${data.total_materias}`}
                  color="bg-red-400"
                />
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Ciclo de ingreso</span>
                    <span className="font-bold text-gray-700">{data.estudiante.ciclo_ingreso ?? '—'}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500">Turno</span>
                    <span className="font-bold text-gray-700">{data.estudiante.turno}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3">
            <span className="text-sm font-bold text-gray-500">Mostrar:</span>
            {['todas', 'aprobada', 'reprobada', 'pendiente'].map(f => (
              <button key={f} onClick={() => setFilterEstatus(f)}
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-colors ${
                  filterEstatus === f
                    ? 'bg-unich-purple text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}>
                {f === 'todas' ? 'Todas las materias' : f}
              </button>
            ))}
          </div>

          {/* Detail table by semester */}
          <div className="space-y-6">
            {Object.entries(detalleVisible).map(([sem, materias]) => {
              const filtered = filterEstatus === 'todas' ? materias : materias.filter(m => m.estatus === filterEstatus);
              if (filtered.length === 0) return null;

              const semLabel = sem === 'null' || sem === '0' ? 'Sin semestre asignado' : `Semestre ${sem}`;
              const semAprob = filtered.filter(m => m.estatus === 'aprobada').length;
              const semTotal = filtered.length;

              return (
                <div key={sem} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 px-5 py-3">
                    <h3 className="font-black text-gray-800 flex items-center gap-2">
                      <BookOpen size={16} className="text-unich-purple" /> {semLabel}
                    </h3>
                    <span className="text-xs text-gray-500 font-semibold">
                      {semAprob}/{semTotal} aprobadas
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          {['Clave', 'Materia', 'Tipo', 'Créditos', 'Calificación', 'Periodo', 'Estatus'].map(h => (
                            <th key={h} className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filtered.map((m, i) => {
                          const cfg = ESTATUS_CFG[m.estatus] ?? ESTATUS_CFG.pendiente;
                          return (
                            <tr key={i} className={`hover:bg-gray-50 transition-colors ${m.estatus === 'pendiente' ? 'opacity-50' : ''}`}>
                              <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">{m.clave}</td>
                              <td className="px-4 py-3 font-medium text-gray-800 min-w-[200px]">{m.materia}</td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 uppercase">
                                  {m.tipo ?? '—'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center font-semibold text-gray-700">{m.creditos}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`font-mono font-black text-base ${gradeColor(m.calificacion)}`}>
                                  {m.calificacion !== null ? Number(m.calificacion).toFixed(1) : '—'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{m.periodo ?? '—'}</td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`flex items-center gap-1.5 w-fit px-2.5 py-0.5 rounded-full text-[11px] font-black border uppercase ${cfg.cls}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                  {cfg.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default KardexDetalle;
