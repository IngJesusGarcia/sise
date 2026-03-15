import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ChevronRight, X } from 'lucide-react';
import menuSections from '../config/menuConfig';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const role = localStorage.getItem('rol') || 'estudiante';
  const isAdmin = role === 'admin';

  // Filter: keep only sections that have at least one item visible for this role
  const visibleSections = menuSections
    .map(section => ({
      ...section,
      items: section.items.filter(item =>
        isAdmin || !item.roles || item.roles.includes(role)
      ),
    }))
    .filter(section => section.items.length > 0);

  const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink
      to={to}
      title={!isOpen ? label : ''}
      className={({ isActive }) =>
        `flex items-center ${isOpen ? 'justify-between px-3' : 'justify-center'} py-3 rounded-xl transition-all duration-200 group mb-1
        ${isActive
          ? 'bg-unich-magenta text-white shadow-lg shadow-unich-magenta/20'
          : 'hover:bg-white/10 text-gray-300 hover:text-white'}`
      }
    >
      <div className="flex items-center gap-3">
        <Icon size={20} className={isOpen ? 'opacity-90' : 'opacity-100'} />
        {isOpen && <span className="font-medium text-sm tracking-wide">{label}</span>}
      </div>
      {isOpen && <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
    </NavLink>
  );

  const SectionLabel = ({ label }) => (
    <div className={`text-[10px] uppercase font-bold text-gray-400/70 mt-6 mb-3 ${isOpen ? 'px-3 text-left tracking-widest' : 'text-center tracking-normal'}`}>
      {isOpen ? label : '•••'}
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {!isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-unich-dark/50 z-30 backdrop-blur-sm"
          onClick={() => setIsOpen(true)}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed inset-y-0 left-0 bg-unich-purple text-white flex flex-col shadow-2xl z-40 transition-all duration-300 ease-in-out
          ${isOpen ? 'w-[260px] translate-x-0' : 'w-20 -translate-x-full md:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className={`p-5 flex items-center ${isOpen ? 'justify-between' : 'justify-center'} border-b border-white/10`}>
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-lg shrink-0 overflow-hidden shadow-inner">
              <img
                src="/img/logo-UNICH.png"
                alt="Logo"
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23E4007C"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="60">U</text></svg>';
                }}
              />
            </div>
            {isOpen && (
              <div className="animate-fade-in">
                <h2 className="text-lg font-bold text-white tracking-tight leading-none">SISE</h2>
                <p className="text-[10px] text-unich-magenta font-bold tracking-widest uppercase mt-0.5">UNICH</p>
              </div>
            )}
          </div>

          {/* Role chip — only visible when expanded */}
          {isOpen && (
            <div className="flex flex-col items-end gap-1">
              <span className="text-[9px] bg-white/10 text-gray-300 rounded-full px-2 py-0.5 uppercase tracking-widest font-semibold">
                {role.replace('_', ' ')}
              </span>
            </div>
          )}

          {/* Mobile Close */}
          <button
            className="md:hidden text-gray-400 hover:text-white transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-6 custom-scrollbar">
          {/* Dashboard — always visible */}
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />

          {/* Dynamic sections from menuConfig */}
          {visibleSections.map((section) => (
            <div key={section.section}>
              <SectionLabel label={section.section} />
              {section.items.map((item) => (
                <NavItem
                  key={item.path + item.label}
                  to={item.path}
                  icon={item.icon}
                  label={item.label}
                />
              ))}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
