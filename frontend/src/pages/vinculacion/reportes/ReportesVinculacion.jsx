import React, { useState, useEffect } from 'react';
import { vinculacionService } from '../../../services/vinculacionService';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Loader2, PieChart, Users, AlertCircle, CheckCircle, GraduationCap } from 'lucide-react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const ReportesVinculacion = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vinculacionService.getResumen()
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 text-orange-600">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  if (!data) return null;
  const { resumen, estatus, por_carrera } = data;

  const estatusData = {
    labels: ['Registrado', 'En Proceso', 'Terminado', 'Liberado'],
    datasets: [{
      data: [estatus.registrado, estatus.en_proceso, estatus.terminado, estatus.liberado],
      backgroundColor: ['#6366f1', '#3b82f6', '#8b5cf6', '#10b981'],
      borderWidth: 0,
    }]
  };

  const carreraData = {
    labels: por_carrera.map(c => c.nombre.substring(0, 15) + '...'),
    datasets: [{
      label: 'Alumnos en SS',
      data: por_carrera.map(c => c.total),
      backgroundColor: '#f97316',
      borderRadius: 6,
    }]
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
          <PieChart className="text-orange-500" size={32} /> Reportes Estatísticos del Servicio Social
        </h1>
        <p className="text-gray-500 mt-1">Métricas globales y cumplimiento de estudiantes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-orange-500 to-amber-500 text-white border-0 shadow-lg shadow-orange-500/20">
          <CardContent className="p-6">
            <h3 className="font-semibold text-orange-100 flex items-center gap-2 mb-2"><Users size={18}/> Aptos SS</h3>
            <p className="text-4xl font-black">{resumen.total_habilitados}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-100">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-500 flex items-center gap-2 mb-2"><GraduationCap size={18}/> Liberados</h3>
            <p className="text-4xl font-black text-emerald-600">{estatus.liberado}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-100">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-500 flex items-center gap-2 mb-2"><CheckCircle size={18}/> Activos</h3>
            <p className="text-4xl font-black text-blue-600">{estatus.en_proceso}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-100">
          <CardContent className="p-6">
            <h3 className="font-semibold text-amber-500 flex items-center gap-2 mb-2"><AlertCircle size={18}/> Rezagados</h3>
            <p className="text-4xl font-black text-amber-600">{resumen.rezagados}</p>
            <p className="text-xs text-gray-400 mt-1">Habilitados, sin iniciar.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-gray-100">
          <CardHeader><CardTitle className="text-lg">Distribución por Estatus</CardTitle></CardHeader>
          <CardContent className="p-6 flex justify-center items-center h-80">
            {Object.values(estatus).reduce((a,b)=>a+b, 0) > 0 ? (
              <Doughnut data={estatusData} options={{ maintainAspectRatio: false }} />
            ) : <p className="text-gray-400">Sin datos registrados</p>}
          </CardContent>
        </Card>

        <Card className="border border-gray-100">
          <CardHeader><CardTitle className="text-lg">Alumnos por Programa Académico</CardTitle></CardHeader>
          <CardContent className="p-6 flex justify-center items-center h-80">
            {por_carrera.length > 0 ? (
               <Bar data={carreraData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            ) : <p className="text-gray-400">Sin datos registrados</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportesVinculacion;
