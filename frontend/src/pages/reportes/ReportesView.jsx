import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { BarChart2, Users, TrendingUp, DollarSign, Award, BookOpen } from 'lucide-react';
import reportesService from '../../services/reportesService';
import { Card, CardContent } from '../../components/ui/Card';

const COLORS = ['#2E2C7F', '#E4007C', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];

const StatCard = ({ icon: Icon, label, value, color = 'text-unich-purple', bg = 'bg-unich-purple/10' }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-6 flex items-center gap-5">
      <div className={`p-3.5 rounded-xl ${bg}`}>
        <Icon className={color} size={24} />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-3xl font-black text-gray-900 mt-0.5">{value ?? '—'}</p>
      </div>
    </CardContent>
  </Card>
);

const ReportesView = () => {
  const [data, setData] = useState({
    resumen: null,
    porCarrera: [],
    reprobadas: [],
    promedioGrupos: [],
    ingresos: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [resumen, porCarrera, reprobadas, promedioGrupos, ingresos] = await Promise.all([
        reportesService.getResumen(),
        reportesService.getEstudiantesPorCarrera(),
        reportesService.getMateriasReprobadas(),
        reportesService.getPromedioGrupos(),
        reportesService.getIngresos(),
      ]);
      setData({ resumen, porCarrera, reprobadas, promedioGrupos, ingresos });
    } catch (e) {
      console.error('Error loading reports:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-unich-purple border-t-transparent" />
        <p className="text-gray-500 font-medium">Generando reportes institucionales...</p>
      </div>
    );
  }

  const customTooltipStyle = {
    backgroundColor: 'rgba(255,255,255,0.97)',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-unich-purple/10 text-unich-purple rounded-lg">
          <BarChart2 size={26} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Panel de Reportes Institucionales</h1>
          <p className="text-gray-500 mt-0.5">Análisis académico y financiero en tiempo real del ciclo escolar activo.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Alumnos Activos" value={data.resumen?.total_estudiantes} color="text-blue-600" bg="bg-blue-100" />
        <StatCard icon={BookOpen} label="Egresados" value={data.resumen?.total_egresados} color="text-emerald-600" bg="bg-emerald-100" />
        <StatCard icon={Award} label="Titulados" value={data.resumen?.total_titulados} color="text-unich-magenta" bg="bg-pink-100" />
        <StatCard icon={TrendingUp} label="Promedio General" value={data.resumen?.promedio_general} color="text-unich-purple" bg="bg-unich-purple/10" />
      </div>

      {/* Rows of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estudiantes por Carrera — PIE */}
        <Card>
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-lg">Distribución por Licenciatura</h2>
            <p className="text-sm text-gray-500 mt-0.5">Alumnos activos agrupados por programa educativo</p>
          </div>
          <CardContent className="p-4">
            {data.porCarrera.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data.porCarrera}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="total"
                    nameKey="name"
                    label={({ name, percent }) => `${name.substring(0,14)}… ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {data.porCarrera.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={customTooltipStyle} formatter={(v) => [v, 'Estudiantes']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400">Sin datos disponibles</div>
            )}
          </CardContent>
        </Card>

        {/* Materias Reprobadas — BAR */}
        <Card>
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-lg">Materias con Mayor Reprobación</h2>
            <p className="text-sm text-gray-500 mt-0.5">Top 10 materias con más alumnos reprobados</p>
          </div>
          <CardContent className="p-4">
            {data.reprobadas.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.reprobadas} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={customTooltipStyle} />
                  <Bar dataKey="reprobados" fill="#E4007C" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400">Sin datos disponibles</div>
            )}
          </CardContent>
        </Card>

        {/* Promedio por Grupo — BAR */}
        <Card>
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-lg">Promedio por Grupo</h2>
            <p className="text-sm text-gray-500 mt-0.5">Rendimiento académico promedio de cada grupo activo</p>
          </div>
          <CardContent className="p-4">
            {data.promedioGrupos.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.promedioGrupos} margin={{ left: -10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-25} textAnchor="end" height={55} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={customTooltipStyle} />
                  <Bar dataKey="promedio" fill="#2E2C7F" radius={[6, 6, 0, 0]}>
                    {data.promedioGrupos.map((entry, i) => (
                      <Cell key={i} fill={entry.promedio >= 7 ? '#2E2C7F' : '#E4007C'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400">Sin datos disponibles</div>
            )}
          </CardContent>
        </Card>

        {/* Ingresos por Mes — LINE */}
        <Card>
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-lg">Ingresos Financieros por Mes</h2>
            <p className="text-sm text-gray-500 mt-0.5">Recaudación acumulada mensual de colegiatura y trámites</p>
          </div>
          <CardContent className="p-4">
            {data.ingresos.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.ingresos} margin={{ left: 0, right: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={customTooltipStyle}
                    formatter={(v) => [`$${Number(v).toLocaleString('es-MX', {minimumFractionDigits: 2})}`, 'Ingresos']}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#E4007C"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#E4007C', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400">Sin datos financieros</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportesView;
