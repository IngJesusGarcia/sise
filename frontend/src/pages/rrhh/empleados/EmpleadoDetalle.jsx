import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, Briefcase, History, Pencil } from 'lucide-react';
import empleadosService from '../../../services/empleadosService';
import { Card, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

const fmt = (n) => Number(n ?? 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

const MOV_LABEL = {
  ingreso: { cls: 'bg-emerald-100 text-emerald-800', label: 'Ingreso' },
  cambio_puesto: { cls: 'bg-blue-100 text-blue-800', label: 'Cambio de Puesto' },
  cambio_dpto:   { cls: 'bg-indigo-100 text-indigo-800', label: 'Cambio de Dpto.' },
  aumento:       { cls: 'bg-amber-100 text-amber-800', label: 'Aumento Salarial' },
  baja:          { cls: 'bg-red-100 text-red-800', label: 'Baja' },
  reingreso:     { cls: 'bg-violet-100 text-violet-800', label: 'Reingreso' },
};

const DataRow = ({ label, value }) => (
  <div className="flex justify-between py-2.5 border-b border-gray-50 last:border-0">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-semibold text-gray-800 text-right max-w-[60%]">{value ?? '—'}</span>
  </div>
);

const EmpleadoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [emp, setEmp] = useState(null);

  useEffect(() => {
    empleadosService.getById(id).then(setEmp).catch(() => navigate('/rrhh/empleados'));
  }, [id]);

  if (!emp) return <div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-4 border-unich-purple border-t-transparent" /></div>;

  const initials = `${emp.nombre?.[0] ?? ''}${emp.apellido_paterno?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate('/rrhh/empleados')} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors text-gray-500">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Expediente del Empleado</h1>
        <div className="ml-auto">
          <Button variant="outline" icon={Pencil} onClick={() => navigate(`/rrhh/empleados/editar/${id}`)}>Editar</Button>
        </div>
      </div>

      {/* Header Card */}
      <Card className="border-t-4 border-t-unich-purple overflow-hidden">
        <div className="bg-gradient-to-r from-unich-purple/5 to-transparent p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-unich-purple/10 text-unich-purple flex items-center justify-center text-2xl font-black">
            {initials}
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">{emp.nombre} {emp.apellido_paterno} {emp.apellido_materno}</h2>
            <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600">
              <span className="font-mono font-bold bg-white border px-2.5 py-0.5 rounded-lg text-unich-purple">{emp.numero_empleado}</span>
              <span>·</span>
              <span className="font-semibold">{emp.puesto?.nombre}</span>
              <span>·</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${emp.estatus === 'activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {String(emp.estatus).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal */}
        <Card>
          <CardContent className="p-6">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">
              <User size={15} /> Datos Personales
            </h3>
            <DataRow label="RFC" value={emp.rfc} />
            <DataRow label="CURP" value={emp.curp} />
            <DataRow label="Correo" value={emp.correo} />
            <DataRow label="Teléfono" value={emp.telefono} />
          </CardContent>
        </Card>

        {/* Laboral */}
        <Card>
          <CardContent className="p-6">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">
              <Briefcase size={15} /> Datos Laborales
            </h3>
            <DataRow label="Departamento" value={emp.departamento?.nombre} />
            <DataRow label="Puesto" value={emp.puesto?.nombre} />
            <DataRow label="Tipo Contrato" value={emp.tipo_contrato} />
            <DataRow label="Fecha Ingreso" value={emp.fecha_ingreso} />
            <DataRow label="Antigüedad" value={(() => {
              if (!emp.fecha_ingreso) return '—';
              const diff = Math.floor((new Date() - new Date(emp.fecha_ingreso)) / (1000 * 60 * 60 * 24 * 365));
              return `${diff} año${diff !== 1 ? 's' : ''}`;
            })()} />
          </CardContent>
        </Card>
      </div>

      {/* Historial laboral */}
      <Card>
        <CardContent className="p-6">
          <h3 className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest mb-5">
            <History size={15} /> Historial de Movimientos
          </h3>
          {emp.historial?.length === 0 && <p className="text-sm text-gray-400">Sin movimientos registrados.</p>}
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-100" />
            <div className="space-y-4 pl-8">
              {(emp.historial ?? []).map((m, i) => {
                const cfg = MOV_LABEL[m.tipo_movimiento] ?? { cls: 'bg-gray-100 text-gray-600', label: m.tipo_movimiento };
                return (
                  <div key={i} className="relative">
                    <div className="absolute -left-8 mt-1 w-3 h-3 rounded-full bg-unich-purple/40 border-2 border-white" />
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${cfg.cls}`}>{cfg.label}</span>
                        {m.motivo && <p className="text-xs text-gray-500 mt-1">{m.motivo}</p>}
                        {m.salario_nuevo && <p className="text-xs text-gray-500">Nuevo salario: <strong>{fmt(m.salario_nuevo)}</strong></p>}
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap font-mono">{m.fecha_movimiento}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmpleadoDetalle;
