import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, Download, CheckCircle, XCircle, Clock, Trash2, Edit2, History } from 'lucide-react';
import { correspondenciaService } from '../../../services/correspondenciaService';
import { Card, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { FormGroup, Label } from '../../../components/ui/Form';

const ESTATUS_CFG = {
  registrado:  { cls: 'bg-gray-100 text-gray-700',       icon: Clock,       label: 'Registrado' },
  en_proceso:  { cls: 'bg-amber-100 text-amber-800',     icon: Clock,       label: 'En Proceso' },
  aprobado:    { cls: 'bg-emerald-100 text-emerald-800', icon: CheckCircle, label: 'Aprobado' },
  rechazado:   { cls: 'bg-red-100 text-red-700',         icon: XCircle,     label: 'Rechazado' },
};

const DocumentoView = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAprobarModal, setShowAprobarModal] = useState(false);
  const [aprobarForm, setAprobarForm] = useState({ estatus: 'aprobado', comentarios: '' });
  const [saving, setSaving] = useState(false);

  const fetchDoc = () => {
    correspondenciaService.getDocumento(id)
      .then(setDoc)
      .catch((e) => { alert('Documento no encontrado: ' + (e.response?.data?.message || e.message)); nav('/correspondencia/documentos'); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDoc(); }, [id, nav]);

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este documento definitivamente?')) return;
    try {
      await correspondenciaService.deleteDocumento(id);
      nav('/correspondencia/documentos');
    } catch (err) { alert(err.response?.data?.message ?? 'Error.'); }
  };

  const handleAprobarSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await correspondenciaService.aprobarDocumento(id, aprobarForm);
      setShowAprobarModal(false);
      fetchDoc();
    } catch (err) { alert(err.response?.data?.message ?? 'Error registrando aprobación.'); }
    finally { setSaving(false); }
  };

  const downloadFileUrl = doc?.archivo ? `http://localhost:8000/storage/${doc.archivo}` : null;

  if (loading) return <div className="h-64 flex items-center justify-center"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!doc) return null;

  const CfgEst = ESTATUS_CFG[doc.estatus] ?? ESTATUS_CFG.registrado;
  const EstIcon = CfgEst.icon;

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-4">
          <button onClick={() => nav(-1)} className="p-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 border-l-4 border-indigo-600 pl-3">Oficio {doc.folio}</h1>
            <p className="text-sm text-gray-500 pl-4">{doc.tipo?.nombre ?? 'Documento'} — Registrado el {doc.fecha}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {doc.archivo && (
            <a href={downloadFileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 font-bold text-sm rounded-xl hover:bg-blue-100 transition">
              <Download size={16} /> Ver PDF / Archivo
            </a>
          )}
          <Button variant="outline" icon={Edit2} onClick={() => nav(`/correspondencia/documentos/editar/${doc.id}`)}>Editar</Button>
          <button onClick={handleDelete} className="px-3 py-2 bg-white border border-red-200 text-red-600 font-bold text-sm rounded-xl hover:bg-red-50 transition"><Trash2 size={16} /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Detail Panel */}
        <Card className="md:col-span-2 space-y-0 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-black text-gray-800 flex items-center gap-2"><FileText size={18} className="text-indigo-600" /> Detalles Generales</h2>
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${CfgEst.cls}`}><EstIcon size={14} />{CfgEst.label}</span>
          </div>
          <CardContent className="p-6 space-y-6">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Asunto</p>
              <p className="text-lg font-semibold text-gray-900 leading-snug">{doc.asunto}</p>
            </div>
            {doc.descripcion && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Descripción</p>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap">{doc.descripcion}</div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
              <div>
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Desde Área / Origen</p>
                <p className="font-semibold text-indigo-900">{doc.area_origen}</p>
                <p className="text-sm text-indigo-600 flex items-center gap-1 mt-1"><span className="text-xs font-medium text-indigo-300">Responsable:</span> {doc.creado_por?.name ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Hacia Área / Destino</p>
                <p className="font-semibold text-indigo-900">{doc.area_destino}</p>
                <p className="text-sm text-indigo-600 flex items-center gap-1 mt-1"><span className="text-xs font-medium text-indigo-300">Dirigido a:</span> {doc.responsable ?? '—'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Approval Panel */}
        <div className="space-y-6">
          <Card>
            <div className="bg-white px-5 py-4 border-b border-gray-100 flex justify-between items-center rounded-t-xl">
              <h2 className="font-black text-gray-800 flex items-center gap-2"><History size={16} className="text-indigo-600" /> Seguimiento</h2>
            </div>
            <CardContent className="p-5">
              {doc.estatus !== 'aprobado' && doc.estatus !== 'archivado' && (
                <button onClick={() => setShowAprobarModal(true)} className="w-full mb-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition">
                  Registrar Firma / Revisión
                </button>
              )}

              <div className="relative border-l-2 border-indigo-100 ml-3 space-y-6">
                {(doc.aprobaciones ?? []).length === 0 ? (
                  <p className="text-sm text-gray-400 italic pl-6">Aún no hay revisiones registradas.</p>
                ) : (
                  doc.aprobaciones.map((a, i) => {
                    const Acest = ESTATUS_CFG[a.estatus] ?? { cls: 'bg-gray-100 text-gray-600', icon: Clock, label: a.estatus };
                    const AIcon = Acest.icon;
                    return (
                      <div key={a.id} className="relative pl-6">
                        <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center ${Acest.cls}`}>
                          <AIcon size={12} />
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <p className="text-sm py-0.5 space-x-2">
                            <span className="font-bold text-gray-900">{a.usuario?.name}</span>
                            <span className={`text-[10px] font-bold uppercase ${Acest.cls.replace('bg-', 'text-').split(' ')[1]}`}>{Acest.label}</span>
                          </p>
                          <p className="text-xs text-gray-400 font-mono mb-2">{new Date(a.fecha).toLocaleString('es-MX')}</p>
                          {a.comentarios && <p className="text-sm text-gray-700 bg-white p-2 border border-gray-200 rounded">{a.comentarios}</p>}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal isOpen={showAprobarModal} onClose={() => setShowAprobarModal(false)} title="Actualizar Estatus del Oficio">
        <form onSubmit={handleAprobarSubmit} className="space-y-4">
          <FormGroup>
            <Label htmlFor="estatus">Resolución / Acción *</Label>
            <select id="estatus" value={aprobarForm.estatus} onChange={e => setAprobarForm({ ...aprobarForm, estatus: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 text-sm">
              <option value="aprobado">Aprobar / Firmar</option>
              <option value="rechazado">Rechazar / Cancelar</option>
              <option value="en_revision">Dejar En Revisión / Trámite</option>
            </select>
          </FormGroup>
          <FormGroup>
            <Label htmlFor="comentarios">Comentarios / Observaciones (Opcional)</Label>
            <textarea id="comentarios" value={aprobarForm.comentarios} onChange={e => setAprobarForm({ ...aprobarForm, comentarios: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 text-sm" rows="3" placeholder="Anota cualquier observación sobre la revisión..." />
          </FormGroup>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="outline" type="button" onClick={() => setShowAprobarModal(false)}>Cancelar</Button>
            <Button variant="primary" type="submit" isLoading={saving}>Guardar Revisión</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default DocumentoView;
