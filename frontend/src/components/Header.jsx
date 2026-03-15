import React from 'react';
import { Search, Menu, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = localStorage.getItem('rol');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const formatRole = (r) => {
    if (!r) return 'Usuario';
    return r.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Toggle Sidebar Button */}
        <button 
          onClick={toggleSidebar}
          className="text-gray-500 hover:text-unich-purple p-1.5 rounded-lg hover:bg-unich-purple/5 transition-colors"
        >
          <Menu size={24} />
        </button>
        
        {/* Búsqueda Global */}
        <div className="hidden md:flex items-center bg-gray-50 rounded-full px-4 py-2 w-80 lg:w-96 border border-gray-200 focus-within:border-unich-purple focus-within:ring-2 focus-within:ring-unich-purple/10 transition-all">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar en el sistema..." 
            className="bg-transparent border-none outline-none ml-2 w-full text-sm text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
        {/* Institucional Tag */}
        <div className="hidden lg:block text-right">
          <p className="text-xs font-bold text-unich-purple tracking-widest uppercase">Universidad Intercultural de Chiapas</p>
          <p className="text-[10px] text-gray-400 font-medium">Ciclo Escolar 2024-1</p>
        </div>

        {/* Notificaciones */}
        <NotificationBell />

        {/* Separator */}
        <div className="hidden sm:block h-8 w-px bg-gray-200"></div>

        {/* User Mini Profile */}
        <div className="group relative">
          <button className="flex items-center gap-3 p-1 pl-2 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-800 leading-tight">{user?.name?.split(' ')[0]}</p>
              <p className="text-xs text-unich-magenta font-semibold">{formatRole(role)}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-unich-purple text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
          </button>

          {/* Simple Dropdown for Logout */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
            <div className="p-2">
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 font-medium transition-colors"
              >
                <LogOut size={16} /> Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
