import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, CheckCircle, Clock, Banknote } from 'lucide-react';
import nominaService from '../../../services/nominaService';
import { Card, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

const fmt = (n) => Number(n ?? 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

const ESTATUS_CFG = {
  borrador: { cls: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Borrador', icon: Clock },
  aprobada: { cls: 'bg-blue-100 text-blue-800 border-blue-200',   label: 'Aprobada', icon: CheckCircle },
  pagada:   { cls: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Pagada', icon: Banknote },
};

const NominaDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nomina, setNomina] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    nominaService.getById(id).then(setNomina).finally(() => setLoading(false));
  }, [id]);

  const handleAprobar = async () => {
    if (!window.confirm('¿Aprobar esta nómina?')) return;
    await nominaService.updateEstatus(id, 'aprobada');
    setNomina(prev => ({ ...prev, estatus: 'aprobada' }));
  };

  const handlePagar = async () => {
    if (!window.confirm('¿Marcar nómina como pagada?')) return;
    await nominaService.updateEstatus(id, 'pagada');
    setNomina(prev => ({ ...prev, estatus: 'pagada' }));
  };

  const handlePrint = () => {
    if (!nomina) return;
    const win = window.open('', '_blank');
    const rows = (nomina.detalles ?? []).map(d => `
      <tr>
        <td>${d.empleado?.numero_empleado ?? ''}</td>
        <td>${d.empleado?.nombre ?? ''} ${d.empleado?.apellido_paterno ?? ''}</td>
        <td>${d.empleado?.puesto?.nombre ?? ''}</td>
        <td style="text-align:right">${fmt(d.salario_base)}</td>
        <td style="text-align:right">${fmt(d.percepciones)}</td>
        <td style="text-align:right;color:red">${fmt(d.deducciones)}</td>
        <td style="text-align:right;font-weight:bold;color:green">${fmt(d.neto)}</td>
      </tr>
    `).join('');

    win.document.write(`
      <html><head><title>Nómina ${nomina.periodo}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; font-size: 12px; }
        h1 { font-size: 16px; text-align: center; margin-bottom: 4px; }
        .subtitle { text-align: center; color: #666; margin-bottom: 16px; font-size: 11px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th { background: #2E2C7F; color: white; padding: 7px 10px; text-align: left; font-size: 11px; }
        td { padding: 6px 10px; border-bottom: 1px solid #eee; }
        tr:hover td { background: #f9f9f9; }
        .totals { margin-top: 20px; text-align: right; font-size: 13px; }
        .total-row { display: flex; justify-content: flex-end; gap: 40px; padding: 4px 0; }
        .total-label { color: #666; }
        .total-val { font-weight: bold; min-width: 100px; text-align: right; }
      </style></head>
      <body>
      <h1>NÓMINA — ${nomina.periodo}</h1>
      <div class="subtitle">Universidad Intercultural de Chiapas · Tipo: ${nomina.tipo} · Pago: ${nomina.fecha_pago} · Estatus: ${nomina.estatus.toUpperCase()}</div>
      <table>
        <thead><tr><th>No. Emp.</th><th>Nombre</th><th>Puesto</th><th>Salario Base</th><th>Percepciones</th><th>Deducciones</th><th>Neto</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="totals">
        <div class="total-row"><span class="total-label">Total Percepciones:</span><span class="total-val">${fmt(nomina.total_percepciones)}</span></div>
        <div class="total-row"><span class="total-label">Total Deducciones:</span><span class="total-val" style="color:red">${fmt(nomina.total_deducciones)}</span></div>
        <div class="total-row"><span class="total-label">Total Neto a Pagar:</span><span class="total-val" style="font-size:16px;color:green">${fmt(nomina.total_neto)}</span></div>
      </div>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  if (loading) return <div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-4 border-unich-purple border-t-transparent" /></div>;
  if (!nomina) return null;

  const cfg = ESTATUS_CFG[nomina.estatus] ?? ESTATUS_CFG.borrador;

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/rrhh/nominas')} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors text-gray-500"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="text-2xl font-black text-gray-900">{nomina.periodo}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${cfg.cls}`}>{cfg.label}</span>
              <span className="text-sm text-gray-500 font-mono">Pago: {nomina.fecha_pago}</span>
              <span className="text-sm text-gray-500">{nomina.detalles?.length ?? 0} empleados</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" icon={Printer} onClick={handlePrint}>Imprimir / PDF</Button>
          {nomina.estatus === 'borrador' && <Button variant="primary" icon={CheckCircle} onClick={handleAprobar}>Aprobar</Button>}
          {nomina.estatus === 'aprobada' && <Button variant="primary" icon={Banknote} onClick={handlePagar}>Marcar Pagada</Button>}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Percepciones Totales', value: fmt(nomina.total_percepciones), color: 'text-gray-800' },
          { label: 'Deducciones Totales',  value: fmt(nomina.total_deducciones),  color: 'text-red-600' },
          { label: 'Neto Total a Pagar',   value: fmt(nomina.total_neto),          color: 'text-emerald-700', big: true },
          { label: 'Empleados',            value: nomina.detalles?.length ?? 0,   color: 'text-unich-purple' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
              <p className={`font-black mt-1 ${s.big ? 'text-2xl' : 'text-xl'} ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {['#', 'Empleado', 'Puesto', 'Salario Base', 'Percepciones', 'Deducciones', 'Neto'].map(h => (
                  <th key={h} className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(nomina.detalles ?? []).map((d, i) => (
                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-gray-400">{d.empleado?.numero_empleado}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-800">{d.empleado?.nombre} {d.empleado?.apellido_paterno}</p>
                    <p className="text-xs text-gray-400">{d.empleado?.departamento?.nombre}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{d.empleado?.puesto?.nombre ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-sm text-gray-700">{fmt(d.salario_base)}</td>
                  <td className="px-4 py-3 font-mono text-sm text-blue-700">{fmt(d.percepciones)}</td>
                  <td className="px-4 py-3 font-mono text-sm text-red-600">{fmt(d.deducciones)}</td>
                  <td className="px-4 py-3 font-mono text-sm font-black text-emerald-700">{fmt(d.neto)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default NominaDetalle;
