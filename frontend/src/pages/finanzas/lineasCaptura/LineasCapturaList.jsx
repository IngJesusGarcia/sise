import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hash, Plus, Search, CheckCircle, XCircle, Clock } from 'lucide-react';
import { lineasCapturaService, serviciosService, finanzasService } from '../../../services/finanzasService';
import { Card, CardContent } from '../../../components/ui/Card';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import { FormGroup, Label, Input, Select } from '../../../components/ui/Form';

const fmt = (n) => Number(n ?? 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
const ESTATUS_CFG = {
  pendiente: { cls: 'bg-amber-100 text-amber-800', icon: Clock },
  pagado:    { cls: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
  vencido:   { cls: 'bg-red-100 text-red-700', icon: XCircle },
  cancelado: { cls: 'bg-gray-100 text-gray-500', icon: XCircle },
};

const LineasCapturaList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroEstatus, setFiltroEstatus] = useState('');
  const [meta, setMeta] = useState({ total: 0, last_page: 1, current_page: 1 });
  const [showForm, setShowForm] = useState(false);
  const [alumnos, setAlumnos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ alumno_id: '', catalogo_servicio_id: '', fecha_vencimiento: '', monto: '' });
  const navigate = useNavigate();

  const fetchItems = useCallback(async (page = 1) => {
    setLoading(true);
    const data = await lineasCapturaService.getAll({ estatus: filtroEstatus || undefined, page, per_page: 20 });
    setItems(data.data ?? data);
    setMeta({ total: data.total ?? 0, last_page: data.last_page ?? 1, current_page: data.current_page ?? 1 });
    setLoading(false);
  }, [filtroEstatus]);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => {
    finanzasService.getAlumnos().then(d => setAlumnos(d.data ?? d));
    serviciosService.getAll({ activo: '1', per_page: 200 }).then(d => setServicios(d.data ?? d));
  }, []);

  const handleServicioChange = (e) => {
    const sid = e.target.value;
    const srv = servicios.find(s => String(s.id) === sid);
    setForm({ ...form, catalogo_servicio_id: sid, monto: srv?.costo ?? '' });
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await lineasCapturaService.create(form);
      setShowForm(false); setForm({ alumno_id: '', catalogo_servicio_id: '', fecha_vencimiento: '', monto: '' });
      fetchItems();
    } catch (err) { alert(err.response?.data?.message ?? 'Error.'); }
    finally { setSaving(false); }
  };

  const handleCancel = async (id) => {
    if (!confirm('¿Cancelar esta línea de captura?')) return;
    await lineasCapturaService.updateEstatus(id, 'cancelado');
    fetchItems();
  };

  const columns = [
    { header: 'Referencia', cell: r => <span className="font-mono text-xs font-bold text-unich-purple">{r.referencia}</span> },
    { header: 'Estudiante', cell: r => (
      <div>
        <p className="text-sm font-semibold">{r.alumno?.nombre} {r.alumno?.apellido_paterno}</p>
        <p className="text-xs font-mono text-gray-400">{r.alumno?.matricula}</p>
      </div>
    )},
    { header: 'Servicio', cell: r => <span className="text-sm text-gray-700">{r.servicio?.nombre ?? '—'}</span> },
    { header: 'Monto', cell: r => <span className="font-mono font-bold text-gray-800 text-sm">{fmt(r.monto)}</span> },
    { header: 'Vencimiento', cell: r => {
      const venc = new Date(r.fecha_vencimiento);
      const past = venc < new Date();
      return <span className={`text-xs font-mono font-semibold ${past && r.estatus === 'pendiente' ? 'text-red-600' : 'text-gray-500'}`}>{r.fecha_vencimiento}</span>;
    }},
    {
      header: 'Estatus',
      cell: r => {
        const cfg = ESTATUS_CFG[r.estatus] ?? ESTATUS_CFG.pendiente;
        const Icon = cfg.icon;
        return <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold w-fit ${cfg.cls}`}><Icon size={12} />{r.estatus}</span>;
      }
    },
    {
      header: 'Acciones',
      cell: r => (
        <div className="flex gap-1 justify-end">
          {r.estatus === 'pendiente' && (
            <>
              <button onClick={() => navigate(`/finanzas/pagos/nuevo?linea=${r.id}`)}
                className="px-2.5 py-1 text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg font-bold transition-colors">
                Registrar Pago
              </button>
              <button onClick={() => handleCancel(r.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><XCircle size={15} /></button>
            </>
          )}
        </div>
      )
    },
  ];

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2"><div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Hash size={24} /></div><h1 className="text-3xl font-extrabold text-gray-900">Líneas de Captura</h1></div>
          <p className="text-gray-500">Referencias de pago bancarias · {meta.total} registros</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancelar' : 'Generar Línea'}</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-widest">Nueva Línea de Captura</h3>
            <form onSubmit={handleCreate}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-4">
                <FormGroup className="md:col-span-2">
                  <Label htmlFor="alumno_id">Estudiante</Label>
                  <Select id="alumno_id" value={form.alumno_id} onChange={e => setForm({ ...form, alumno_id: e.target.value })} required>
                    <option value="">Seleccionar estudiante...</option>
                    {alumnos.map(a => <option key={a.id} value={a.id}>{a.matricula} — {a.nombre} {a.apellido_paterno}</option>)}
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="catalogo_servicio_id">Servicio</Label>
                  <Select id="catalogo_servicio_id" value={form.catalogo_servicio_id} onChange={handleServicioChange} required>
                    <option value="">Seleccionar...</option>
                    {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre} — {fmt(s.costo)}</option>)}
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="monto">Monto (MXN)</Label>
                  <Input id="monto" type="number" step="0.01" min="0" value={form.monto} onChange={e => setForm({ ...form, monto: e.target.value })} required className="font-mono" />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="fecha_vencimiento">Fecha de Vencimiento</Label>
                  <Input id="fecha_vencimiento" type="date" value={form.fecha_vencimiento} onChange={e => setForm({ ...form, fecha_vencimiento: e.target.value })} required />
                </FormGroup>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button variant="primary" type="submit" isLoading={saving}>Generar Línea de Captura</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <div className="p-4 flex gap-3 border-b border-gray-100 bg-gray-50/60">
          {['', 'pendiente', 'pagado', 'vencido', 'cancelado'].map(e => (
            <button key={e} onClick={() => setFiltroEstatus(e)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${filtroEstatus === e ? 'bg-unich-purple text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {e || 'Todos'}
            </button>
          ))}
        </div>
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
export default LineasCapturaList;
