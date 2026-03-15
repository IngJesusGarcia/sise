import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, FileDown, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { finanzasService } from '../../../services/finanzasService';
import { Card, CardContent } from '../../../components/ui/Card';
import { FormGroup, Label, Input } from '../../../components/ui/Form';
import Button from '../../../components/ui/Button';

const fmt = (n) => Number(n ?? 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
const BAR_COLORS = ['bg-unich-purple', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-violet-500'];

const StatCard = ({ icon: Icon, label, value, sub, bg, fg }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${bg}`}><Icon size={22} className={fg} /></div>
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </CardContent>
  </Card>
);

const ReportesFinanzas = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fechaInicio, setFechaInicio] = useState(() => {
    const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0];
  });
  const [fechaFin, setFechaFin] = useState(() => new Date().toISOString().split('T')[0]);

  const fetchData = async () => {
    setLoading(true);
    const res = await finanzasService.getResumen({ fecha_inicio: fechaInicio, fecha_fin: fechaFin });
    setData(res);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleExport = () => {
    if (!data) return;
    const rows = [
      ['Reporte Financiero - SISE UNICH'],
      [`Periodo: ${data.periodo.inicio} a ${data.periodo.fin}`],
      [],
      ['Por Servicio', 'Pagos', 'Monto'],
      ...(data.por_servicio ?? []).map(s => [s.nombre, s.total, s.monto]),
      [],
      ['Método de Pago', 'Pagos', 'Monto'],
      ...(data.por_metodo ?? []).map(m => [m.metodo_pago, m.total, m.monto]),
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = `reporte_finanzas_${fechaInicio}_${fechaFin}.csv`;
    a.click();
  };

  const maxMonto = data?.por_servicio?.length ? Math.max(...data.por_servicio.map(s => s.monto)) : 1;

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2"><div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><BarChart2 size={24} /></div><h1 className="text-3xl font-extrabold text-gray-900">Reportes Financieros</h1></div>
          <p className="text-gray-500">Análisis de ingresos por periodo, servicio y método de pago.</p>
        </div>
        <div className="flex gap-3 items-end flex-wrap">
          <FormGroup className="mb-0">
            <Label htmlFor="fi">Inicio</Label>
            <Input id="fi" type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
          </FormGroup>
          <FormGroup className="mb-0">
            <Label htmlFor="ff">Fin</Label>
            <Input id="ff" type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
          </FormGroup>
          <Button variant="primary" onClick={fetchData} isLoading={loading}>Generar</Button>
          <Button variant="outline" icon={FileDown} onClick={handleExport}>CSV</Button>
        </div>
      </div>

      {loading ? (
        <div className="h-52 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-4 border-unich-purple border-t-transparent" /></div>
      ) : data && (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard icon={DollarSign} label="Total Ingresado" value={fmt(data.total_pagado)} sub={`${data.total_pagos} pagos`} bg="bg-emerald-100" fg="text-emerald-700" />
            <StatCard icon={TrendingUp} label="Promedio por Pago" value={fmt(data.total_pagos > 0 ? data.total_pagado / data.total_pagos : 0)} bg="bg-blue-100" fg="text-blue-600" />
            <StatCard icon={Clock} label="Líneas Pendientes" value={data.pendientes} sub="por cobrar" bg="bg-amber-100" fg="text-amber-600" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* By service */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Ingresos por Servicio</h3>
                {data.por_servicio?.length === 0 ? <p className="text-sm text-gray-400">Sin datos en el periodo.</p> : (
                  <div className="space-y-4">
                    {(data.por_servicio ?? []).map((s, i) => (
                      <div key={s.nombre}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-semibold text-gray-700 truncate max-w-[60%]">{s.nombre}</span>
                          <span className="font-black text-gray-900 font-mono">{fmt(s.monto)}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]} transition-all`} style={{ width: `${(s.monto / maxMonto) * 100}%` }} />
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{s.total} pago{s.total !== 1 ? 's' : ''}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* By method */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Ingresos por Método de Pago</h3>
                {data.por_metodo?.length === 0 ? <p className="text-sm text-gray-400">Sin datos.</p> : (
                  <div className="space-y-3">
                    {(data.por_metodo ?? []).map((m, i) => (
                      <div key={m.metodo_pago} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`} />
                          <span className="font-semibold text-sm text-gray-700">{m.metodo_pago}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-gray-900 font-mono text-sm">{fmt(m.monto)}</p>
                          <p className="text-xs text-gray-400">{m.total} pago{m.total !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Daily chart */}
          {data.por_dia?.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Ingresos Diarios</h3>
                <div className="flex items-end gap-1 h-36 overflow-x-auto pb-2">
                  {(() => {
                    const max = Math.max(...data.por_dia.map(d => d.total));
                    return data.por_dia.map(d => (
                      <div key={d.fecha_pago} className="flex flex-col items-center gap-1 min-w-[30px]">
                        <span className="text-[9px] text-gray-400 font-mono rotate-45 origin-left">{d.fecha_pago?.slice(5)}</span>
                        <div className="relative w-5 bg-gray-100 rounded-t-md overflow-hidden flex-1 flex items-end">
                          <div className="absolute bottom-0 w-full bg-unich-purple/80 rounded-t-md transition-all"
                            style={{ height: `${max > 0 ? (d.total / max) * 100 : 0}%` }}
                            title={fmt(d.total)} />
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
export default ReportesFinanzas;
