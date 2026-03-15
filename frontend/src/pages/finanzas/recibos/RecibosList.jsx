import React, { useState, useEffect, useCallback } from 'react';
import { Receipt, Printer, Search } from 'lucide-react';
import { recibosService } from '../../../services/finanzasService';
import { Card } from '../../../components/ui/Card';
import Table from '../../../components/ui/Table';

const fmt = (n) => Number(n ?? 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

const printRecibo = async (id) => {
  const r = await recibosService.getById(id);
  const pago = r.pago ?? {};
  const win = window.open('', '_blank');
  win.document.write(`
    <html><head><title>Recibo ${r.folio}</title>
    <style>body{font-family:Arial,sans-serif;padding:30px;font-size:13px}h1{font-size:16px;text-align:center;margin-bottom:4px}.sub{text-align:center;color:#777;font-size:11px;margin-bottom:20px}table{width:100%;border-collapse:collapse}th{background:#2E2C7F;color:#fff;padding:8px 12px;text-align:left;font-size:11px}td{padding:8px 12px;border-bottom:1px solid #eee}.total{font-size:20px;font-weight:bold;color:#16a34a;text-align:right;margin-top:10px}.firma{margin-top:50px;display:flex;justify-content:center;gap:80px}.f{text-align:center;border-top:1px solid #333;width:160px;padding-top:6px;font-size:11px}</style></head>
    <body>
    <h1>RECIBO DE PAGO OFICIAL</h1>
    <div class="sub">Universidad Intercultural de Chiapas &mdash; SISE UNICH</div>
    <table>
      <tr><th>Folio</th><td><strong>${r.folio}</strong></td></tr>
      <tr><th>Fecha de Emisión</th><td>${r.fecha_emision}</td></tr>
      <tr><th>Estudiante</th><td>${pago?.alumno?.nombre ?? ''} ${pago?.alumno?.apellido_paterno ?? ''} ${pago?.alumno?.apellido_materno ?? ''}</td></tr>
      <tr><th>Matrícula</th><td>${pago?.alumno?.matricula ?? ''}</td></tr>
      <tr><th>Servicio</th><td>${pago?.linea_captura?.servicio?.nombre ?? '—'}</td></tr>
      <tr><th>Monto</th><td>${fmt(r.monto)}</td></tr>
      <tr><th>Método de Pago</th><td>${pago?.metodo_pago ?? '—'}</td></tr>
      <tr><th>No. Operación</th><td>${pago?.numero_operacion ?? '—'}</td></tr>
    </table>
    <p class="total">TOTAL PAGADO: ${fmt(r.monto)}</p>
    <div class="firma"><div class="f">Estudiante / Titular</div><div class="f">Caja &mdash; Tesorería UNICH</div></div>
    </body></html>
  `);
  win.document.close();
  win.print();
};

const RecibosList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [meta, setMeta] = useState({ total: 0, last_page: 1, current_page: 1 });

  const fetchItems = useCallback(async (page = 1) => {
    setLoading(true);
    const data = await recibosService.getAll({ page, per_page: 20 });
    setItems(data.data ?? data);
    setMeta({ total: data.total ?? 0, last_page: data.last_page ?? 1, current_page: data.current_page ?? 1 });
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filtered = search ? items.filter(r => r.folio?.toLowerCase().includes(search.toLowerCase())
    || `${r.pago?.alumno?.nombre} ${r.pago?.alumno?.apellido_paterno}`.toLowerCase().includes(search.toLowerCase())) : items;

  const columns = [
    { header: 'Folio', cell: r => <span className="font-mono font-bold text-sm text-unich-purple">{r.folio}</span> },
    { header: 'Estudiante', cell: r => (
      <div>
        <p className="text-sm font-semibold">{r.pago?.alumno?.nombre} {r.pago?.alumno?.apellido_paterno}</p>
        <p className="text-xs font-mono text-gray-400">{r.pago?.alumno?.matricula}</p>
      </div>
    )},
    { header: 'Servicio', cell: r => <span className="text-sm text-gray-600">{r.pago?.linea_captura?.servicio?.nombre ?? '—'}</span> },
    { header: 'Monto', cell: r => <span className="font-mono font-black text-emerald-700 text-sm">{fmt(r.monto)}</span> },
    { header: 'Emitido', cell: r => <span className="text-xs font-mono text-gray-500">{String(r.fecha_emision).split('T')[0]}</span> },
    { header: 'Acciones', cell: r => (
      <button onClick={() => printRecibo(r.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-gray-100 hover:bg-unich-purple hover:text-white text-gray-600 rounded-lg transition-colors">
        <Printer size={14} /> Reimprimir
      </button>
    )},
  ];

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-violet-100 text-violet-600 rounded-lg"><Receipt size={24} /></div>
        <h1 className="text-3xl font-extrabold text-gray-900">Recibos</h1>
        <span className="text-gray-400 text-sm font-medium">{meta.total} emitidos</span>
      </div>
      <Card>
        <div className="p-4 border-b border-gray-100 bg-gray-50/60">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 max-w-sm">
            <Search size={15} className="text-gray-400" />
            <input className="flex-1 outline-none text-sm bg-transparent placeholder-gray-400" placeholder="Buscar por folio o estudiante..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        {loading ? <div className="h-48 flex items-center justify-center"><div className="animate-spin rounded-full h-9 w-9 border-4 border-unich-purple border-t-transparent" /></div>
          : <Table columns={columns} data={filtered} />}
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
export default RecibosList;
