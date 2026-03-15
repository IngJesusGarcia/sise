import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { notificacionesService } from '../services/inventarioService';
import { useNavigate } from 'react-router-dom';

const relativeTime = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60)   return 'hace un momento';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  return new Date(dateStr).toLocaleDateString('es-MX');
};

const NotificationBell = () => {
  const [open, setOpen]     = useState(false);
  const [data, setData]     = useState({ data: [], no_leidas: 0 });
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  const fetchNotif = async () => {
    try {
      setLoading(true);
      const res = await notificacionesService.getAll();
      setData(res);
    } catch { /* not logged in or no notificaciones table yet */ }
    finally { setLoading(false); }
  };

  // Poll every 30 seconds for new notifications
  useEffect(() => {
    fetchNotif();
    const interval = setInterval(fetchNotif, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNotifClick = async (n) => {
    if (!n.leida) {
      await notificacionesService.marcarLeida(n.id).catch(() => {});
      setData(prev => ({
        ...prev,
        no_leidas: Math.max(0, prev.no_leidas - 1),
        data: prev.data.map(x => x.id === n.id ? { ...x, leida: true } : x)
      }));
    }
    if (n.url) { navigate(n.url); setOpen(false); }
  };

  const handleMarcarTodas = async () => {
    await notificacionesService.marcarTodasLeidas().catch(() => {});
    setData(prev => ({ ...prev, no_leidas: 0, data: prev.data.map(x => ({ ...x, leida: true })) }));
  };

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotif(); }}
        className="relative text-gray-400 hover:text-unich-magenta p-1.5 rounded-full hover:bg-unich-magenta/5 transition-colors"
      >
        <Bell size={20} className={open ? 'text-unich-magenta' : ''} />
        {data.no_leidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-unich-magenta text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center px-0.5">
            {data.no_leidas > 9 ? '9+' : data.no_leidas}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
            <div>
              <p className="font-black text-gray-900 text-sm">Notificaciones</p>
              {data.no_leidas > 0 && <p className="text-[11px] text-unich-magenta font-bold">{data.no_leidas} sin leer</p>}
            </div>
            {data.no_leidas > 0 && (
              <button onClick={handleMarcarTodas} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-unich-purple transition-colors">
                <CheckCheck size={14} /> Marcar todas
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-80 divide-y divide-gray-50">
            {loading && data.data.length === 0 && (
              <div className="p-6 text-center"><div className="animate-spin inline-block w-6 h-6 rounded-full border-4 border-unich-purple border-t-transparent" /></div>
            )}
            {!loading && data.data.length === 0 && (
              <div className="p-6 text-center">
                <Bell size={36} className="mx-auto text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">Sin notificaciones</p>
              </div>
            )}
            {data.data.map(n => (
              <button
                key={n.id}
                onClick={() => handleNotifClick(n)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex gap-3 items-start ${!n.leida ? 'bg-unich-purple/[0.03]' : ''}`}
              >
                {/* Unread indicator */}
                <div className="mt-1.5 flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full ${!n.leida ? 'bg-unich-magenta' : 'bg-gray-200'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${!n.leida ? 'text-gray-900' : 'text-gray-600'}`}>{n.titulo}</p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">{n.mensaje}</p>
                  <p className="text-[10px] text-gray-300 mt-1 font-mono">{relativeTime(n.created_at)}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          {data.data.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/80">
              <button onClick={() => setOpen(false)} className="w-full text-center text-xs font-bold text-gray-400 hover:text-unich-purple transition-colors">
                Cerrar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
