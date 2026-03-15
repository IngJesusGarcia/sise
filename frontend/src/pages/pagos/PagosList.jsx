import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Plus, FileText } from 'lucide-react';
import pagosService from '../../services/pagosService';
import { Card } from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';

const PagosList = () => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPagos();
  }, []);

  const fetchPagos = async () => {
    try {
      setLoading(true);
      const data = await pagosService.getAll();
      setPagos(data);
    } catch (error) {
      console.error('Error fetching pagos:', error);
      alert('Error al cargar historial de pagos.');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = pagos.filter(p => {
    const searchString = `${p.referencia} ${p.estudiante?.nombre} ${p.estudiante?.apellido_paterno} ${p.estudiante?.matricula} ${p.concepto}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const columns = [
    { 
      header: 'Referencia/Operación', 
      accessor: 'referencia', 
      cell: (row) => <span className="font-mono font-bold text-sm text-gray-700">{row.referencia}</span> 
    },
    { 
      header: 'Estudiante', 
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800 text-sm">
            {row.estudiante?.nombre} {row.estudiante?.apellido_paterno}
          </span>
          <span className="text-xs text-gray-500 font-mono">{row.estudiante?.matricula}</span>
        </div>
      )
    },
    { 
      header: 'Concepto (Trámite)', 
      cell: (row) => <span className="text-sm font-medium text-gray-600">{row.concepto}</span>
    },
    {
      header: 'Monto Recibido',
      cell: (row) => (
        <span className="text-sm font-black text-unich-purple">
          ${Number(row.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        </span>
      )
    },
    { 
      header: 'Fecha Pago', 
      cell: (row) => <span className="text-sm text-gray-600 font-mono">{row.fecha_pago}</span> 
    },
    {
      header: 'Estatus',
      cell: (row) => (
        <span className={`px-2 py-0.5 text-[11px] font-bold tracking-widest uppercase rounded-full ${row.estatus === 'pagado' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {row.estatus}
        </span>
      )
    },
    {
      header: 'Acciones',
      cell: (row) => (
        <div className="flex gap-1 justify-end">
          <button 
            className="p-2 rounded-lg text-gray-400 hover:text-unich-purple hover:bg-unich-purple/10 transition-colors"
            title="Ver Recibo Oficial"
          >
            <FileText size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <CreditCard size={24} />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Historial de Pagos</h1>
          </div>
          <p className="text-gray-500">Gestión financiera, ingresos por colegiatura y servicios a escolares.</p>
        </div>
        
        <Button variant="primary" icon={Plus} onClick={() => navigate('/pagos/nuevo')}>
          Registrar Ingreso
        </Button>
      </div>

      <Card>
        <div className="p-0">
          {loading ? (
             <div className="h-64 flex flex-col items-center justify-center space-y-4">
               <div className="animate-spin rounded-full h-10 w-10 border-4 border-unich-purple border-t-transparent"></div>
               <p className="text-gray-500 font-medium">Sincronizando caja...</p>
             </div>
          ) : (
            <Table 
              columns={columns} 
              data={filteredData} 
              onSearch={setSearchTerm}
              searchPlaceholder="Buscar por Ref. de banco, concepto o alumno..."
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default PagosList;
