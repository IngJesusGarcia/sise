import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Search, Printer, Download, GraduationCap, Calendar as CalendarIcon, FileCheck } from 'lucide-react';
import boletasService from '../../services/boletasService';
import { Card, CardContent } from '../../components/ui/Card';
import { FormGroup, Select } from '../../components/ui/Form';
import Button from '../../components/ui/Button';

const BoletaView = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  
  const [selectedEstId, setSelectedEstId] = useState('');
  const [selectedPeriodoId, setSelectedPeriodoId] = useState('');
  
  const [boletaData, setBoletaData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Referencia al componente para impresión
  const printRef = useRef();

  useEffect(() => {
    loadCatalogs();
  }, []);

  const loadCatalogs = async () => {
    try {
      const [estData, perData] = await Promise.all([
        boletasService.getEstudiantes(),
        boletasService.getPeriodos()
      ]);
      setEstudiantes(estData);
      setPeriodos(perData);
    } catch (err) {
      console.error('Error al cargar catálogos:', err);
    }
  };

  const handleConsultar = async () => {
    if (!selectedEstId || !selectedPeriodoId) return;

    try {
      setLoading(true);
      const data = await boletasService.getBoleta(selectedEstId, selectedPeriodoId);
      setBoletaData(data);
    } catch (err) {
      console.error('Error fetching boleta:', err);
      alert('Error al generar la boleta. Verifique que exista información para el periodo seleccionado.');
      setBoletaData(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Boleta_${boletaData?.alumno?.matricula || 'Escolar'}`,
    pageStyle: `
      @page { size: letter; margin: 15mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    `
  });

  const estatusCol = (val) => {
    if (val >= 6) return 'text-green-700 font-bold';
    if (val < 6 && val !== null) return 'text-red-600 font-bold';
    return 'text-gray-500';
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-6 pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-unich-purple/10 text-unich-purple rounded-lg">
              <FileCheck size={24} />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Boleta de Calificaciones</h1>
          </div>
          <p className="text-gray-500">Consulta y descarga del documento oficial de notas por periodo semestral.</p>
        </div>
      </div>

      {/* SEARCH FILTERS */}
      <Card>
        <div className="p-5 bg-gray-50 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-end">
          <FormGroup className="mb-0 flex-1">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 pl-1">Seleccionar Estudiante</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-gray-400" size={18} />
              </div>
              <Select 
                value={selectedEstId}
                onChange={(e) => setSelectedEstId(e.target.value)}
                className="pl-10 shadow-sm border-gray-300"
              >
                <option value="">Buscar por matrícula o nombre...</option>
                {estudiantes.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.matricula} — {e.apellido_paterno} {e.apellido_materno} {e.nombre}
                  </option>
                ))}
              </Select>
            </div>
          </FormGroup>

          <FormGroup className="mb-0 w-full md:w-64">
             <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 pl-1">Ciclo Escolar</label>
             <Select 
                value={selectedPeriodoId}
                onChange={(e) => setSelectedPeriodoId(e.target.value)}
                className="shadow-sm border-gray-300"
              >
                <option value="">Seleccione el periodo...</option>
                {periodos.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
            </Select>
          </FormGroup>

          <Button 
            variant="primary" 
            icon={Search} 
            onClick={handleConsultar}
            disabled={!selectedEstId || !selectedPeriodoId}
            isLoading={loading}
            className="w-full md:w-auto mt-2 md:mt-0"
          >
            Consultar
          </Button>
        </div>
      </Card>

      {/* BOLETA PREVIEW & RENDER */}
      {boletaData && (
        <div className="space-y-4">
          <div className="flex justify-end gap-3">
             {/* Fake download PDF logic mapping to print for simplicity/browser support */}
             <Button variant="outline" icon={Download} onClick={handlePrint}>
                Descargar PDF
             </Button>
             <Button variant="primary" icon={Printer} onClick={handlePrint}>
                Imprimir Documento
             </Button>
          </div>

          <Card className="overflow-hidden shadow-xl ring-1 ring-gray-900/5">
            <div className="bg-white overflow-x-auto">
              {/* PRINTABLE AREA START */}
              <div ref={printRef} className="p-10 md:p-14 min-w-[800px] bg-white text-black" style={{ fontFamily: "'Inter', sans-serif" }}>
                
                {/* Boleta Header Logotypes */}
                <div className="flex justify-between items-center border-b-[3px] border-black pb-6 mb-8">
                  <div className="flex items-center gap-4">
                     <img src="/img/logo-UNICH.png" alt="UNICH Logo" className="w-20 object-contain grayscale opacity-90" />
                     <div>
                       <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 leading-none">
                         Universidad Intercultural<br/>de Chiapas
                       </h2>
                       <p className="text-sm font-bold mt-1 text-gray-500 uppercase tracking-widest">Secretaría Académica</p>
                     </div>
                  </div>
                  <div className="text-right">
                    <h1 className="text-3xl font-black tracking-widest text-black underline decoration-4 underline-offset-4">BOLETA</h1>
                    <p className="text-sm font-bold text-gray-500 mt-2 uppercase flex items-center justify-end gap-1.5">
                      <CalendarIcon size={14} /> Ciclo {boletaData.periodo.nombre}
                    </p>
                  </div>
                </div>

                {/* Estudiante Meta Data */}
                <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8">
                  <div>
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Nombre del Alumno</span>
                    <span className="block text-lg font-bold text-black border-b border-dashed border-gray-300 pb-1">
                      {boletaData.alumno.apellido_paterno} {boletaData.alumno.apellido_materno} {boletaData.alumno.nombre}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Matrícula Escolar</span>
                    <span className="block text-lg font-mono font-bold text-black border-b border-dashed border-gray-300 pb-1">
                      {boletaData.alumno.matricula}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Programa Académico (Licenciatura)</span>
                    <span className="block text-lg font-bold text-black border-b border-dashed border-gray-300 pb-1">
                      {boletaData.alumno.licenciatura?.nombre}
                    </span>
                  </div>
                </div>

                {/* Tabla de Calificaciones */}
                <table className="w-full text-sm text-left border-collapse mb-8">
                  <thead>
                    <tr>
                      <th className="border-y-2 border-black py-3 px-2 font-bold uppercase tracking-wider text-xs">Clave</th>
                      <th className="border-y-2 border-black py-3 px-2 font-bold uppercase tracking-wider text-xs w-1/2">Unidad Académica (Materia)</th>
                      <th className="border-y-2 border-black py-3 px-2 font-bold uppercase tracking-wider text-xs">Catedrático</th>
                      <th className="border-y-2 border-black py-3 px-2 font-bold uppercase tracking-wider text-xs text-center bg-gray-50">Calificación Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boletaData.calificaciones.map((cal, index) => (
                      <tr key={cal.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="border-b border-gray-200 py-3 px-2 font-mono text-xs">{cal.materia?.clave}</td>
                        <td className="border-b border-gray-200 py-3 px-2 font-semibold text-gray-900">{cal.materia?.nombre}</td>
                        <td className="border-b border-gray-200 py-3 px-2 text-xs text-gray-600">
                          {cal.docente ? `${cal.docente.nombre} ${cal.docente.apellido_paterno}` : 'Sin Asignar'}
                        </td>
                        <td className="border-b border-gray-200 py-3 px-2 text-center bg-gray-50">
                          <span className={`text-lg font-mono ${estatusCol(cal.calificacion_final)}`}>
                            {cal.calificacion_final !== null ? Number(cal.calificacion_final).toFixed(1) : '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {boletaData.calificaciones.length === 0 && (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-gray-500 border-b border-gray-200">
                          El alumno no cuenta con carga académica registrada en este periodo.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="text-right py-4 px-4 font-bold uppercase tracking-widest text-xs">
                        Promedio del Periodo:
                      </td>
                      <td className="py-4 px-2 text-center border-b-4 border-black border-double">
                        <span className="text-xl font-black font-mono">
                          {Number(boletaData.promedio_periodo).toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {/* Boleta Footer Signatures */}
                <div className="mt-16 pt-8 grid grid-cols-2 gap-16 text-center">
                  <div>
                    <div className="border-b border-black mb-2 mx-8 pb-8"></div>
                    <span className="block text-xs font-bold uppercase tracking-widest text-gray-800">Departamento de Serv. Escolares</span>
                    <span className="block text-[10px] uppercase text-gray-500 mt-1">Sello y Firma</span>
                  </div>
                  <div>
                    <div className="border-b border-black mb-2 mx-8 pb-8"></div>
                    <span className="block text-xs font-bold uppercase tracking-widest text-gray-800">Director Académico</span>
                    <span className="block text-[10px] uppercase text-gray-500 mt-1">Firma de Autorización</span>
                  </div>
                </div>

                <div className="mt-12 text-[9px] text-gray-400 font-mono text-center uppercase tracking-widest">
                  Documento generado por el Sistema Integral de Servicios Escolares Universitario // Fecha de emisión: {new Date().toLocaleDateString('es-MX')} // Folio Interno: #{Math.floor(Math.random() * 900000) + 100000}BLT
                </div>
              </div>
              {/* PRINTABLE AREA END */}
            </div>
          </Card>
        </div>
      )}

      {/* Helper empty state */}
      {!boletaData && !loading && (
        <Card className="border-dashed shadow-none bg-gray-50 mt-4">
          <CardContent className="p-10 flex flex-col items-center justify-center text-center">
             <GraduationCap size={48} className="text-gray-300 mb-4" strokeWidth={1} />
             <h3 className="text-lg font-bold text-gray-700 mb-1">Generador de Boletas Oficiales</h3>
             <p className="text-sm text-gray-500 max-w-sm">
               Selecciona a un alumno y el ciclo escolar deseado para visualizar su documento comprobatorio de calificaciones.
             </p>
          </CardContent>
        </Card>
      )}

    </div>
  );
};

export default BoletaView;
