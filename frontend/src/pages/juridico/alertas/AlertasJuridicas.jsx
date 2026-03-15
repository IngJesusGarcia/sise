import React, { useState, useEffect } from 'react';
import { Bell, Scale, FileSignature, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { juridicoService } from '../../../services/juridicoService';
import { Card, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Link } from 'react-router-dom';

const getDaysUntil = (dateString) => {
  if (!dateString) return null;
  const targetDate = new Date(dateString).setHours(0, 0, 0, 0);
  const now = new Date().setHours(0, 0, 0, 0);
  return Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));
};

const AlertasJuridicas = () => {
  const [convenios, setConvenios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all convenios to identify the ones close to expiration
    juridicoService.getConvenios({ per_page: 100 })
      .then(res => {
        // Filter contracts that expire within 60 days, or are already expired
        const filtered = (res.data || []).map(cv => ({
          ...cv,
          daysLeft: getDaysUntil(cv.fecha_vencimiento)
        })).filter(cv => cv.daysLeft !== null && cv.daysLeft <= 60);

        // Sort by most critical first
        filtered.sort((a, b) => a.daysLeft - b.daysLeft);
        
        setConvenios(filtered);
      })
      .finally(() => setLoading(false));
  }, []);

  const AlertCard = ({ title, desc, icon: Icon, colorClass, dataCount }) => (
    <Card className={`border-l-4 ${colorClass}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-500 font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-black text-gray-900">{dataCount}</h3>
            <p className="text-sm text-gray-600 mt-2">{desc}</p>
          </div>
          <div className={`p-3 rounded-xl ${colorClass.replace('border-', 'bg-').replace('-600', '-50')} ${colorClass.replace('border-', 'text-')}`}>
            <Icon size={24} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const getAlertStyle = (days) => {
    if (days < 0) return { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-800', badge: 'danger', icon: 'text-rose-600', label: `Venció hace ${Math.abs(days)} días` };
    if (days === 0) return { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-800', badge: 'danger', icon: 'text-rose-600', label: 'Vence HOY' };
    if (days <= 15) return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', badge: 'warning', icon: 'text-amber-600', label: `Vence en ${days} días` };
    return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', badge: 'secondary', icon: 'text-blue-600', label: `Vence en ${days} días` };
  };

  const vencidos = convenios.filter(c => c.daysLeft < 0).length;
  const criticos = convenios.filter(c => c.daysLeft >= 0 && c.daysLeft <= 15).length;
  const preventivos = convenios.filter(c => c.daysLeft > 15 && c.daysLeft <= 60).length;

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
        <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
          <Bell size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Alertas y Vencimientos</h1>
          <p className="text-sm text-gray-500">Panel automatizado de prevención de riesgos jurídicos e institucionales.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AlertCard title="Vencidos" desc="Contratos que superaron la fecha límite." icon={AlertCircle} colorClass="border-rose-600" dataCount={vencidos} />
        <AlertCard title="Riesgo Crítico" desc="Vencen en menos de 15 días." icon={Bell} colorClass="border-amber-500" dataCount={criticos} />
        <AlertCard title="Preventivos" desc="Vencen entre 15 y 60 días." icon={CheckCircle} colorClass="border-blue-500" dataCount={preventivos} />
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><FileSignature size={20} className="text-indigo-600"/> Seguimiento de Convenios y Contratos</h2>
        <div className="space-y-4">
          {loading ? (
             <div className="p-12 text-center flex flex-col items-center">
               <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
               <p className="text-gray-500 font-medium">Calculando alertas de vencimiento...</p>
             </div>
          ) : convenios.length === 0 ? (
            <Card className="bg-emerald-50/50 border-emerald-100">
              <CardContent className="p-12 text-center text-emerald-800">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500 opacity-60" />
                <h3 className="text-xl font-bold mb-1">Todo en orden</h3>
                <p>No hay contratos, convenios o demandas próximas a vencer en los siguientes 60 días.</p>
              </CardContent>
            </Card>
          ) : (
            convenios.map(cv => {
              const styles = getAlertStyle(cv.daysLeft);
              return (
                <div key={cv.id} className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-sm hover:shadow-md ${styles.bg} ${styles.border}`}>
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 bg-white p-2 rounded-lg shadow-sm ${styles.icon}`}>
                      <FileSignature size={20} />
                    </div>
                    <div>
                      <div className="flex gap-2 items-center mb-1">
                        <h4 className={`font-bold text-lg ${styles.text}`}>{cv.numero_control}</h4>
                        <Badge variant={styles.badge}>{styles.label}</Badge>
                      </div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">{cv.tipo_convenio}</p>
                      <p className="text-xs text-gray-600 line-clamp-1">{cv.instituciones}</p>
                      <p className="text-xs text-gray-500 mt-2 font-mono">
                        Firma: {new Date(cv.fecha_firma).toLocaleDateString()} — Vencimiento: <span className="font-bold">{new Date(cv.fecha_vencimiento).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>
                  <Link to={`/juridico/convenios/editar/${cv.id}`} className={`shrink-0 flex items-center gap-2 px-4 py-2 bg-white ${styles.text} font-bold rounded-xl shadow-sm hover:bg-gray-50 transition border ${styles.border}`}>
                    Revisar Contrato <ArrowRight size={16} />
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertasJuridicas;
