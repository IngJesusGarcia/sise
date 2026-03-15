import React, { useState, useEffect, useCallback } from 'react';
import { Package, Plus, Search, AlertTriangle, ArrowDownCircle } from 'lucide-react';
import { inventarioService } from '../../services/inventarioService';
import { Card, CardContent } from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import { FormGroup, Label, Input, Select } from '../../components/ui/Form';

const InventarioPage = () => {
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [almacenes, setAlmacenes] = useState([]);
  const [showAjuste, setShowAjuste] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [meta, setMeta] = useState({ total: 0, last_page: 1, current_page: 1 });
  const [ajusteForm, setAjusteForm] = useState({ material_id: '', almacen_id: '', tipo: 'entrada', cantidad: '', motivo: '' });
  const [createForm, setCreateForm] = useState({ codigo: '', nombre: '', descripcion: '', unidad_medida: 'Pieza', categoria: '', marca: '', precio_unitario: '0', stock_minimo: '5' });

  const fetchMateriales = useCallback(async (page = 1) => {
    setLoading(true);
    const data = await inventarioService.getMateriales({ buscar: search || undefined, page, per_page: 20 });
    setMateriales(data.data ?? data);
    setMeta({ total: data.total ?? 0, last_page: data.last_page ?? 1, current_page: data.current_page ?? 1 });
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchMateriales(); }, [fetchMateriales]);
  useEffect(() => { inventarioService.getAlmacenes().then(setAlmacenes); }, []);

  const handleAjuste = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await inventarioService.ajustarStock(ajusteForm); setShowAjuste(false); fetchMateriales(); }
    catch (err) { alert(err.response?.data?.message ?? 'Error.'); }
    finally { setSaving(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await inventarioService.createMaterial(createForm); setShowCreate(false); fetchMateriales(); }
    catch (err) { alert(err.response?.data?.message ?? 'Error.'); }
    finally { setSaving(false); }
  };

  const getStockStatus = (m) => {
    const total = m.existencias?.reduce((s, e) => s + e.cantidad, 0) ?? 0;
    if (total === 0) return { cls: 'bg-red-100 text-red-700', label: 'Sin stock' };
    if (total <= m.stock_minimo) return { cls: 'bg-amber-100 text-amber-700', label: 'Stock bajo' };
    return { cls: 'bg-emerald-100 text-emerald-700', label: 'Normal' };
  };

  const columns = [
    { header: 'Código', cell: m => <span className="font-mono text-xs font-bold text-unich-purple">{m.codigo}</span> },
    { header: 'Material', cell: m => (
      <div>
        <p className="font-semibold text-sm text-gray-900">{m.nombre}</p>
        {m.marca && <p className="text-xs text-gray-400">{m.marca}</p>}
      </div>
    )},
    { header: 'Categoría', cell: m => <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-bold">{m.categoria ?? '—'}</span> },
    { header: 'Unidad', cell: m => <span className="text-sm text-gray-500">{m.unidad_medida}</span> },
    {
      header: 'Stock Total',
      cell: m => {
        const total = m.existencias?.reduce((s, e) => s + e.cantidad, 0) ?? 0;
        const st = getStockStatus(m);
        return (
          <div className="flex items-center gap-2">
            <span className="font-black text-xl text-gray-900">{total}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${st.cls}`}>{st.label}</span>
          </div>
        );
      }
    },
    { header: 'Mín.', cell: m => <span className="text-sm text-gray-400 font-mono">{m.stock_minimo}</span> },
    {
      header: 'Acciones',
      cell: m => (
        <button onClick={() => { setAjusteForm({ ...ajusteForm, material_id: String(m.id) }); setShowAjuste(true); }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg transition-colors">
          <ArrowDownCircle size={13} /> Entrada
        </button>
      )
    },
  ];

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2"><div className="p-2 bg-violet-100 text-violet-600 rounded-lg"><Package size={24} /></div><h1 className="text-3xl font-extrabold text-gray-900">Inventario de Materiales</h1></div>
          <p className="text-gray-500">{meta.total} materiales registrados</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={ArrowDownCircle} onClick={() => setShowAjuste(!showAjuste)}>Ajustar Stock</Button>
          <Button variant="primary" icon={Plus} onClick={() => setShowCreate(!showCreate)}>Nuevo Material</Button>
        </div>
      </div>

      {showCreate && (
        <Card><CardContent className="p-6">
          <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-widest">Registrar Material</h3>
          <form onSubmit={handleCreate}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <FormGroup><Label>Código</Label><Input value={createForm.codigo} onChange={e => setCreateForm({ ...createForm, codigo: e.target.value })} required className="font-mono" /></FormGroup>
              <FormGroup className="col-span-2"><Label>Nombre</Label><Input value={createForm.nombre} onChange={e => setCreateForm({ ...createForm, nombre: e.target.value })} required /></FormGroup>
              <FormGroup><Label>Categoría</Label><Input value={createForm.categoria} onChange={e => setCreateForm({ ...createForm, categoria: e.target.value })} /></FormGroup>
              <FormGroup><Label>Unidad de Medida</Label><Input value={createForm.unidad_medida} onChange={e => setCreateForm({ ...createForm, unidad_medida: e.target.value })} required /></FormGroup>
              <FormGroup><Label>Marca</Label><Input value={createForm.marca} onChange={e => setCreateForm({ ...createForm, marca: e.target.value })} /></FormGroup>
              <FormGroup><Label>Precio Unitario</Label><Input type="number" step="0.01" value={createForm.precio_unitario} onChange={e => setCreateForm({ ...createForm, precio_unitario: e.target.value })} className="font-mono" /></FormGroup>
              <FormGroup><Label>Stock Mínimo</Label><Input type="number" min="0" value={createForm.stock_minimo} onChange={e => setCreateForm({ ...createForm, stock_minimo: e.target.value })} className="font-mono" /></FormGroup>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => setShowCreate(false)}>Cancelar</Button>
              <Button variant="primary" type="submit" isLoading={saving}>Registrar</Button>
            </div>
          </form>
        </CardContent></Card>
      )}

      {showAjuste && (
        <Card><CardContent className="p-6">
          <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-widest">Ajuste de Stock</h3>
          <form onSubmit={handleAjuste}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <FormGroup>
                <Label>Material</Label>
                <Select value={ajusteForm.material_id} onChange={e => setAjusteForm({ ...ajusteForm, material_id: e.target.value })} required>
                  <option value="">Seleccionar...</option>
                  {materiales.map(m => <option key={m.id} value={m.id}>{m.codigo} — {m.nombre}</option>)}
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Almacén</Label>
                <Select value={ajusteForm.almacen_id} onChange={e => setAjusteForm({ ...ajusteForm, almacen_id: e.target.value })} required>
                  <option value="">Seleccionar...</option>
                  {almacenes.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Tipo</Label>
                <Select value={ajusteForm.tipo} onChange={e => setAjusteForm({ ...ajusteForm, tipo: e.target.value })}>
                  <option value="entrada">Entrada de stock</option>
                  <option value="ajuste">Ajuste (establece stock exacto)</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Cantidad</Label>
                <Input type="number" min="1" value={ajusteForm.cantidad} onChange={e => setAjusteForm({ ...ajusteForm, cantidad: e.target.value })} required className="font-mono font-bold" />
              </FormGroup>
              <FormGroup className="md:col-span-4">
                <Label>Motivo</Label>
                <Input value={ajusteForm.motivo} onChange={e => setAjusteForm({ ...ajusteForm, motivo: e.target.value })} placeholder="Compra, donación, inventario físico..." />
              </FormGroup>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => setShowAjuste(false)}>Cancelar</Button>
              <Button variant="primary" type="submit" isLoading={saving}>Registrar Movimiento</Button>
            </div>
          </form>
        </CardContent></Card>
      )}

      <Card>
        <div className="p-4 border-b border-gray-100 bg-gray-50/60">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 max-w-sm">
            <Search size={15} className="text-gray-400" />
            <input className="flex-1 outline-none text-sm bg-transparent placeholder-gray-400" placeholder="Buscar código, nombre o categoría..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        {loading ? <div className="h-48 flex items-center justify-center"><div className="animate-spin rounded-full h-9 w-9 border-4 border-unich-purple border-t-transparent" /></div>
          : <Table columns={columns} data={materiales} />}
      </Card>
    </div>
  );
};
export default InventarioPage;
