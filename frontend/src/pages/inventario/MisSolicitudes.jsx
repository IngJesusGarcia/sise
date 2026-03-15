import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList, Plus, Clock, CheckCircle, XCircle,
  Package, ChevronDown, ChevronUp, AlertTriangle
} from 'lucide-react';
import { solicitudesService, inventarioService } from '../../services/inventarioService';

/* ── Helpers ───────────────────────────────────────────────────── */
const ESTATUS = {
  pendiente: { cls: 'bg-amber-100 text-amber-800 border-amber-200',   icon: Clock,         label: 'Pendiente de revisión' },
  aprobada:  { cls: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle, label: 'Aprobada ✓' },
  rechazada: { cls: 'bg-red-100 text-red-700 border-red-200',          icon: XCircle,       label: 'Rechazada' },
  entregada: { cls: 'bg-blue-100 text-blue-800 border-blue-200',       icon: CheckCircle,   label: 'Entregada' },
};

const EstatusBadge = ({ estatus }) => {
  const cfg = ESTATUS[estatus] ?? ESTATUS.pendiente;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.cls}`}>
      <Icon size={12} /> {cfg.label}
    </span>
  );
};

/* ── Component ─────────────────────────────────────────────────── */
const MisSolicitudes = () => {
  const [solicitudes, setSolicitudes]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [saving, setSaving]             = useState(false);
  const [expandedId, setExpandedId]     = useState(null);
  const [almacenes, setAlmacenes]       = useState([]);
  const [materiales, setMateriales]     = useState([]);
  const [filtro, setFiltro]             = useState('');
  const [form, setForm] = useState({
    almacen_id: '',
    motivo: '',
    detalles: [{ material_id: '', cantidad_solicitada: 1 }],
  });

  /* fetch own solicitudes */
  const fetchSolicitudes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await solicitudesService.getAll({ mis: 1, per_page: 50 });
      setSolicitudes(data.data ?? data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSolicitudes(); }, [fetchSolicitudes]);

  useEffect(() => {
    inventarioService.getAlmacenes().then(setAlmacenes);
    inventarioService.getMateriales({ per_page: 500 }).then(d => setMateriales(d.data ?? d));
  }, []);

  /* form helpers */
  const addDetalle = () =>
    setForm(f => ({ ...f, detalles: [...f.detalles, { material_id: '', cantidad_solicitada: 1 }] }));

  const removeDetalle = (i) =>
    setForm(f => ({ ...f, detalles: f.detalles.filter((_, idx) => idx !== i) }));

  const updateDetalle = (i, key, val) =>
    setForm(f => {
      const d = [...f.detalles];
      d[i] = { ...d[i], [key]: val };
      return { ...f, detalles: d };
    });

  const resetForm = () =>
    setForm({ almacen_id: '', motivo: '', detalles: [{ material_id: '', cantidad_solicitada: 1 }] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.detalles.some(d => !d.material_id)) {
      alert('Selecciona un material en cada fila.');
      return;
    }
    setSaving(true);
    try {
      await solicitudesService.create(form);
      setShowForm(false);
      resetForm();
      fetchSolicitudes();
    } catch (err) {
      alert(err.response?.data?.message ?? 'Error al enviar la solicitud.');
    } finally {
      setSaving(false);
    }
  };

  /* derived */
  const filtered = filtro
    ? solicitudes.filter(s => s.estatus === filtro)
    : solicitudes;

  const counts = {
    pendiente: solicitudes.filter(s => s.estatus === 'pendiente').length,
    aprobada:  solicitudes.filter(s => s.estatus === 'aprobada').length,
    rechazada: solicitudes.filter(s => s.estatus === 'rechazada').length,
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6 pb-12">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-violet-100 text-violet-600 rounded-xl">
              <Package size={24} />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">Mis Solicitudes de Material</h1>
          </div>
          <p className="text-gray-400 text-sm ml-14">
            Solicita materiales al almacén y consulta el estatus de tus pedidos.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
            showForm
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-unich-purple text-white hover:bg-unich-purple/90 shadow-unich-purple/20'
          }`}
        >
          <Plus size={16} className={showForm ? 'rotate-45 transition-transform' : 'transition-transform'} />
          {showForm ? 'Cancelar' : 'Nueva Solicitud'}
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pendientes', key: 'pendiente', color: 'amber', icon: Clock },
          { label: 'Aprobadas',  key: 'aprobada',  color: 'emerald', icon: CheckCircle },
          { label: 'Rechazadas', key: 'rechazada', color: 'red',    icon: XCircle },
        ].map(({ label, key, color, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setFiltro(filtro === key ? '' : key)}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${
              filtro === key
                ? `bg-${color}-50 border-${color}-300`
                : 'bg-white border-gray-100 hover:border-gray-200'
            }`}
          >
            <Icon size={20} className={`text-${color}-500 mb-2`} />
            <p className="text-2xl font-black text-gray-900">{counts[key]}</p>
            <p className="text-xs text-gray-400 font-semibold">{label}</p>
          </button>
        ))}
      </div>

      {/* ── Inline Form ── */}
      {showForm && (
        <div className="bg-white border-2 border-unich-purple/20 rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-unich-purple/5 to-unich-magenta/5 px-6 py-4 border-b border-gray-100">
            <h2 className="font-black text-gray-800">📋 Nueva Solicitud de Materiales</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Selecciona el almacén y los materiales que necesitas. Recibirás una notificación cuando sea aprobada.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Almacén + Motivo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Almacén de origen *
                </label>
                <select
                  value={form.almacen_id}
                  onChange={e => setForm(f => ({ ...f, almacen_id: e.target.value }))}
                  required
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-unich-purple focus:ring-2 focus:ring-unich-purple/10"
                >
                  <option value="">Seleccionar almacén...</option>
                  {almacenes.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Motivo / Justificación
                </label>
                <input
                  type="text"
                  value={form.motivo}
                  onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))}
                  placeholder="¿Para qué se necesita este material?"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-unich-purple focus:ring-2 focus:ring-unich-purple/10"
                />
              </div>
            </div>

            {/* Materiales */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Materiales solicitados *
                </label>
                <button type="button" onClick={addDetalle}
                  className="text-xs font-bold text-unich-purple hover:text-unich-magenta transition-colors">
                  + Agregar material
                </button>
              </div>
              <div className="space-y-2">
                {form.detalles.map((d, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <select
                      value={d.material_id}
                      onChange={e => updateDetalle(i, 'material_id', e.target.value)}
                      required
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-unich-purple"
                    >
                      <option value="">Seleccionar material...</option>
                      {materiales.map(m => (
                        <option key={m.id} value={m.id}>{m.codigo} — {m.nombre} ({m.unidad_medida})</option>
                      ))}
                    </select>
                    <input
                      type="number" min="1"
                      value={d.cantidad_solicitada}
                      onChange={e => updateDetalle(i, 'cantidad_solicitada', e.target.value)}
                      required
                      placeholder="Cant."
                      className="w-20 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-center focus:outline-none focus:border-unich-purple"
                    />
                    {form.detalles.length > 1 && (
                      <button type="button" onClick={() => removeDetalle(i)}
                        className="text-red-400 hover:text-red-600 font-bold text-lg leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors">
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Info note */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <AlertTriangle size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-600">
                Recibirás una <strong>notificación</strong> (campana 🔔 en la barra superior) cuando Recursos Materiales apruebe o rechace tu solicitud.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={saving}
                className="px-6 py-2 bg-unich-purple text-white rounded-xl text-sm font-bold hover:bg-unich-purple/90 transition-colors disabled:opacity-60 flex items-center gap-2">
                {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Enviar Solicitud
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Solicitudes List ── */}
      <div className="space-y-3">
        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-unich-purple border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <ClipboardList size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-semibold">
              {filtro ? `No tienes solicitudes con estatus "${filtro}".` : 'Aún no has hecho ninguna solicitud.'}
            </p>
            {!filtro && (
              <button onClick={() => setShowForm(true)}
                className="mt-4 px-4 py-2 bg-unich-purple text-white rounded-xl text-sm font-bold hover:bg-unich-purple/90 transition-colors">
                Crear mi primera solicitud
              </button>
            )}
          </div>
        ) : (
          filtered.map(s => {
            const isOpen = expandedId === s.id;
            return (
              <div key={s.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Summary row */}
                <button
                  onClick={() => setExpandedId(isOpen ? null : s.id)}
                  className="w-full flex items-center gap-4 p-4 text-left"
                >
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Folio</p>
                      <p className="font-black font-mono text-unich-purple text-sm">{s.folio}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Fecha</p>
                      <p className="text-sm font-semibold text-gray-700">{s.created_at?.split('T')[0]}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Almacén</p>
                      <p className="text-sm text-gray-700 truncate">{s.almacen?.nombre ?? '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <EstatusBadge estatus={s.estatus} />
                    {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="border-t border-gray-50 px-4 pb-4">
                    {s.motivo && (
                      <p className="text-xs text-gray-400 mb-3 pt-3">
                        <span className="font-bold text-gray-600">Motivo:</span> {s.motivo}
                      </p>
                    )}
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 pt-3">Materiales</p>
                    <div className="space-y-1.5">
                      {(s.detalles ?? []).map(d => (
                        <div key={d.id}
                          className="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl text-sm">
                          <span className="font-semibold text-gray-800">{d.material?.nombre}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 font-mono">
                              Solicitado: <strong>{d.cantidad_solicitada}</strong>
                            </span>
                            {s.estatus === 'aprobada' && (
                              <span className="text-xs text-emerald-600 font-mono">
                                Entregado: <strong>{d.cantidad_entregada}</strong>
                              </span>
                            )}
                            <span className="text-xs text-gray-400">{d.material?.unidad_medida}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MisSolicitudes;
