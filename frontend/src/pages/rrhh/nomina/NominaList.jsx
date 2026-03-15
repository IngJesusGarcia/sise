import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Plus, Eye, CheckCircle, Clock, Banknote } from 'lucide-react';
import nominaService from '../../../services/nominaService';
import { Card } from '../../../components/ui/Card';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';

const ESTATUS_CFG = {
  borrador: { cls: 'bg-amber-100 text-amber-800', label: 'Borrador', icon: Clock },
  aprobada: { cls: 'bg-blue-100 text-blue-800',   label: 'Aprobada', icon: CheckCircle },
  pagada:   { cls: 'bg-emerald-100 text-emerald-800', label: 'Pagada', icon: Banknote },
};

const fmt = (n) => Number(n ?? 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

const NominaList = () => {
  const [nominas, setNominas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNominas = async () => {
    setLoading(true);
    const data = await nominaService.getAll();
    setNominas(data.data ?? data);
    setLoading(false);
  };

  useEffect(() => { fetchNominas(); }, []);

  const handleCambiarEstatus = async (id, estatus) => {
    if (!window.confirm(`¿Cambiar estatus a "${estatus}"?`)) return;
    await nominaService.updateEstatus(id, estatus);
    fetchNominas();
  };

  const columns = [
    { header: 'Periodo', cell: row => <span className="font-semibold text-sm text-unich-purple">{row.periodo}</span> },
    { header: 'Tipo',    cell: row => <span className="text-xs uppercase font-bold px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">{row.tipo}</span> },
    { header: 'Fecha Pago', cell: row => <span className="text-sm font-mono text-gray-600">{row.fecha_pago}</span> },
    { header: 'Empleados', cell: row => <span className="font-semibold text-gray-700">{row.total_empleados}</span> },
    { header: 'Total Percepciones', cell: row => <span className="text-sm font-mono text-gray-700">{fmt(row.total_percepciones)}</span> },
    { header: 'Total Deducciones',  cell: row => <span className="text-sm font-mono text-red-600">{fmt(row.total_deducciones)}</span> },
    { header: 'Neto Total',         cell: row => <span className="text-sm font-mono font-black text-emerald-700">{fmt(row.total_neto)}</span> },
    {
      header: 'Estatus',
      cell: row => {
        const cfg = ESTATUS_CFG[row.estatus] ?? { cls: 'bg-gray-100 text-gray-600', label: row.estatus };
        return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${cfg.cls}`}>{cfg.label}</span>;
      }
    },
    {
      header: 'Acciones',
      cell: row => (
        <div className="flex gap-1 justify-end">
          <button onClick={() => navigate(`/rrhh/nominas/${row.id}`)}
            className="p-2 text-gray-400 hover:text-unich-purple hover:bg-unich-purple/10 rounded-lg transition-colors">
            <Eye size={16} />
          </button>
          {row.estatus === 'borrador' && (
            <button onClick={() => handleCambiarEstatus(row.id, 'aprobada')}
              className="px-2.5 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg font-bold transition-colors">
              Aprobar
            </button>
          )}
          {row.estatus === 'aprobada' && (
            <button onClick={() => handleCambiarEstatus(row.id, 'pagada')}
              className="px-2.5 py-1 text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg font-bold transition-colors">
              Marcar Pagada
            </button>
          )}
        </div>
      )
    },
  ];

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><DollarSign size={24} /></div>
            <h1 className="text-3xl font-extrabold text-gray-900">Nómina</h1>
          </div>
          <p className="text-gray-500">Generación y seguimiento del pago de nóminas de empleados.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => navigate('/rrhh/nominas/nuevo')}>
          Generar Nómina
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="h-52 flex items-center justify-center">
            <div className="animate-spin rounded-full h-9 w-9 border-4 border-unich-purple border-t-transparent" />
          </div>
        ) : nominas.length === 0 ? (
          <div className="h-52 flex items-center justify-center flex-col gap-3 text-gray-400">
            <DollarSign size={40} className="opacity-30" />
            <p className="font-medium">No hay nóminas generadas aún.</p>
          </div>
        ) : <Table columns={columns} data={nominas} />}
      </Card>
    </div>
  );
};

export default NominaList;
