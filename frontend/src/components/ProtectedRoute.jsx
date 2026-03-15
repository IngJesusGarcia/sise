import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import menuSections from '../config/menuConfig';

/**
 * ProtectedRoute — Guards routes based on:
 * 1. Auth token presence
 * 2. Allowed roles (explicit prop) OR dynamic check via menuConfig
 *
 * Usage A — explicit allowedRoles prop (preferred for admin/specific pages):
 *   <Route element={<ProtectedRoute allowedRoles={['admin', 'servicios_escolares']} />}>
 *
 * Usage B — automatic mode: checks menuConfig for the current path.
 *   <Route element={<ProtectedRoute />}>
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const token    = localStorage.getItem('token');
  const userRole = localStorage.getItem('rol');
  const location = useLocation();

  // 1. Not authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Admin bypasses all role checks
  if (userRole === 'admin') {
    return <Outlet />;
  }

  // 3. Explicit roles prop check
  if (allowedRoles) {
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/dashboard" replace state={{ from: location }} />;
    }
    return <Outlet />;
  }

  // 4. Auto-mode: derive access from menuConfig
  //    If the current path exists in menuConfig and the user's role is listed → allow.
  //    If the path is NOT in menuConfig at all → allow (public layout path like /dashboard).
  const currentPath = location.pathname;

  // Flatten all items from menuConfig
  const allItems = menuSections.flatMap(s => s.items);
  const matchedItem = allItems.find(item => currentPath.startsWith(item.path));

  if (matchedItem) {
    const hasAccess = matchedItem.roles?.includes(userRole) ?? false;
    if (!hasAccess) {
      return <Navigate to="/dashboard" replace state={{ from: location }} />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
