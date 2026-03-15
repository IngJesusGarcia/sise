import React, { useState, useEffect } from 'react';
import { BarChart3, PieChartIcon, FileText, ArrowRight } from 'lucide-react';
import { correspondenciaService } from '../../../services/correspondenciaService';
import { Card, CardContent } from '../../../components/ui/Card';
import { Bar, Doughnut } from 'react-chartjs-2';

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, ArcElement } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend, ArcElement);

const ReportesCorrespondencia = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    desde: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    hasta: new Date().toISOString().split('T')[0],
  });

  const fetchResumen = () => {
    setLoading(true);
    correspondenciaService.getResumen(filtros).then(setData).finally(() => setLoading(false));
  };

  useEffect(() => { fetchResumen(); }, []);

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } };

  // Data mapping for charts
  const estatusData = data ? {
    labels: Object.keys(data.por_estatus),
    datasets: [{
      label: 'Documentos',
      data: Object.values(data.por_estatus).map(x => x.total),
      backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'],
      borderWidth: 0,
    }]
  } : null;

  const tipoData = data ? {
    labels: data.por_tipo.map(t => t.tipo),
    datasets: [{
      label: 'Oficios',
      data: data.por_tipo.map(t => t.total),
      backgroundColor: '#818cf8',
      borderRadius: 4,
    }]
  } : null;

  const areaData = data ? {
    labels: data.por_area.map(t => t.area_origen),
    datasets: [{
      label: 'Oficios Emitidos',
      data: data.por_area.map(t => t.total),
      backgroundColor: '#34d399',
      borderRadius: 4,
    }]
  } : null;

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl"><BarChart3 size={24} /></div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Reportes de Correspondencia</h1>
            <p className="text-sm text-gray-500">Métricas y volumen de oficios emitidos</p>
          </div>
        </div>
        <div className="flex gap-2 items-end">
          <div className="flex flex-col"><label className="text-[10px] uppercase font-bold text-gray-400">Desde</label><input type="date" value={filtros.desde} onChange={e => setFiltros({ ...filtros, desde: e.target.value })} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm" /></div>
          <div className="flex flex-col"><label className="text-[10px] uppercase font-bold text-gray-400">Hasta</label><input type="date" value={filtros.hasta} onChange={e => setFiltros({ ...filtros, hasta: e.target.value })} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm" /></div>
          <button onClick={fetchResumen} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 h-[34px]">Actualizar</button>
        </div>
      </div>

      {loading || !data ? (
        <div className="h-64 flex items-center justify-center"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
              <FileText size={24} className="text-indigo-200 mb-2" />
              <p className="text-indigo-100 text-sm font-bold uppercase tracking-wider">Total Registrados</p>
              <h2 className="text-4xl font-black mt-1">{data.total}</h2>
              <p className="text-xs text-indigo-200 mt-2">{filtros.desde} / {filtros.hasta}</p>
            </div>
            
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card><CardContent className="p-4 h-full"><h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1"><PieChartIcon size={14}/> Por Estatus</h3><div className="h-48"><Doughnut data={estatusData} options={chartOptions} /></div></CardContent></Card>
              <Card><CardContent className="p-4 h-full"><h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1"><BarChart3 size={14}/> Top Tipos de Documento</h3><div className="h-48"><Bar data={tipoData} options={{...chartOptions, indexAxis: 'y'}} /></div></CardContent></Card>
            </div>
          </div>

          <Card>
            <div className="px-6 py-4 border-b border-gray-100"><h3 className="font-bold text-gray-800">Oficios Emitidos por Área Origen (Top 10)</h3></div>
            <CardContent className="p-6">
              <div className="h-80"><Bar data={areaData} options={chartOptions} /></div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
export default ReportesCorrespondencia;
