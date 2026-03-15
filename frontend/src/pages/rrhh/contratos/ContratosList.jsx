import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Eye, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';
import contratosService from '../../../services/contratosService';
import empleadosService from '../../../services/empleadosService';
import { Card } from '../../../components/ui/Card';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Form';

const fmt = (n) => Number(n ?? 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

const ContratosList = () => {
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroActivo, setFiltroActivo] = useState('');
  const [meta, setMeta] = useState({ total: 0, last_page: 1, current_page: 1 });
  const navigate = useNavigate();

  const fetchContratos = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await contratosService.getAll({
        activo: filtroActivo !== '' ? filtroActivo : undefined,
        page, per_page: 20,
      });
      setContratos(data.data ?? data);
      setMeta({ total: data.total ?? 0, last_page: data.last_page ?? 1, current_page: data.current_page ?? 1 });
    } finally { setLoading(false); }
  }, [filtroActivo]);

  useEffect(() => { fetchContratos(); }, [fetchContratos]);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este contrato?')) return;
    await contratosService.destroy(id);
    fetchContratos();
  };

  const handlePrint = (c) => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Contrato ${c.numero_contrato}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        h1 { font-size: 20px; text-align: center; }
        .header { text-align: center; margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px 12px; text-align: left; font-size: 13px; }
        th { background: #f5f5f5; font-weight: bold; }
        .footer { margin-top: 60px; display: flex; justify-content: space-around; }
        .firma { text-align: center; border-top: 1px solid #333; width: 200px; padding-top: 6px; font-size: 12px; }
      </style></head><body>
      <div class="header">
        <h1>CONTRATO LABORAL</h1>
        <p>Universidad Intercultural de Chiapas — UNICH</p>
        <p>No. <strong>${c.numero_contrato}</strong></p>
      </div>
      <table>
        <tr><th>Empleado</th><td>${c.empleado?.nombre ?? ''} ${c.empleado?.apellido_paterno ?? ''} ${c.empleado?.apellido_materno ?? ''}</td></tr>
        <tr><th>Número de Empleado</th><td>${c.empleado?.numero_empleado ?? ''}</td></tr>
        <tr><th>Puesto</th><td>${c.empleado?.puesto?.nombre ?? '—'}</td></tr>
        <tr><th>Tipo de Contrato</th><td>${c.empleado?.tipo_contrato ?? '—'}</td></tr>
        <tr><th>Salario</th><td>${fmt(c.salario)}</td></tr>
        <tr><th>Fecha de Inicio</th><td>${c.fecha_inicio ?? ''}</td></tr>
        <tr><th>Fecha de Término</th><td>${c.fecha_fin ?? 'Indefinido'}</td></tr>
        <tr><th>Estatus</th><td>${c.activo ? 'VIGENTE' : 'INACTIVO'}</td></tr>
        ${c.observaciones ? `<tr><th>Observaciones</th><td>${c.observaciones}</td></tr>` : ''}
      </table>
      <div class="footer">
        <div class="firma">Empleado</div>
        <div class="firma">Representante Legal UNICH</div>
      </div>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  const columns = [
    { header: 'No. Contrato', cell: row => <span className="font-mono text-xs font-bold text-unich-purple">{row.numero_contrato}</span> },
    {
      header: 'Empleado',
      cell: row => (
        <div>
          <p className="text-sm font-semibold text-gray-900">{row.empleado?.nombre} {row.empleado?.apellido_paterno}</p>
          <p className="text-xs text-gray-400 font-mono">{row.empleado?.numero_empleado}</p>
        </div>
      )
    },
    { header: 'Puesto', cell: row => <span className="text-sm text-gray-600">{row.empleado?.puesto?.nombre ?? '—'}</span> },
    { header: 'Salario', cell: row => <span className="font-mono text-sm font-bold text-emerald-700">{fmt(row.salario)}</span> },
    { header: 'Inicio', cell: row => <span className="text-xs font-mono text-gray-500">{row.fecha_inicio}</span> },
    { header: 'Término', cell: row => <span className="text-xs font-mono text-gray-500">{row.fecha_fin ?? 'Indefinido'}</span> },
    {
      header: 'Vigente',
      cell: row => row.activo
        ? <span className="flex items-center gap-1 text-xs font-bold text-emerald-700"><CheckCircle size={13} /> Vigente</span>
        : <span className="flex items-center gap-1 text-xs font-bold text-gray-400"><XCircle size={13} /> Inactivo</span>
    },
    {
      header: 'Acciones',
      cell: row => (
        <div className="flex gap-1 justify-end">
          <button onClick={() => handlePrint(row)} title="Imprimir / PDF"
            className="p-2 text-gray-400 hover:text-unich-purple hover:bg-unich-purple/10 rounded-lg transition-colors">
            <Eye size={16} />
          </button>
          <button onClick={() => navigate(`/rrhh/contratos/editar/${row.id}`)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Pencil size={16} />
          </button>
          <button onClick={() => handleDelete(row.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      )
    },
  ];

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><FileText size={24} /></div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Contratos Laborales</h1>
          </div>
          <p className="text-gray-500">{meta.total} contratos registrados</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => navigate('/rrhh/contratos/nuevo')}>
          Nuevo Contrato
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 bg-gray-50/60 flex gap-3">
          <Select value={filtroActivo} onChange={e => setFiltroActivo(e.target.value)} className="text-sm">
            <option value="">Todos</option>
            <option value="1">Solo vigentes</option>
            <option value="0">Solo inactivos</option>
          </Select>
        </div>
        {loading ? (
          <div className="h-52 flex items-center justify-center">
            <div className="animate-spin rounded-full h-9 w-9 border-4 border-unich-purple border-t-transparent" />
          </div>
        ) : <Table columns={columns} data={contratos} />}
        {meta.last_page > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-center gap-2">
            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => fetchContratos(p)}
                className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                  meta.current_page === p ? 'bg-unich-purple text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}>{p}</button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ContratosList;
