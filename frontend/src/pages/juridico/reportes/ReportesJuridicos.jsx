import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { PieChart, Scale, FileSignature, FolderOpen, Mail, AlertTriangle, UserPlus, Users, Activity } from 'lucide-react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, 
  Tooltip as ChartTooltip, Legend, ArcElement
} from 'chart.js';
import { juridicoService } from '../../../services/juridicoService';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend, ArcElement);

const ReportesJuridicos = () => {
  const [stats, setStats] = useState({
    expedientes: 0,
    demandas: 0,
    convenios: 0,
    alertas: 0
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Para simplificar, obtenemos los listados generales y contamos.
    // En un caso real a gran escala, habría un endpoint dedicado `/api/juridico/reportes/resumen`
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [exp, dem, conv] = await Promise.all([
          juridicoService.getExpedientes({ per_page: 100 }),
          juridicoService.getDemandas({ per_page: 100 }),
          juridicoService.getConvenios({ per_page: 100 })
        ]);

        const totalExp = exp.data?.length || 0;
        const totalDem = dem.data?.length || 0;
        const totalConv = conv.data?.length || 0;
        
        // Calcular alertas (vencen en menos de 30 días o vencidos)
        const now = new Date().setHours(0,0,0,0);
        const alertasCount = (conv.data || []).filter(c => {
          if(!c.fecha_vencimiento) return false;
          const target = new Date(c.fecha_vencimiento).setHours(0,0,0,0);
          const daysLeft = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
          return daysLeft <= 30;
        }).length;

        setStats({
          expedientes: totalExp,
          demandas: totalDem,
          convenios: totalConv,
          alertas: alertasCount
        });
      } catch(e) {
        console.error('Error stats:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const dataDoughnut = {
    labels: ['Exp. Activos', 'Convenios', 'Demandas'],
    datasets: [{
      data: [stats.expedientes, stats.convenios, stats.demandas],
      backgroundColor: ['#4F46E5', '#10B981', '#F43F5E'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  const dataBar = {
    labels: ['Septiembre', 'Octubre', 'Noviembre', 'Diciembre', 'Enero', 'Febrero'],
    datasets: [
      {
        label: 'Aperturas / Recepciones',
        data: [12, 19, 3, 5, 2, 8], // Dummy Data for visualization
        backgroundColor: '#6366F1',
        borderRadius: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  const StatCard = ({ title, count, icon: Icon, colorClass, gradient }) => (
    <Card className={`overflow-hidden border-none text-white ${gradient} shadow-lg shadow-${colorClass.split('-')[1]}-500/20`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 font-medium mb-1 text-sm">{title}</p>
            <h3 className="text-4xl font-black">{count}</h3>
          </div>
          <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
            <Icon size={32} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) return <div className="h-64 flex items-center justify-center"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
        <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
          <PieChart size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Métricas y Reportes Jurídicos</h1>
          <p className="text-sm text-gray-500">Resumen estadístico de juicios, expedientes, contratos e incidentes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Expedientes Activos" count={stats.expedientes} icon={FolderOpen} colorClass="text-indigo-600" gradient="bg-gradient-to-br from-indigo-500 to-indigo-700" />
        <StatCard title="Demandas Laborales" count={stats.demandas} icon={Scale} colorClass="text-rose-600" gradient="bg-gradient-to-br from-rose-500 to-rose-700" />
        <StatCard title="Convenios Registrados" count={stats.convenios} icon={FileSignature} colorClass="text-emerald-600" gradient="bg-gradient-to-br from-emerald-500 to-emerald-700" />
        <StatCard title="Alertas Críticas" count={stats.alertas} icon={AlertTriangle} colorClass="text-amber-600" gradient="bg-gradient-to-br from-amber-400 to-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardContent className="p-6 flex flex-col h-full">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2"><ActivityIcon /> Recepción de Asuntos (Últimos 6 Meses)</h3>
              <div className="flex-1 min-h-[300px]">
                <Bar options={chartOptions} data={dataBar} />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="h-full">
            <CardContent className="p-6 flex flex-col h-full">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2"><PieChart size={20} className="text-indigo-600"/> Distribución de Casos</h3>
              <div className="flex-1 min-h-[300px] flex items-center justify-center">
                <div className="w-full max-w-[250px]">
                  <Doughnut data={dataDoughnut} options={chartOptions} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const ActivityIcon = () => <Activity size={20} className="text-indigo-600"/>;

export default ReportesJuridicos;
