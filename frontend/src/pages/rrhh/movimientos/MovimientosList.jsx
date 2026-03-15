import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightLeft, Plus, Search } from 'lucide-react';
import rrhhService from '../../../services/rrhhService';
import empleadosService from '../../../services/empleadosService';
import { Card } from '../../../components/ui/Card';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Form';
import { FormGroup, Label, Input } from '../../../components/ui/Form';
import { CardContent } from '../../../components/ui/Card';

const TIPOS = ['ingreso','cambio_puesto','cambio_dpto','aumento','baja','reingreso'];
const MOV_CFG = {
  ingreso:      'bg-emerald-100 text-emerald-800',
  cambio_puesto:'bg-blue-100 text-blue-800',
  cambio_dpto:  'bg-indigo-100 text-indigo-800',
  aumento:      'bg-amber-100 text-amber-800',
  baja:         'bg-red-100 text-red-800',
  reingreso:    'bg-violet-100 text-violet-800',
};

const MovimientosList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [empleados, setEmpleados] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [form, setForm] = useState({
    empleado_id: '', tipo_movimiento: 'cambio_puesto',
    fecha_movimiento: new Date().toISOString().split('T')[0],
    puesto_id: '', departamento_id: '', salario_nuevo: '', motivo: '',
  });

  const fetchAll = async () => {
    setLoading(true);
    const data = await rrhhService.getMovimientos({ tipo_movimiento: filtro || undefined });
    setItems(data.data ?? data);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [filtro]);
  useEffect(() => {
    empleadosService.getAll({ per_page: 200 }).then(d => setEmpleados(d.data ?? d));
    rrhhService.getDepartamentos().then(setDepartamentos);
    rrhhService.getPuestos().then(setPuestos);
  }, []);

  const handleForm = e => setForm({ ...form, [e.target.id]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      await rrhhService.createMovimiento(form);
      setShowForm(false);
      fetchAll();
    } catch (err) { alert(err.response?.data?.message ?? 'Error al registrar.'); }
    finally { setSaving(false); }
  };

  const columns = [
    {
      header: 'Tipo',
      cell: row => <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${MOV_CFG[row.tipo_movimiento] ?? 'bg-gray-100 text-gray-600'}`}>
        {String(row.tipo_movimiento).replace('_', ' ')}
      </span>
    },
    { header: 'Empleado', cell: row => (
      <div>
        <p className="text-sm font-semibold text-gray-800">{row.empleado?.nombre} {row.empleado?.apellido_paterno}</p>
        <p className="text-xs font-mono text-gray-500">{row.empleado?.numero_empleado}</p>
      </div>
    )},
    { header: 'Puesto Nuevo', cell: row => <span className="text-sm text-gray-600">{row.puesto?.nombre ?? '—'}</span> },
    { header: 'Salario Nuevo', cell: row => row.salario_nuevo
      ? <span className="text-sm font-mono font-bold text-emerald-700">${Number(row.salario_nuevo).toLocaleString()}</span>
      : <span className="text-gray-300">—</span>
    },
    { header: 'Motivo', cell: row => <span className="text-xs text-gray-500 max-w-[200px] block truncate" title={row.motivo}>{row.motivo ?? '—'}</span> },
    { header: 'Fecha', cell: row => <span className="text-sm font-mono text-gray-600">{row.fecha_movimiento}</span> },
  ];

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><ArrowRightLeft size={24} /></div>
            <h1 className="text-3xl font-extrabold text-gray-900">Movimientos de Empleados</h1>
          </div>
          <p className="text-gray-500">Historial de altas, bajas, cambios de puesto y aumentos salariales.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : 'Registrar Movimiento'}
        </Button>
      </div>

      {/* Inline form */}
      {showForm && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-gray-700 mb-5 text-sm uppercase tracking-widest">Nuevo Movimiento</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                <FormGroup>
                  <Label htmlFor="empleado_id">Empleado</Label>
                  <Select id="empleado_id" value={form.empleado_id} onChange={handleForm} required>
                    <option value="">Seleccionar...</option>
                    {empleados.map(e => <option key={e.id} value={e.id}>{e.numero_empleado} — {e.nombre} {e.apellido_paterno}</option>)}
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="tipo_movimiento">Tipo de Movimiento</Label>
                  <Select id="tipo_movimiento" value={form.tipo_movimiento} onChange={handleForm}>
                    {TIPOS.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="fecha_movimiento">Fecha</Label>
                  <Input id="fecha_movimiento" type="date" value={form.fecha_movimiento} onChange={handleForm} required />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="puesto_id">Nuevo Puesto (opcional)</Label>
                  <Select id="puesto_id" value={form.puesto_id} onChange={handleForm}>
                    <option value="">Sin cambio de puesto</option>
                    {puestos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="salario_nuevo">Nuevo Salario (opcional)</Label>
                  <Input id="salario_nuevo" type="number" step="0.01" min="0" value={form.salario_nuevo} onChange={handleForm} className="font-mono" />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="motivo">Motivo / Observaciones</Label>
                  <Input id="motivo" value={form.motivo} onChange={handleForm} placeholder="Describe el motivo..." />
                </FormGroup>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button variant="primary" type="submit" isLoading={saving}>Asentar Movimiento</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <div className="p-4 border-b border-gray-100 bg-gray-50/60 flex gap-3">
          <Select value={filtro} onChange={e => setFiltro(e.target.value)} className="text-sm">
            <option value="">Todos los tipos</option>
            {TIPOS.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </Select>
        </div>
        {loading ? (
          <div className="h-52 flex items-center justify-center">
            <div className="animate-spin rounded-full h-9 w-9 border-4 border-unich-purple border-t-transparent" />
          </div>
        ) : <Table columns={columns} data={items} />}
      </Card>
    </div>
  );
};

export default MovimientosList;
