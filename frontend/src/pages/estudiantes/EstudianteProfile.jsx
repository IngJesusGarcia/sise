import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Calendar, AlertCircle, BookOpen, Clock, Activity, Edit2 } from 'lucide-react';
import estudiantesService from '../../services/estudiantesService';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const DataRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
    {Icon && <Icon className="text-gray-400 mt-0.5" size={18} />}
    <div>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value || <span className="text-gray-400 font-normal">No registrado</span>}</p>
    </div>
  </div>
);

const EstudianteProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [est, setEst] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await estudiantesService.getById(id);
        setEst(data);
      } catch (err) {
        console.error(err);
        alert('Error al cargar el perfil.');
        navigate('/estudiantes');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-unich-purple border-t-transparent"></div>
      </div>
    );
  }

  if (!est) return null;

  const estatusColors = {
    'activo': 'bg-green-100 text-green-800 border-green-200',
    'baja_temporal': 'bg-amber-100 text-amber-800 border-amber-200',
    'baja_definitiva': 'bg-red-100 text-red-800 border-red-200',
    'egresado': 'bg-blue-100 text-blue-800 border-blue-200',
    'titulado': 'bg-purple-100 text-purple-800 border-purple-200'
  };

  const nombreCompleto = `${est.nombre} ${est.apellido_paterno} ${est.apellido_materno || ''}`;

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6 pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/estudiantes')}
            className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-500 transition-colors h-fit mt-1"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex gap-5 items-center">
            {/* Foto Placeholder */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-unich-blue to-unich-purple text-white flex items-center justify-center shadow-lg shrink-0">
               {est.foto ? (
                 <img src={est.foto} alt="Perfil" className="w-full h-full object-cover rounded-2xl" />
               ) : (
                 <span className="text-4xl font-extrabold">{est.nombre.charAt(0)}{est.apellido_paterno.charAt(0)}</span>
               )}
            </div>

            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{nombreCompleto}</h1>
                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${estatusColors[est.estatus] || 'bg-gray-100'}`}>
                  {String(est.estatus).replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-lg text-gray-500 flex items-center gap-2">
                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">{est.matricula}</span>
                <span>•</span>
                <span>{est.licenciatura?.nombre}</span>
              </p>
            </div>
          </div>
        </div>

        <Button variant="outline" icon={Edit2} onClick={() => navigate(`/estudiantes/editar/${est.id}`)}>
          Editar Expediente
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {/* COL 1: INFO PERSONAL */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="bg-gray-50 px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <User size={18} className="text-unich-purple" />
                  Datos Personales
                </h3>
              </div>
              <div className="p-5">
                <DataRow label="CURP" value={est.curp} />
                <DataRow label="Fecha de Nacimiento" value={est.fecha_nacimiento} icon={Calendar} />
                <DataRow label="Sexo" value={est.sexo} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="bg-gray-50 px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <AlertCircle size={18} className="text-unich-purple" />
                  Contacto
                </h3>
              </div>
              <div className="p-5">
                <DataRow label="Correo Electrónico" value={est.correo} icon={Mail} />
                <DataRow label="Teléfono Fijo / Celular" value={est.telefono} icon={Phone} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* COL 2: INFO ACADÉMICA */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
             <CardContent className="p-0">
               <div className="bg-gray-50 px-5 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <BookOpen size={18} className="text-unich-purple" />
                    Expediente Académico
                  </h3>
               </div>
               <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  <DataRow label="Programa Educativo" value={est.licenciatura?.nombre} />
                  <DataRow label="Plan de Estudios" value={est.planEstudio?.clave} />
                  <DataRow label="Semestre Actual" value={`${est.semestre_actual}° Semestre`} icon={Activity} />
                  <DataRow label="Turno" value={est.turno} icon={Clock} />
                  <DataRow label="Fecha de Ingreso (Ciclo)" value={est.ciclo_ingreso} />
               </div>
             </CardContent>
          </Card>
          
          <Card className="border-dashed shadow-none bg-gray-50/50">
             <CardContent className="p-8 text-center text-gray-500">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-unich-purple/40">
                   <Activity size={32} />
                </div>
                <h4 className="text-lg font-bold text-gray-700 mb-1">Métricas de Avance</h4>
                <p className="text-sm max-w-md mx-auto">
                  Aquí se mostrará la gráfica de avance reticular, el promedio general y los créditos acumulados (Requiere integración con módulo de Kardex).
                </p>
                <div className="mt-6 flex justify-center gap-3">
                   {/* This button will be implemented later, routing to kardex */}
                   <Button variant="ghost" disabled>Ver Historia Académica Completa</Button>
                </div>
             </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default EstudianteProfile;
