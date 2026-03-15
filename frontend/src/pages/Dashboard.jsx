import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { 
  Users, BookOpen, Layers, DollarSign, 
  FileText, TrendingUp, Presentation, Plus, Edit2, Trash2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = localStorage.getItem('rol');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error al cargar estadísticas', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // UI Stats Data mapped to requested specific cards
  const statsCards = [
    { title: 'Total Estudiantes', value: stats?.estudiantes?.total || '4,521', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Total Licenciaturas', value: '18', icon: BookOpen, color: 'text-unich-purple', bg: 'bg-indigo-100' },
    { title: 'Total Materias', value: '342', icon: Layers, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Total Grupos', value: '124', icon: Presentation, color: 'text-amber-600', bg: 'bg-amber-100' },
    { title: 'Total Inscripciones', value: '4,105', icon: FileText, color: 'text-unich-magenta', bg: 'bg-fuchsia-100' },
    { title: 'Total Pagos', value: '$1.2M', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  // Dummy data for the modern administrative table
  const recentStudentsData = [
    { id: '2024001', name: 'Ana García López', program: 'Médico Cirujano', status: 'Activo' },
    { id: '2024002', name: 'Carlos Ruíz Pérez', program: 'Desarrollo de Software', status: 'Inscrito' },
    { id: '2024003', name: 'María Gómez Díaz', program: 'Turismo Alternativo', status: 'Baja Temporal' },
    { id: '2024004', name: 'Jorge Hdez Torres', program: 'Comunicación', status: 'Activo' },
  ];

  const studentColumns = [
    { header: 'Matrícula', accessor: 'id' },
    { header: 'Nombre del Estudiante', accessor: 'name' },
    { header: 'Licenciatura', accessor: 'program' },
    { 
      header: 'Estatus', 
      cell: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold
          ${row.status === 'Activo' || row.status === 'Inscrito' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Acciones',
      cell: () => (
        <div className="flex gap-2">
          <button className="text-gray-400 hover:text-unich-purple transition-colors p-1"><Edit2 size={16} /></button>
          <button className="text-gray-400 hover:text-red-500 transition-colors p-1"><Trash2 size={16} /></button>
        </div>
      )
    }
  ];

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6">
      
      {/* Header and Welcome */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-unich-purple tracking-tight">
            Panel de Administración
          </h1>
          <p className="text-gray-500 mt-1">
            Bienvenido de nuevo, {user?.name || 'Usuario'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {(role === 'admin' || role === 'servicios_escolares') && (
            <Button variant="primary" icon={Plus}>
              Nuevo Registro
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-unich-purple border-t-unich-magenta"></div>
          <p className="text-gray-500 font-medium">Cargando métricas...</p>
        </div>
      ) : (
        <>
          {/* Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {statsCards.map((stat, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow group">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.title}</p>
                    <h3 className="text-2xl font-black text-gray-800 leading-tight mt-1">{stat.value}</h3>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Modern Administrative Table using generic Component */}
            <div className="xl:col-span-2 space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle>Últimos Estudiantes Registrados</CardTitle>
                </CardHeader>
                <div className="p-0">
                  <Table 
                    columns={studentColumns} 
                    data={recentStudentsData} 
                    onSearch={(val) => console.log('Searching:', val)}
                    searchPlaceholder="Buscar por matrícula o nombre..."
                  />
                </div>
              </Card>
            </div>

            {/* Side Panel specific to user generic data */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-unich-purple to-unich-dark text-white border-none relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
                 <CardContent className="p-6 relative z-10">
                   <h3 className="text-lg font-bold mb-1 text-unich-light">Estado del Servidor</h3>
                   <div className="flex items-center gap-3 mt-4">
                     <div className="w-12 h-12 rounded-full border-4 border-white/20 flex items-center justify-center border-t-green-400">
                       <TrendingUp size={20} className="text-green-400" />
                     </div>
                     <div>
                       <p className="font-bold text-white text-xl">Óptimo</p>
                       <p className="text-xs text-indigo-200">API Laravel Respondiendo</p>
                     </div>
                   </div>
                 </CardContent>
              </Card>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
