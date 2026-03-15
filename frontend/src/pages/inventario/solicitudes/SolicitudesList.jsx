import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Plus, CheckCircle, XCircle, Eye, Clock } from 'lucide-react';
import { solicitudesService, inventarioService } from '../../../services/inventarioService';
import { Card, CardContent } from '../../../components/ui/Card';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import { FormGroup, Label, Input, Select } from '../../../components/ui/Form';

const ESTATUS_CFG = {
  pendiente:  { cls: 'bg-amber-100 text-amber-800',  icon: Clock,        label: 'Pendiente' },
  aprobada:   { cls: 'bg-emerald-100 text-emerald-800', icon: CheckCircle, label: 'Aprobada' },
  rechazada:  { cls: 'bg-red-100 text-red-700',      icon: XCircle,      label: 'Rechazada' },
  entregada:  { cls: 'bg-blue-100 text-blue-800',    icon: CheckCircle,  label: 'Entregada' },
};

const SolicitudesList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstatus, setFiltroEstatus] = useState('');
  const [meta, setMeta] = useState({ total: 0, last_page: 1, current_page: 1 });
  const [showForm, setShowForm] = useState(false);
  const [almacenes, setAlmacenes] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ almacen_id: '', motivo: '', detalles: [{ material_id: '', cantidad_solicitada: 1 }] });

  const fetchItems = useCallback(async (page = 1) => {
    setLoading(true);
    const data = await solicitudesService.getAll({ estatus: filtroEstatus || undefined, page, per_page: 20 });
    setItems(data.data ?? data);
    setMeta({ total: data.total ?? 0, last_page: data.last_page ?? 1, current_page: data.current_page ?? 1 });
    setLoading(false);
  }, [filtroEstatus]);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => {
    inventarioService.getAlmacenes().then(setAlmacenes);
    inventarioService.getMateriales({ per_page: 500 }).then(d => setMateriales(d.data ?? d));
  }, []);

  const addDetalle = () => setForm({ ...form, detalles: [...form.detalles, { material_id: '', cantidad_solicitada: 1 }] });
  const removeDetalle = (i) => setForm({ ...form, detalles: form.detalles.filter((_, idx) => idx !== i) });
  const updateDetalle = (i, key, val) => {
    const d = [...form.detalles]; d[i] = { ...d[i], [key]: val }; setForm({ ...form, detalles: d });
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await solicitudesService.create(form); setShowForm(false); fetchItems(); }
    catch (err) { alert(err.response?.data?.message ?? 'Error.'); }
    finally { setSaving(false); }
  };

  const handleAprobar = async (id) => {
    if (!confirm('¿Aprobar esta solicitud? Se descontará el stock automáticamente.')) return;
    try {
      const res = await solicitudesService.aprobar(id);
      if (res.insuficientes?.length) alert('⚠️ Sin stock para: ' + res.insuficientes.join(', '));
      fetchItems();
    } catch (err) { alert(err.response?.data?.message ?? 'Error.'); }
  };

  const handleRechazar = async (id) => {
    if (!confirm('¿Rechazar esta solicitud?')) return;
    await solicitudesService.rechazar(id).then(() => fetchItems());
  };

  const columns = [
    { header: 'Folio', cell: r => <span className="font-mono text-xs font-bold text-unich-purple">{r.folio}</span> },
    { header: 'Solicitante', cell: r => <span className="text-sm font-semibold text-gray-800">{r.solicitante?.name ?? '—'}</span> },
    { header: 'Almacén', cell: r => <span className="text-sm text-gray-600">{r.almacen?.nombre ?? '—'}</span> },
    { header: 'Materiales', cell: r => <span className="text-sm text-gray-600">{r.detalles?.length ?? 0} ítems</span> },
    { header: 'Fecha', cell: r => <span className="text-xs font-mono text-gray-500">{r.created_at?.split('T')[0]}</span> },
    {
      header: 'Estatus',
      cell: r => {
        const cfg = ESTATUS_CFG[r.estatus] ?? ESTATUS_CFG.pendiente;
        const Icon = cfg.icon;
        return <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold w-fit ${cfg.cls}`}><Icon size={12} />{cfg.label}</span>;
      }
    },
    {
      header: 'Acciones',
      cell: r => (
        <div className="flex gap-1 justify-end">
          <button onClick={() => setSelected(r)} className="p-2 text-gray-400 hover:text-unich-purple hover:bg-unich-purple/10 rounded-lg transition-colors"><Eye size={16} /></button>
          {r.estatus === 'pendiente' && (
            <>
              <button onClick={() => handleAprobar(r.id)} className="px-2.5 py-1 text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg font-bold transition-colors">✓ Aprobar</button>
              <button onClick={() => handleRechazar(r.id)} className="px-2.5 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-bold transition-colors">✕ Rechazar</button>
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
          <div className="flex items-center gap-3 mb-2"><div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><ClipboardList size={24} /></div><h1 className="text-3xl font-extrabold text-gray-900">Solicitudes de Materiales</h1></div>
          <p className="text-gray-500">{meta.total} solicitudes · {items.filter(i => i.estatus === 'pendiente').length} pendientes</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancelar' : 'Nueva Solicitud'}</Button>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-gray-900">Solicitud {selected.folio}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex gap-2"><span className="text-gray-400 font-medium w-28">Solicitante:</span><span className="font-semibold">{selected.solicitante?.name}</span></div>
              <div className="flex gap-2"><span className="text-gray-400 font-medium w-28">Almacén:</span><span>{selected.almacen?.nombre}</span></div>
              <div className="flex gap-2"><span className="text-gray-400 font-medium w-28">Motivo:</span><span>{selected.motivo ?? '—'}</span></div>
            </div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Materiales Solicitados</h3>
            <div className="space-y-2">
              {(selected.detalles ?? []).map(d => (
                <div key={d.id} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg text-sm">
                  <span className="font-semibold text-gray-800">{d.material?.nombre}</span>
                  <span className="font-mono text-gray-600">{d.cantidad_solicitada} {d.material?.unidad_medida}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-widest">Nueva Solicitud de Materiales</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormGroup>
                  <Label htmlFor="almacen_id">Almacén de Origen</Label>
                  <Select id="almacen_id" value={form.almacen_id} onChange={e => setForm({ ...form, almacen_id: e.target.value })} required>
                    <option value="">Seleccionar almacén...</option>
                    {almacenes.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="motivo">Motivo / Justificación</Label>
                  <Input id="motivo" value={form.motivo} onChange={e => setForm({ ...form, motivo: e.target.value })} placeholder="¿Para qué se necesita?" />
                </FormGroup>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="mb-0">Materiales</Label>
                  <button type="button" onClick={addDetalle} className="text-xs font-bold text-unich-purple hover:underline">+ Agregar material</button>
                </div>
                <div className="space-y-2">
                  {form.detalles.map((d, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <Select value={d.material_id} onChange={e => updateDetalle(i, 'material_id', e.target.value)} className="flex-1 text-sm" required>
                        <option value="">Seleccionar material...</option>
                        {materiales.map(m => <option key={m.id} value={m.id}>{m.codigo} — {m.nombre}</option>)}
                      </Select>
                      <Input type="number" min="1" value={d.cantidad_solicitada} onChange={e => updateDetalle(i, 'cantidad_solicitada', e.target.value)}
                        className="w-24 text-sm font-mono" required />
                      {form.detalles.length > 1 && <button type="button" onClick={() => removeDetalle(i)} className="text-red-400 hover:text-red-600 font-bold">×</button>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button variant="primary" type="submit" isLoading={saving}>Enviar Solicitud</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <div className="p-4 flex gap-2 border-b border-gray-100 bg-gray-50/60 flex-wrap">
          {['', 'pendiente', 'aprobada', 'rechazada', 'entregada'].map(e => (
            <button key={e} onClick={() => setFiltroEstatus(e)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${filtroEstatus === e ? 'bg-unich-purple text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {e || 'Todos'}
            </button>
          ))}
        </div>
        {loading ? <div className="h-48 flex items-center justify-center"><div className="animate-spin rounded-full h-9 w-9 border-4 border-unich-purple border-t-transparent" /></div>
          : <Table columns={columns} data={items} />}
      </Card>
    </div>
  );
};
export default SolicitudesList;
