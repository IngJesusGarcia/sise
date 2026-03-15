import React, { useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

// Lazy loading pages
const Login = lazy(() => import('../pages/Login'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Licenciaturas = lazy(() => import('../pages/Academico/Licenciaturas'));
const MateriasList = lazy(() => import('../pages/materias/MateriasList'));
const MateriaForm = lazy(() => import('../pages/materias/MateriaForm'));
const GruposList = lazy(() => import('../pages/grupos/GruposList'));
const GrupoForm = lazy(() => import('../pages/grupos/GrupoForm'));
const InscripcionesList = lazy(() => import('../pages/inscripciones/InscripcionesList'));
const InscripcionForm = lazy(() => import('../pages/inscripciones/InscripcionForm'));
const CalificacionesList = lazy(() => import('../pages/calificaciones/CalificacionesList'));
const CalificacionForm = lazy(() => import('../pages/calificaciones/CalificacionForm'));
const EstudiantesList = lazy(() => import('../pages/estudiantes/EstudiantesList'));
const EstudianteForm = lazy(() => import('../pages/estudiantes/EstudianteForm'));
const EstudianteProfile = lazy(() => import('../pages/estudiantes/EstudianteProfile'));
const KardexView = lazy(() => import('../pages/kardex/KardexView'));
const KardexDetalle = lazy(() => import('../pages/kardex/KardexDetalle'));
const BoletaView = lazy(() => import('../pages/boletas/BoletaView'));
const CertificadosList = lazy(() => import('../pages/certificados/CertificadosList'));
const CertificadoForm = lazy(() => import('../pages/certificados/CertificadoForm'));
const ReportesView = lazy(() => import('../pages/reportes/ReportesView'));
const EgresadosList = lazy(() => import('../pages/egresados/EgresadosList'));
const EgresadoForm = lazy(() => import('../pages/egresados/EgresadoForm'));
const TitulacionView = lazy(() => import('../pages/titulacion/TitulacionView'));
const TitulacionForm = lazy(() => import('../pages/titulacion/TitulacionForm'));
const AspirantesList = lazy(() => import('../pages/aspirantes/AspirantesList'));
const AspiranteForm = lazy(() => import('../pages/aspirantes/AspiranteForm'));
const AspiranteConvertir = lazy(() => import('../pages/aspirantes/AspiranteConvertir'));
const MovimientosList = lazy(() => import('../pages/movimientosAcademicos/MovimientosList'));
const MovimientoForm = lazy(() => import('../pages/movimientosAcademicos/MovimientoForm'));
const MovilidadList = lazy(() => import('../pages/movilidad/MovilidadList'));
const MovilidadForm = lazy(() => import('../pages/movilidad/MovilidadForm'));
const PeriodosList = lazy(() => import('../pages/periodos/PeriodosList'));
const PeriodoForm = lazy(() => import('../pages/periodos/PeriodoForm'));
const PlanesEstudioList = lazy(() => import('../pages/planesEstudio/PlanesEstudioList'));
const PlanEstudioForm = lazy(() => import('../pages/planesEstudio/PlanEstudioForm'));
const MallaCurricular = lazy(() => import('../pages/planesEstudio/MallaCurricular'));

// ── RRHH
const EmpleadosList = lazy(() => import('../pages/rrhh/empleados/EmpleadosList'));
const EmpleadoForm = lazy(() => import('../pages/rrhh/empleados/EmpleadoForm'));
const EmpleadoDetalle = lazy(() => import('../pages/rrhh/empleados/EmpleadoDetalle'));
const MovimientosRRHH = lazy(() => import('../pages/rrhh/movimientos/MovimientosList'));
const NominaList = lazy(() => import('../pages/rrhh/nomina/NominaList'));
const NominaForm = lazy(() => import('../pages/rrhh/nomina/NominaForm'));
const NominaDetalle = lazy(() => import('../pages/rrhh/nomina/NominaDetalle'));
const ContratosList = lazy(() => import('../pages/rrhh/contratos/ContratosList'));
const ContratoForm = lazy(() => import('../pages/rrhh/contratos/ContratoForm'));
const RrhhReportes = lazy(() => import('../pages/rrhh/reportes/RrhhReportes'));

// ── FINANZAS
const ServiciosList = lazy(() => import('../pages/finanzas/servicios/ServiciosList'));
const ServicioForm = lazy(() => import('../pages/finanzas/servicios/ServicioForm'));
const LineasCapturaList = lazy(() => import('../pages/finanzas/lineasCaptura/LineasCapturaList'));
const PagosList = lazy(() => import('../pages/finanzas/pagos/PagosList'));
const RecibosList = lazy(() => import('../pages/finanzas/recibos/RecibosList'));
const ReportesFinanzas = lazy(() => import('../pages/finanzas/reportes/ReportesFinanzas'));

// ── INVENTARIO
const InventarioPage = lazy(() => import('../pages/inventario/InventarioPage'));
const SolicitudesList = lazy(() => import('../pages/inventario/solicitudes/SolicitudesList'));
const MovimientosAlmacen = lazy(() => import('../pages/inventario/movimientos/MovimientosAlmacen'));
const MisSolicitudes = lazy(() => import('../pages/inventario/MisSolicitudes'));

// ── CORRESPONDENCIA
const DocumentosList = lazy(() => import('../pages/correspondencia/documentos/DocumentosList'));
const DocumentoForm = lazy(() => import('../pages/correspondencia/documentos/DocumentoForm'));
const DocumentoView = lazy(() => import('../pages/correspondencia/documentos/DocumentoView'));
const TiposList = lazy(() => import('../pages/correspondencia/tiposDocumento/TiposList'));
const ReportesCorrespondencia = lazy(() => import('../pages/correspondencia/reportes/ReportesCorrespondencia'));

// ── JURÍDICO
const AbogadosList = lazy(() => import('../pages/juridico/abogados/AbogadosList'));
const AbogadoForm = lazy(() => import('../pages/juridico/abogados/AbogadoForm'));
const ExpedientesList = lazy(() => import('../pages/juridico/expedientes/ExpedientesList'));
const ExpedienteForm = lazy(() => import('../pages/juridico/expedientes/ExpedienteForm'));
const DemandasList = lazy(() => import('../pages/juridico/demandas/DemandasList'));
const DemandaForm = lazy(() => import('../pages/juridico/demandas/DemandaForm'));
const ConveniosList = lazy(() => import('../pages/juridico/convenios/ConveniosList'));
const ConvenioForm = lazy(() => import('../pages/juridico/convenios/ConvenioForm'));
const CorrespondenciaJuridicaList = lazy(() => import('../pages/juridico/correspondencia/CorrespondenciaJuridicaList'));
const CorrespondenciaJuridicaForm = lazy(() => import('../pages/juridico/correspondencia/CorrespondenciaJuridicaForm'));
const AlertasJuridicas = lazy(() => import('../pages/juridico/alertas/AlertasJuridicas'));
const ReportesJuridicos = lazy(() => import('../pages/juridico/reportes/ReportesJuridicos'));

// ── VINCULACIÓN
const EstudiantesServicioSocial = lazy(() => import('../pages/vinculacion/estudiantes/EstudiantesServicioSocial'));
const FormatosVinculacion = lazy(() => import('../pages/vinculacion/formatos/FormatosVinculacion'));
const ReglamentosVinculacion = lazy(() => import('../pages/vinculacion/reglamentos/ReglamentosVinculacion'));
const RepositorioVinculacion = lazy(() => import('../pages/vinculacion/repositorio/RepositorioVinculacion'));
const ReportesVinculacion = lazy(() => import('../pages/vinculacion/reportes/ReportesVinculacion'));

// ── PORTAL ESTUDIANTE (Vinculación)
const MiServicioSocial = lazy(() => import('../pages/estudiante/servicio-social/MiServicioSocial'));

// ── PRÉSTAMOS INSTITUCIONALES
const EquiposPrestamo = lazy(() => import('../pages/prestamos/EquiposPrestamo'));
const SolicitudesPrestamo = lazy(() => import('../pages/prestamos/SolicitudesPrestamo'));
const ActivosPrestamo = lazy(() => import('../pages/prestamos/ActivosPrestamo'));
const DevolucionesPrestamo = lazy(() => import('../pages/prestamos/DevolucionesPrestamo'));
const HistorialPrestamo = lazy(() => import('../pages/prestamos/HistorialPrestamo'));
const ReportesPrestamo = lazy(() => import('../pages/prestamos/ReportesPrestamo'));
const MisPrestamos = lazy(() => import('../pages/prestamos/MisPrestamos'));
const Usuarios = lazy(() => import('../pages/admin/Usuarios'));

// Loading component
const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px]">
    <div className="w-12 h-12 border-4 border-unich-purple/20 border-t-unich-purple rounded-full animate-spin"></div>
    <p className="mt-4 text-gray-500 font-medium animate-pulse">Cargando módulo...</p>
  </div>
);

// Placeholder de página para módulos no implementados
const PlaceholderPage = ({ title }) => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-800 mb-4">{title}</h1>
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
      <p className="text-gray-500 text-lg">Módulo en construcción.</p>
    </div>
  </div>
);

// Layout principal que incluye el Sidebar y el área de contenido
const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex bg-unich-light min-h-screen font-sans text-gray-800 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div 
        className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'md:ml-[260px]' : 'md:ml-20'}`}
      >
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-unich-light p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const AppRouter = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Rutas Protegidas que usan el Layout principal (Sidebar) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Módulos de Servicios Escolares / Docentes */}
            <Route element={<ProtectedRoute allowedRoles={['servicios_escolares', 'admin']} />}>
              <Route path="/estudiantes" element={<EstudiantesList />} />
              <Route path="/estudiantes/nuevo" element={<EstudianteForm />} />
              <Route path="/estudiantes/editar/:id" element={<EstudianteForm />} />
              <Route path="/estudiantes/perfil/:id" element={<EstudianteProfile />} />
              <Route path="/usuarios" element={<Usuarios />} />
              
              <Route path="/kardex" element={<KardexDetalle />} />
              <Route path="/kardex/simple" element={<KardexView />} />
              <Route path="/boletas" element={<BoletaView />} />
              <Route path="/certificados" element={<CertificadosList />} />
              <Route path="/certificados/nuevo" element={<CertificadoForm />} />
              <Route path="/pagos" element={<PagosList />} />
              <Route path="/pagos/nuevo" element={<PagosList />} />
              <Route path="/reportes" element={<ReportesView />} />
              <Route path="/egresados" element={<EgresadosList />} />
              <Route path="/egresados/nuevo" element={<EgresadoForm />} />
              <Route path="/titulacion" element={<TitulacionView />} />
              <Route path="/titulacion/nuevo" element={<TitulacionForm />} />
              {/* Aspirantes / Admisión */}
              <Route path="/aspirantes" element={<AspirantesList />} />
              <Route path="/aspirantes/nuevo" element={<AspiranteForm />} />
              <Route path="/aspirantes/editar/:id" element={<AspiranteForm />} />
              <Route path="/aspirantes/:id/convertir" element={<AspiranteConvertir />} />
              {/* Movimientos Académicos */}
              <Route path="/movimientos-academicos" element={<MovimientosList />} />
              <Route path="/movimientos-academicos/nuevo" element={<MovimientoForm />} />
              {/* Movilidad Estudiantil */}
              <Route path="/movilidad" element={<MovilidadList />} />
              <Route path="/movilidad/nuevo" element={<MovilidadForm />} />
              {/* Configuración Académica: Periodos */}
              <Route path="/periodos" element={<PeriodosList />} />
              <Route path="/periodos/nuevo" element={<PeriodoForm />} />
              <Route path="/periodos/editar/:id" element={<PeriodoForm />} />
              {/* Configuración Académica: Planes de Estudio */}
              <Route path="/planes-estudio" element={<PlanesEstudioList />} />
              <Route path="/planes-estudio/nuevo" element={<PlanEstudioForm />} />
              <Route path="/planes-estudio/editar/:id" element={<PlanEstudioForm />} />
              <Route path="/planes-estudio/:id/malla" element={<MallaCurricular />} />
              
              <Route path="/licenciaturas" element={<Licenciaturas />} />
              <Route path="/materias"    element={<MateriasList />} />
              <Route path="/materias/nueva" element={<MateriaForm />} />
              <Route path="/materias/editar/:id" element={<MateriaForm />} />
              <Route path="/grupos" element={<GruposList />} />
              <Route path="/grupos/nuevo" element={<GrupoForm />} />
              <Route path="/grupos/editar/:id" element={<GrupoForm />} />
              <Route path="/inscripciones" element={<InscripcionesList />} />
              <Route path="/inscripciones/nueva" element={<InscripcionForm />} />
              <Route path="/inscripciones/editar/:id" element={<InscripcionForm />} />
            </Route>

            {/* Calificaciones — docentes y admin */}
            <Route element={<ProtectedRoute allowedRoles={['docente', 'servicios_escolares', 'admin']} />}>
              <Route path="/calificaciones" element={<CalificacionesList />} />
              <Route path="/calificaciones/capturar/:grupoId" element={<CalificacionForm />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['servicios_escolares', 'docente']} />}>
              <Route path="/grupos" element={<PlaceholderPage title="Grupos" />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['docente']} />}>
              <Route path="/calificaciones" element={<PlaceholderPage title="Calificaciones" />} />
              <Route path="/asistencias"  element={<PlaceholderPage title="Asistencias" />} />
            </Route>

            {/* Módulos RRHH */}
            <Route element={<ProtectedRoute allowedRoles={['rrhh']} />}>
              <Route path="/empleados" element={<PlaceholderPage title="Empleados" />} />
              <Route path="/nomina"    element={<PlaceholderPage title="Nómina" />} />
            </Route>

            {/* Módulos Finanzas */}
            <Route element={<ProtectedRoute allowedRoles={['finanzas']} />}>
              <Route path="/pagos" element={<PlaceholderPage title="Pagos" />} />
              <Route path="/lineas-captura" element={<PlaceholderPage title="Líneas de Captura" />} />
            </Route>

            {/* Módulos Jurídico */}
            <Route element={<ProtectedRoute allowedRoles={['juridico', 'admin']} />}>
              <Route path="/juridico/abogados"            element={<AbogadosList />} />
              <Route path="/juridico/abogados/nuevo"      element={<AbogadoForm />} />
              <Route path="/juridico/abogados/editar/:id" element={<AbogadoForm />} />
              
              <Route path="/juridico/expedientes"            element={<ExpedientesList />} />
              <Route path="/juridico/expedientes/nuevo"      element={<ExpedienteForm />} />
              <Route path="/juridico/expedientes/editar/:id" element={<ExpedienteForm />} />
              
              <Route path="/juridico/demandas"               element={<DemandasList />} />
              <Route path="/juridico/demandas/nuevo"         element={<DemandaForm />} />
              <Route path="/juridico/demandas/editar/:id"    element={<DemandaForm />} />
              
              <Route path="/juridico/convenios"              element={<ConveniosList />} />
              <Route path="/juridico/convenios/nuevo"        element={<ConvenioForm />} />
              <Route path="/juridico/convenios/editar/:id"   element={<ConvenioForm />} />
              
              <Route path="/juridico/correspondencia"            element={<CorrespondenciaJuridicaList />} />
              <Route path="/juridico/correspondencia/nuevo"      element={<CorrespondenciaJuridicaForm />} />
              <Route path="/juridico/correspondencia/editar/:id" element={<CorrespondenciaJuridicaForm />} />
              
              <Route path="/juridico/alertas"          element={<AlertasJuridicas />} />
              <Route path="/juridico/reportes"         element={<ReportesJuridicos />} />
            </Route>

            {/* Módulos RRHH */}
            <Route element={<ProtectedRoute allowedRoles={['rrhh', 'admin']} />}>
              <Route path="/rrhh/empleados" element={<EmpleadosList />} />
              <Route path="/rrhh/empleados/nuevo" element={<EmpleadoForm />} />
              <Route path="/rrhh/empleados/editar/:id" element={<EmpleadoForm />} />
              <Route path="/rrhh/empleados/:id" element={<EmpleadoDetalle />} />
              <Route path="/rrhh/movimientos" element={<MovimientosRRHH />} />
              <Route path="/rrhh/nominas" element={<NominaList />} />
              <Route path="/rrhh/nominas/nuevo" element={<NominaForm />} />
              <Route path="/rrhh/nominas/:id" element={<NominaDetalle />} />
              <Route path="/rrhh/contratos" element={<ContratosList />} />
              <Route path="/rrhh/contratos/nuevo" element={<ContratoForm />} />
              <Route path="/rrhh/contratos/editar/:id" element={<ContratoForm />} />
              <Route path="/rrhh/reportes" element={<RrhhReportes />} />
            </Route>

            {/* Módulos Vinculación */}
            <Route element={<ProtectedRoute allowedRoles={['vinculacion', 'admin']} />}>
              <Route path="/vinculacion/servicio-social"  element={<EstudiantesServicioSocial />} />
              <Route path="/vinculacion/repositorio"      element={<RepositorioVinculacion />} />
              <Route path="/vinculacion/formatos"         element={<FormatosVinculacion />} />
              <Route path="/vinculacion/reglamento"       element={<ReglamentosVinculacion />} />
              <Route path="/vinculacion/reportes"         element={<ReportesVinculacion />} />
            </Route>

            {/* Módulos Préstamos Institucionales */}
            <Route element={<ProtectedRoute allowedRoles={['prestamos', 'admin']} />}>
              <Route path="/prestamos/equipos"      element={<EquiposPrestamo />} />
              <Route path="/prestamos/solicitudes"  element={<SolicitudesPrestamo />} />
              <Route path="/prestamos/activos"      element={<ActivosPrestamo />} />
              <Route path="/prestamos/devoluciones" element={<DevolucionesPrestamo />} />
              <Route path="/prestamos/historial"    element={<HistorialPrestamo />} />
              <Route path="/prestamos/reportes"     element={<ReportesPrestamo />} />
            </Route>

            {/* Portal Estudiante (Servicio Social) */}
            <Route element={<ProtectedRoute allowedRoles={['estudiante']} />}>
              <Route path="/servicio-social/mi-avance" element={<MiServicioSocial />} />
            </Route>

            {/* Módulos Finanzas */}
            <Route element={<ProtectedRoute allowedRoles={['finanzas', 'admin']} />}>
              <Route path="/finanzas/servicios" element={<ServiciosList />} />
              <Route path="/finanzas/servicios/nuevo" element={<ServicioForm />} />
              <Route path="/finanzas/servicios/editar/:id" element={<ServicioForm />} />
              <Route path="/finanzas/lineas-captura" element={<LineasCapturaList />} />
              <Route path="/finanzas/pagos" element={<PagosList />} />
              <Route path="/finanzas/recibos" element={<RecibosList />} />
              <Route path="/finanzas/reportes" element={<ReportesFinanzas />} />
            </Route>

            {/* Módulos Inventario */}
            <Route element={<ProtectedRoute allowedRoles={['inventario', 'admin', 'rrhh']} />}>
              <Route path="/inventario"             element={<InventarioPage />} />
              <Route path="/inventario/solicitudes" element={<SolicitudesList />} />
              <Route path="/inventario/movimientos" element={<MovimientosAlmacen />} />
            </Route>

            {/* Módulo Correspondencia — Accesible a todos los roles para enviar/recibir oficios */}
            <Route path="/correspondencia/documentos/entrada"     element={<DocumentosList mode="entrada" />} />
            <Route path="/correspondencia/documentos/salida"      element={<DocumentosList mode="salida" />} />
            <Route path="/correspondencia/documentos/nuevo"       element={<DocumentoForm />} />
            <Route path="/correspondencia/documentos/editar/:id"  element={<DocumentoForm />} />
            <Route path="/correspondencia/documentos/:id"         element={<DocumentoView />} />

            {/* Módulo Correspondencia — Vistas administrativas solo para encargado y admin */}
            <Route element={<ProtectedRoute allowedRoles={['correspondencia', 'admin']} />}>
              <Route path="/correspondencia/documentos"             element={<DocumentosList mode="todos" />} />
              <Route path="/correspondencia/tipos"                  element={<TiposList />} />
              <Route path="/correspondencia/reportes"               element={<ReportesCorrespondencia />} />
            </Route>

            {/* Mis Solicitudes — accesible para CUALQUIER rol autenticado */}
            <Route path="/mis-solicitudes" element={<MisSolicitudes />} />
            <Route path="/mis-prestamos"   element={<MisPrestamos />} />
          </Route>
        </Route>

        {/* Ruta 404 Catcher */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
