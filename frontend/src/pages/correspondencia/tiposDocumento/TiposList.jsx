import React, { useState, useEffect, useCallback } from 'react';
import { Layers, Plus, Edit2, Trash2 } from 'lucide-react';
import { correspondenciaService } from '../../../services/correspondenciaService';
import { Card, CardContent } from '../../../components/ui/Card';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import { FormGroup, Label, Input, Select } from '../../../components/ui/Form';
import Modal from '../../../components/ui/Modal';

const TiposList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingParams, setEditingParams] = useState(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '', activo: true });
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await correspondenciaService.getTipos();
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleEdit = (item) => {
    setEditingParams(item);
    setForm({ nombre: item.nombre, descripcion: item.descripcion ?? '', activo: !!item.activo });
    setShowModal(true);
  };

  const handleNew = () => {
    setEditingParams(null);
    setForm({ nombre: '', descripcion: '', activo: true });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingParams) {
        await correspondenciaService.updateTipo(editingParams.id, form);
      } else {
        await correspondenciaService.createTipo(form);
      }
      setShowModal(false);
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.message ?? 'Error saving type.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este tipo de documento?')) return;
    try {
      await correspondenciaService.deleteTipo(id);
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.message ?? 'Error deleting. May have documents attached.');
    }
  };

  const columns = [
    { header: 'Nombre', cell: r => <span className="font-bold text-gray-800">{r.nombre}</span> },
    { header: 'Descripción', cell: r => <span className="text-gray-500 text-sm truncate max-w-sm block">{r.descripcion || '—'}</span> },
    { header: 'Estatus', cell: r => (
      <span className={`px-2 py-1 text-xs font-bold rounded-full ${r.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
        {r.activo ? 'Activo' : 'Inactivo'}
      </span>
    )},
    {
      header: 'Acciones',
      cell: r => (
        <div className="flex gap-2 justify-end">
          <button onClick={() => handleEdit(r)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
          <button onClick={() => handleDelete(r.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
        </div>
      )
    }
  ];

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Layers size={24} /></div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Tipos de Documento</h1>
            <p className="text-gray-500 text-sm">Gestiona los tipos de oficios y correspondencia.</p>
          </div>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleNew}>Nuevo Tipo</Button>
      </div>

      <Card>
        {loading ? <div className="h-40 flex items-center justify-center animate-spin"><div className="w-8 h-8 focus:outline-none border-4 border-t-transparent border-indigo-600 rounded-full" /></div>
          : <Table columns={columns} data={items} />}
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingParams ? 'Editar Tipo' : 'Nuevo Tipo'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormGroup>
            <Label htmlFor="nombre">Nombre del tipo *</Label>
            <Input id="nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required autoFocus placeholder="Ej. Oficio, Circular, Memorándum" />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="descripcion">Descripción</Label>
            <textarea id="descripcion" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 text-sm" rows="3" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
          </FormGroup>
          <FormGroup>
            <Label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.activo} onChange={e => setForm({ ...form, activo: e.target.checked })} className="rounded text-indigo-600 focus:ring-indigo-500" />
              <span>Activo y disponible para registro</span>
            </Label>
          </FormGroup>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button variant="primary" type="submit" isLoading={saving}>Guardar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default TiposList;
