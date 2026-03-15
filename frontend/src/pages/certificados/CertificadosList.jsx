import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileBadge, Plus, Search, FileText, Ban, Printer } from 'lucide-react';
import certificadosService from '../../services/certificadosService';
import { Card } from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';

const CertificadosList = () => {
  const [certificados, setCertificados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCertificados();
  }, []);

  const fetchCertificados = async () => {
    try {
      setLoading(true);
      const data = await certificadosService.getAll();
      setCertificados(data);
    } catch (error) {
      console.error('Error fetching certificados:', error);
      alert('Error al cargar la lista de documentos.');
    } finally {
      setLoading(false);
    }
  };

  const handeInvalidate = async (id) => {
    if (!window.confirm('¿Está seguro de invalidar este documento oficial? Esta acción no se puede deshacer.')) return;
    try {
      await certificadosService.invalidate(id);
      fetchCertificados();
    } catch (err) {
      console.error(err);
      alert('Error al invalidar documento.');
    }
  };

  const filteredData = certificados.filter(c => {
    const searchString = `${c.folio} ${c.alumno?.nombre} ${c.alumno?.apellido_paterno} ${c.alumno?.matricula}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const columns = [
    { header: 'Folio', accessor: 'folio', cell: (row) => <span className="font-mono font-bold text-sm text-unich-purple">{row.folio}</span> },
    { 
      header: 'Estudiante', 
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800 text-sm">
            {row.alumno?.nombre} {row.alumno?.apellido_paterno}
          </span>
          <span className="text-xs text-gray-500 font-mono">{row.alumno?.matricula}</span>
        </div>
      )
    },
    { 
      header: 'Tipo de Documento', 
      cell: (row) => (
        <span className="capitalize text-sm font-medium text-gray-700">
          {row.tipo.replace('_', ' ')}
        </span>
      )
    },
    { 
      header: 'Fecha Emisión', 
      cell: (row) => <span className="text-sm text-gray-600">{new Date(row.fecha_generacion).toLocaleDateString('es-MX')}</span> 
    },
    {
      header: 'Estatus',
      cell: (row) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${row.vigente ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {row.vigente ? 'VIGENTE' : 'INVALIDADO'}
        </span>
      )
    },
    {
      header: 'Acciones',
      cell: (row) => (
        <div className="flex gap-1 justify-end">
          <button 
            disabled={!row.vigente}
            className={`p-2 rounded-lg transition-colors ${row.vigente ? 'text-gray-400 hover:text-blue-600 hover:bg-blue-50' : 'text-gray-300 cursor-not-allowed'}`}
            title="Reimprimir Documento"
          >
            <Printer size={18} />
          </button>
          <button 
            disabled={!row.vigente}
            onClick={() => handeInvalidate(row.id)}
            className={`p-2 rounded-lg transition-colors ${row.vigente ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-300 cursor-not-allowed'}`}
            title="Invalidar"
          >
            <Ban size={18} />
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
            <div className="p-2 bg-unich-purple/10 text-unich-purple rounded-lg">
              <FileBadge size={24} />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Emisión de Certificados</h1>
          </div>
          <p className="text-gray-500">Historial y folios de generación de constancias, certificados y cartas pasantes.</p>
        </div>
        
        <Button variant="primary" icon={Plus} onClick={() => navigate('/certificados/nuevo')}>
          Generar Documento
        </Button>
      </div>

      <Card>
        <div className="p-0">
          {loading ? (
             <div className="h-64 flex flex-col items-center justify-center space-y-4">
               <div className="animate-spin rounded-full h-10 w-10 border-4 border-unich-purple border-t-transparent"></div>
               <p className="text-gray-500 font-medium">Cargando folios...</p>
             </div>
          ) : (
            <Table 
              columns={columns} 
              data={filteredData} 
              onSearch={setSearchTerm}
              searchPlaceholder="Buscar por folio o alumno..."
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default CertificadosList;
