import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DollarSign, Plus, Search, Printer } from 'lucide-react';
import { pagosService, finanzasService } from '../../../services/finanzasService';
import { Card, CardContent } from '../../../components/ui/Card';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import { FormGroup, Label, Input, Select } from '../../../components/ui/Form';
import { lineasCapturaService } from '../../../services/finanzasService';

const fmt = (n) => Number(n ?? 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

const METODOS = ['Ventanilla', 'Transferencia', 'Tarjeta', 'Efectivo', 'Cheque'];

const PagosList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, last_page: 1, current_page: 1 });
  const [showForm, setShowForm] = useState(false);
  const [lineasPendientes, setLineasPendientes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    linea_captura_id: searchParams.get('linea') ?? '',
    monto_pagado: '', fecha_pago: new Date().toISOString().split('T')[0],
    metodo_pago: 'Ventanilla', banco: '', numero_operacion: '',
  });

  const fetchItems = useCallback(async (page = 1) => {
    setLoading(true);
    const data = await pagosService.getAll({ page, per_page: 20 });
    setItems(data.data ?? data);
    setMeta({ total: data.total ?? 0, last_page: data.last_page ?? 1, current_page: data.current_page ?? 1 });
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => {
    lineasCapturaService.getAll({ estatus: 'pendiente', per_page: 200 })
      .then(d => setLineasPendientes(d.data ?? d));
  }, []);

  // Pre-fill monto from selected linea
  useEffect(() => {
    if (form.linea_captura_id) {
      const l = lineasPendientes.find(l => String(l.id) === String(form.linea_captura_id));
      if (l) setForm(prev => ({ ...prev, monto_pagado: l.monto }));
    }
  }, [form.linea_captura_id, lineasPendientes]);

  // Open form if ?linea= param passed
  useEffect(() => {
    if (searchParams.get('linea')) setShowForm(true);
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const pago = await pagosService.create(form);
      setShowForm(false); fetchItems();
      // Print receipt
      printRecibo(pago.recibo ?? pago);
    } catch (err) { alert(err.response?.data?.message ?? 'Error al registrar pago.'); }
    finally { setSaving(false); }
  };

  const printRecibo = (r) => {
    if (!r) return;
    const pago = r.pago ?? r;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Recibo ${r.folio}</title>
      <style>body{font-family:Arial,sans-serif;padding:30px;font-size:13px}h1{font-size:16px;text-align:center;margin-bottom:4px}.subtitle{text-align:center;color:#666;font-size:11px;margin-bottom:20px}table{width:100%;border-collapse:collapse}th{background:#2E2C7F;color:white;padding:7px 12px;text-align:left;font-size:11px}td{padding:7px 12px;border-bottom:1px solid #eee}.total{font-size:18px;font-weight:bold;color:#22c55e;text-align:right;padding:12px 0}.firma{margin-top:50px;text-align:center;display:flex;justify-content:center;gap:60px}.f{text-align:center;border-top:1px solid #333;width:160px;padding-top:6px;font-size:11px}</style></head>
      <body>
      <h1>RECIBO DE PAGO</h1>
      <div class="subtitle">Universidad Intercultural de Chiapas — SISE UNICH</div>
      <table>
        <tr><th>Folio</th><td>${r.folio ?? '—'}</td></tr>
        <tr><th>Estudiante</th><td>${pago?.alumno?.nombre ?? ''} ${pago?.alumno?.apellido_paterno ?? ''}</td></tr>
        <tr><th>Matrícula</th><td>${pago?.alumno?.matricula ?? ''}</td></tr>
        <tr><th>Servicio</th><td>${pago?.linea_captura?.servicio?.nombre ?? '—'}</td></tr>
        <tr><th>Monto</th><td><strong>${fmt(r.monto ?? pago?.monto_pagado)}</strong></td></tr>
        <tr><th>Método de Pago</th><td>${pago?.metodo_pago ?? '—'}</td></tr>
        <tr><th>Fecha</th><td>${pago?.fecha_pago ?? r.fecha_emision ?? '—'}</td></tr>
      </table>
      <p class="total">TOTAL PAGADO: ${fmt(r.monto ?? pago?.monto_pagado)}</p>
      <div class="firma"><div class="f">Estudiante</div><div class="f">Caja / Tesorería UNICH</div></div>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  const columns = [
    { header: 'Folio Recibo', cell: r => <span className="font-mono text-xs font-bold text-unich-purple">{r.recibo?.folio ?? '—'}</span> },
    { header: 'Estudiante', cell: r => (
      <div><p className="text-sm font-semibold">{r.alumno?.nombre} {r.alumno?.apellido_paterno}</p><p className="text-xs font-mono text-gray-400">{r.alumno?.matricula}</p></div>
    )},
    { header: 'Servicio', cell: r => <span className="text-sm text-gray-600">{r.linea_captura?.servicio?.nombre ?? '—'}</span> },
    { header: 'Monto', cell: r => <span className="font-mono font-black text-emerald-700 text-sm">{fmt(r.monto_pagado)}</span> },
    { header: 'Método', cell: r => <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-bold">{r.metodo_pago}</span> },
    { header: 'Fecha Pago', cell: r => <span className="text-xs font-mono text-gray-500">{r.fecha_pago}</span> },
    {
      header: 'Acciones',
      cell: r => (
        <button onClick={() => printRecibo(r.recibo ?? r)} className="p-2 text-gray-400 hover:text-unich-purple hover:bg-unich-purple/10 rounded-lg transition-colors"><Printer size={16} /></button>
      )
    },
  ];

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2"><div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><DollarSign size={24} /></div><h1 className="text-3xl font-extrabold text-gray-900">Pagos</h1></div>
          <p className="text-gray-500">{meta.total} pagos registrados</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancelar' : 'Registrar Pago'}</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-widest">Registrar Pago</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                <FormGroup className="md:col-span-3">
                  <Label htmlFor="linea_captura_id">Línea de Captura (Referencia)</Label>
                  <Select id="linea_captura_id" value={form.linea_captura_id} onChange={handleChange} required>
                    <option value="">Seleccionar línea pendiente...</option>
                    {lineasPendientes.map(l => <option key={l.id} value={l.id}>{l.referencia} — {l.alumno?.nombre} {l.alumno?.apellido_paterno} — {l.servicio?.nombre}</option>)}
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="monto_pagado">Monto Pagado (MXN)</Label>
                  <Input id="monto_pagado" type="number" min="0.01" step="0.01" value={form.monto_pagado} onChange={handleChange} required className="font-mono font-bold" />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="fecha_pago">Fecha de Pago</Label>
                  <Input id="fecha_pago" type="date" value={form.fecha_pago} onChange={handleChange} required />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="metodo_pago">Método de Pago</Label>
                  <Select id="metodo_pago" value={form.metodo_pago} onChange={handleChange}>
                    {METODOS.map(m => <option key={m} value={m}>{m}</option>)}
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="banco">Banco (opcional)</Label>
                  <Input id="banco" value={form.banco} onChange={handleChange} placeholder="BBVA, Banorte..." />
                </FormGroup>
                <FormGroup className="md:col-span-2">
                  <Label htmlFor="numero_operacion">No. Operación / Referencia Bancaria</Label>
                  <Input id="numero_operacion" value={form.numero_operacion} onChange={handleChange} className="font-mono" placeholder="Número de operación del banco" />
                </FormGroup>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button variant="primary" type="submit" isLoading={saving} icon={DollarSign}>Registrar Pago y Generar Recibo</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        {loading ? <div className="h-48 flex items-center justify-center"><div className="animate-spin rounded-full h-9 w-9 border-4 border-unich-purple border-t-transparent" /></div>
          : <Table columns={columns} data={items} />}
        {meta.last_page > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-center gap-2">
            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => fetchItems(p)} className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${meta.current_page === p ? 'bg-unich-purple text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>{p}</button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
export default PagosList;
