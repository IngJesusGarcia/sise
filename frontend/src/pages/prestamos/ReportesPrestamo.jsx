import React, { useState, useEffect } from 'react';
import { prestamosService } from "../../services/prestamosService";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { PieChart, BarChart2, Package, CheckCircle, Clock, AlertTriangle, List, Loader2 } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ReportesPrestamo = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await prestamosService.getResumen();
        setData(res);
      } catch (error) {
        console.error('Error al cargar reportes', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-12 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-unich-magenta" /></div>;

  const stats = [
    { label: 'Total Equipos', value: data?.resumen.total_equipos, icon: Package, color: 'blue' },
    { label: 'Disponibles', value: data?.resumen.equipos_disponibles, icon: CheckCircle, color: 'green' },
    { label: 'En Préstamo', value: data?.resumen.equipos_prestados, icon: Clock, color: 'orange' },
    { label: 'Mantenimiento', value: data?.resumen.equipos_mantenimiento, icon: AlertTriangle, color: 'red' },
  ];

  const pieData = {
    labels: ['Disponibles', 'Prestados', 'Mantenimiento'],
    datasets: [{
      data: [data?.resumen.equipos_disponibles, data?.resumen.equipos_prestados, data?.resumen.equipos_mantenimiento],
      backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
      hoverOffset: 4
    }]
  };

  const barData = {
    labels: data?.grafica_mensual.map(i => i.mes).reverse(),
    datasets: [{
      label: 'Préstamos por Mes',
      data: data?.grafica_mensual.map(i => i.total).reverse(),
      backgroundColor: 'rgba(219, 0, 115, 0.6)',
      borderColor: '#db0073',
      borderWidth: 1
    }]
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reportes de Préstamos</h1>
        <p className="text-gray-500">Analítica sobre el uso y disponibilidad de equipo institucional</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => (
          <Card key={idx}>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">{s.label}</p>
                <p className="text-3xl font-bold text-gray-800">{s.value}</p>
              </div>
              <div className={`p-3 bg-${s.color}-50 rounded-xl`}>
                <s.icon className={`w-6 h-6 text-${s.color}-500`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Disponibilidad de Inventario</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center p-6">
            <div className="w-64 h-64">
              <Pie data={pieData} options={{ maintainAspectRatio: false }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Préstamos en los últimos 6 meses</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: true }} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportesPrestamo;
