<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\Estudiantes\AlumnoController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Autenticación pública
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('sistema.activo');

// Rutas protegidas
Route::middleware(['auth:sanctum', \App\Http\Middleware\CheckActiveSession::class, \App\Http\Middleware\AuditActivity::class])->group(function () {
    
    // Autenticación protegida
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);

    // Administración de Usuarios (Solo Admin)
    Route::middleware('role:admin')->group(function () {
        Route::post('/admin/users/{id}/reset-password', [AuthController::class, 'adminResetPassword']);
        Route::patch('/admin/users/{id}/toggle-active', [AuthController::class, 'adminToggleActive']);
        Route::get('/admin/users/activity', [AuthController::class, 'usersActivity']);
    });

    // Módulos Generales (Fuera del alias students)
    Route::apiResource('pagos', \App\Http\Controllers\Api\Finanzas\PagoController::class)->only(['index', 'store', 'show']);

    // Módulo: Reportes
    Route::prefix('reportes')->group(function () {
        Route::get('estudiantes-por-carrera', [\App\Http\Controllers\Api\ReporteController::class, 'estudiantesPorCarrera']);
        Route::get('materias-reprobadas', [\App\Http\Controllers\Api\ReporteController::class, 'materiasReprobadas']);
        Route::get('promedio-grupos', [\App\Http\Controllers\Api\ReporteController::class, 'promedioGrupos']);
        Route::get('ingresos', [\App\Http\Controllers\Api\ReporteController::class, 'ingresos']);
        Route::get('resumen', [\App\Http\Controllers\Api\ReporteController::class, 'resumen']);
    });

    // Módulo: Egresados y Titulación
    Route::apiResource('egresados', \App\Http\Controllers\Api\Egresados\EgresadoController::class);
    Route::prefix('titulacion')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\Egresados\TitulacionController::class, 'index']);
        Route::post('/', [\App\Http\Controllers\Api\Egresados\TitulacionController::class, 'store']);
        Route::get('/modalidades', [\App\Http\Controllers\Api\Egresados\TitulacionController::class, 'modalidades']);
        Route::get('/{id}', [\App\Http\Controllers\Api\Egresados\TitulacionController::class, 'show']);
        Route::post('/{id}/titulo', [\App\Http\Controllers\Api\Egresados\TitulacionController::class, 'registrarTitulo']);
        Route::get('/seguimiento/{alumnoId}', [\App\Http\Controllers\Api\Egresados\TitulacionController::class, 'seguimiento']);
    });

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Módulo: Estudiantes y Documentos
    Route::middleware('module:estudiantes')->group(function() {
        Route::apiResource('estudiantes', AlumnoController::class)->parameters(['estudiantes' => 'alumno']);
        Route::get('kardex/{alumno}', [\App\Http\Controllers\Api\Estudiantes\KardexController::class, 'show']);
        Route::get('boleta/{estudiante}/{periodo}', [\App\Http\Controllers\Api\Estudiantes\BoletaController::class, 'getBoleta']);
        Route::apiResource('certificados', \App\Http\Controllers\Api\Estudiantes\CertificadoController::class);

        // Módulo: Aspirantes (Admisión)
        Route::apiResource('aspirantes', \App\Http\Controllers\Api\Estudiantes\AspiranteController::class);
        Route::post('aspirantes/{id}/convertir-alumno', [\App\Http\Controllers\Api\Estudiantes\AspiranteController::class, 'convertirAlumno']);

        // Módulo: Movimientos Académicos
        Route::get('movimientos-academicos', [\App\Http\Controllers\Api\Estudiantes\MovimientoAcademicoController::class, 'index']);
        Route::post('movimientos-academicos', [\App\Http\Controllers\Api\Estudiantes\MovimientoAcademicoController::class, 'store']);

        // Módulo: Movilidad Estudiantil
        Route::get('movilidad', [\App\Http\Controllers\Api\Estudiantes\MovilidadController::class, 'index']);
        Route::post('movilidad', [\App\Http\Controllers\Api\Estudiantes\MovilidadController::class, 'store']);
    });

    // Módulo: Académico
    Route::middleware('module:academico')->group(function() {
        Route::apiResource('licenciaturas', \App\Http\Controllers\Api\LicenciaturaController::class);
        Route::apiResource('materias', \App\Http\Controllers\Api\MateriaController::class);
        Route::apiResource('grupos', \App\Http\Controllers\Api\GrupoController::class);
        
        // Endpoints de solo lectura requeridos por los selectores
        Route::get('periodos', function() {
            return response()->json(\App\Models\Periodo::orderBy('id', 'desc')->get());
        });
        Route::post('periodos', [\App\Http\Controllers\Api\PeriodoController::class, 'store']);
        Route::put('periodos/{id}', [\App\Http\Controllers\Api\PeriodoController::class, 'update']);
        Route::delete('periodos/{id}', [\App\Http\Controllers\Api\PeriodoController::class, 'destroy']);
        Route::post('periodos/{id}/activar', [\App\Http\Controllers\Api\PeriodoController::class, 'activar']);
        Route::post('periodos/{id}/cerrar', [\App\Http\Controllers\Api\PeriodoController::class, 'cerrar']);

        // Planes de Estudio
        Route::apiResource('planes-estudio', \App\Http\Controllers\Api\PlanEstudioController::class)->parameters(['planes-estudio' => 'id']);
        Route::post('planes-estudio/{id}/materias', [\App\Http\Controllers\Api\PlanEstudioController::class, 'syncMaterias']);

        Route::apiResource('docentes', \App\Http\Controllers\Api\Estudiantes\DocenteController::class);
        
        Route::get('estudiantes-dropdown', function(Request $request) {
            // Simplified selection of active students for dropdowns
            return response()->json(\App\Models\Alumno::select('id', 'matricula', 'nombre', 'apellido_paterno', 'apellido_materno')
                ->where('estatus', 'activo')
                ->orderBy('apellido_paterno')
                ->get());
        });
        
        Route::apiResource('inscripciones', \App\Http\Controllers\Api\InscripcionController::class);
        Route::apiResource('calificaciones', \App\Http\Controllers\Api\CalificacionController::class);
        Route::get('grupos/{id}/alumnos', [\App\Http\Controllers\Api\CalificacionController::class, 'alumnosPorGrupo']);
    });

    // ─── RRHH ─────────────────────────────────────────────────────────────────
    Route::middleware('module:rrhh')->group(function () {
        // Catálogos aux
        Route::get('rrhh/departamentos', [\App\Http\Controllers\Api\Rrhh\EmpleadoController::class, 'departamentos']);
        Route::get('rrhh/puestos',       [\App\Http\Controllers\Api\Rrhh\EmpleadoController::class, 'puestos']);

        // Empleados
        Route::apiResource('rrhh/empleados', \App\Http\Controllers\Api\Rrhh\EmpleadoController::class)
            ->parameters(['empleados' => 'id']);

        // Movimientos / Historial laboral
        Route::get('rrhh/movimientos',  [\App\Http\Controllers\Api\Rrhh\MovimientoController::class, 'index']);
        Route::post('rrhh/movimientos', [\App\Http\Controllers\Api\Rrhh\MovimientoController::class, 'store']);

        // Nómina
        Route::apiResource('rrhh/nominas', \App\Http\Controllers\Api\Rrhh\NominaController::class)
            ->parameters(['nominas' => 'id'])->except(['destroy']);
        Route::put('rrhh/nominas/{nominaId}/lineas/{lineaId}', [\App\Http\Controllers\Api\Rrhh\NominaController::class, 'updateLinea']);

        // Contratos Laborales
        Route::apiResource('rrhh/contratos', \App\Http\Controllers\Api\Rrhh\ContratoController::class)
            ->parameters(['contratos' => 'id']);
    });

    // ─── INVENTARIO Y SOLICITUDES ───────────────────────────────────────────
    Route::prefix('inventario')->group(function () {
        Route::get('almacenes', [\App\Http\Controllers\Api\Inventario\InventarioController::class, 'almacenes']);
        Route::get('materiales',   [\App\Http\Controllers\Api\Inventario\InventarioController::class, 'materiales']);
        Route::post('materiales',  [\App\Http\Controllers\Api\Inventario\InventarioController::class, 'createMaterial']);
        Route::put('materiales/{id}', [\App\Http\Controllers\Api\Inventario\InventarioController::class, 'updateMaterial']);
        Route::post('ajustar-stock', [\App\Http\Controllers\Api\Inventario\InventarioController::class, 'ajustarStock']);
        Route::get('movimientos',  [\App\Http\Controllers\Api\Inventario\InventarioController::class, 'movimientos']);
        Route::get('solicitudes',  [\App\Http\Controllers\Api\Inventario\SolicitudController::class, 'index']);
        Route::post('solicitudes', [\App\Http\Controllers\Api\Inventario\SolicitudController::class, 'store']);
        Route::get('solicitudes/{id}', [\App\Http\Controllers\Api\Inventario\SolicitudController::class, 'show']);
        Route::patch('solicitudes/{id}/aprobar',  [\App\Http\Controllers\Api\Inventario\SolicitudController::class, 'aprobar']);
        Route::patch('solicitudes/{id}/rechazar', [\App\Http\Controllers\Api\Inventario\SolicitudController::class, 'rechazar']);
    });

    // ─── NOTIFICACIONES (todos los roles) ────────────────────────────────────
    Route::prefix('notificaciones')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\Inventario\NotificacionController::class, 'index']);
        Route::patch('leer-todas', [\App\Http\Controllers\Api\Inventario\NotificacionController::class, 'marcarTodasLeidas']);
        Route::patch('{id}/leer',  [\App\Http\Controllers\Api\Inventario\NotificacionController::class, 'marcarLeida']);
    });

    // Módulos genéricos (comentados)
    // Se recomienda moverlos al middleware 'module:X' según corresponda
    // Route::apiResource('materias', \App\Http\Controllers\Api\MateriaController::class);
    // Route::apiResource('grupos', \App\Http\Controllers\Api\GrupoController::class);
    // Route::apiResource('inscripciones', \App\Http\Controllers\Api\InscripcionController::class);
    // Route::apiResource('calificaciones', \App\Http\Controllers\Api\CalificacionController::class);
    // ─── FINANZAS ───────────────────────────────────────────────────────────
    Route::middleware('module:finanzas')->group(function () {
        Route::apiResource('finanzas/servicios', \App\Http\Controllers\Api\Finanzas\ServicioController::class)
            ->parameters(['servicios' => 'id']);

        Route::get('finanzas/lineas-captura',         [\App\Http\Controllers\Api\Finanzas\LineaCapturaController::class, 'index']);
        Route::post('finanzas/lineas-captura',         [\App\Http\Controllers\Api\Finanzas\LineaCapturaController::class, 'store']);
        Route::get('finanzas/lineas-captura/{id}',    [\App\Http\Controllers\Api\Finanzas\LineaCapturaController::class, 'show']);
        Route::patch('finanzas/lineas-captura/{id}',  [\App\Http\Controllers\Api\Finanzas\LineaCapturaController::class, 'updateEstatus']);

        Route::get('finanzas/pagos',                  [\App\Http\Controllers\Api\Finanzas\PagoController::class, 'index']);
        Route::post('finanzas/pagos',                 [\App\Http\Controllers\Api\Finanzas\PagoController::class, 'store']);
        Route::get('finanzas/pagos/{id}',             [\App\Http\Controllers\Api\Finanzas\PagoController::class, 'show']);

        Route::get('finanzas/recibos',                [\App\Http\Controllers\Api\Finanzas\ReciboController::class, 'index']);
        Route::get('finanzas/recibos/{id}',           [\App\Http\Controllers\Api\Finanzas\ReciboController::class, 'show']);

        Route::get('finanzas/reportes/resumen',                     [\App\Http\Controllers\Api\Finanzas\ReporteFinanzasController::class, 'resumen']);
        Route::get('finanzas/reportes/arqueo',                      [\App\Http\Controllers\Api\Finanzas\ReporteFinanzasController::class, 'arqueo']);
        Route::get('finanzas/reportes/estudiante/{alumnoId}',       [\App\Http\Controllers\Api\Finanzas\ReporteFinanzasController::class, 'pagosEstudiante']);
    });
});

// ─── WEBHOOK BANCARIO (público, sin auth) ─────────────────────────────────────────
Route::post('banco/webhook', [\App\Http\Controllers\Api\Finanzas\PagoController::class, 'webhookBanco']);

// ─── CORRESPONDENCIA ───────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    // Tipos de documento
    Route::apiResource('correspondencia/tipos', \App\Http\Controllers\Api\Correspondencia\TipoDocumentoController::class);

    // Documentos / Oficios
    Route::get('correspondencia/documentos',        [\App\Http\Controllers\Api\Correspondencia\DocumentoController::class, 'index']);
    Route::post('correspondencia/documentos',       [\App\Http\Controllers\Api\Correspondencia\DocumentoController::class, 'store']);
    Route::get('correspondencia/documentos/{id}',   [\App\Http\Controllers\Api\Correspondencia\DocumentoController::class, 'show']);
    Route::post('correspondencia/documentos/{id}',  [\App\Http\Controllers\Api\Correspondencia\DocumentoController::class, 'update']); // for FormData file upload
    Route::delete('correspondencia/documentos/{id}',[\App\Http\Controllers\Api\Correspondencia\DocumentoController::class, 'destroy']);
    Route::post('correspondencia/documentos/{id}/aprobar', [\App\Http\Controllers\Api\Correspondencia\DocumentoController::class, 'aprobar']);

    // Reportes
    Route::get('correspondencia/reportes/resumen',  [\App\Http\Controllers\Api\Correspondencia\ReporteCorrespondenciaController::class, 'resumen']);

    // Catálogos auxiliares (Áreas/Departamentos)
    Route::get('correspondencia/departamentos',     [\App\Http\Controllers\Api\Correspondencia\DocumentoController::class, 'departamentos']);
});

// ─── ÁREA JURÍDICA ─────────────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'module:juridico'])->group(function () {
    // Abogados
    Route::apiResource('juridico/abogados',        \App\Http\Controllers\Api\Juridico\AbogadoController::class);
    
    // Expedientes
    Route::apiResource('juridico/expedientes',     \App\Http\Controllers\Api\Juridico\ExpedienteController::class);
    
    // Demandas Laborales
    Route::apiResource('juridico/demandas',        \App\Http\Controllers\Api\Juridico\DemandaLaboralController::class);
    
    // Convenios y Contratos
    Route::get('juridico/convenios',               [\App\Http\Controllers\Api\Juridico\ConvenioController::class, 'index']);
    Route::post('juridico/convenios',              [\App\Http\Controllers\Api\Juridico\ConvenioController::class, 'store']);
    Route::get('juridico/convenios/{id}',          [\App\Http\Controllers\Api\Juridico\ConvenioController::class, 'show']);
    Route::post('juridico/convenios/{id}',         [\App\Http\Controllers\Api\Juridico\ConvenioController::class, 'update']); // para FormData (archivos)
    Route::delete('juridico/convenios/{id}',       [\App\Http\Controllers\Api\Juridico\ConvenioController::class, 'destroy']);
    
    // Correspondencia Jurídica
    Route::get('juridico/correspondencia',         [\App\Http\Controllers\Api\Juridico\CorrespondenciaJuridicaController::class, 'index']);
    Route::post('juridico/correspondencia',        [\App\Http\Controllers\Api\Juridico\CorrespondenciaJuridicaController::class, 'store']);
    Route::get('juridico/correspondencia/{id}',    [\App\Http\Controllers\Api\Juridico\CorrespondenciaJuridicaController::class, 'show']);
    Route::post('juridico/correspondencia/{id}',   [\App\Http\Controllers\Api\Juridico\CorrespondenciaJuridicaController::class, 'update']);
    Route::delete('juridico/correspondencia/{id}', [\App\Http\Controllers\Api\Juridico\CorrespondenciaJuridicaController::class, 'destroy']);
});

// ─── ÁREA VINCULACIÓN (SERVICIO SOCIAL) ────────────────────────────────────
Route::middleware(['auth:sanctum', 'module:vinculacion'])->group(function () {
    // Formatos
    Route::get('vinculacion/formatos',                [\App\Http\Controllers\Api\Vinculacion\VinculacionFormatoController::class, 'index']);
    Route::post('vinculacion/formatos',               [\App\Http\Controllers\Api\Vinculacion\VinculacionFormatoController::class, 'store']);
    Route::patch('vinculacion/formatos/{id}/toggle',  [\App\Http\Controllers\Api\Vinculacion\VinculacionFormatoController::class, 'toggleActivo']);
    Route::delete('vinculacion/formatos/{id}',        [\App\Http\Controllers\Api\Vinculacion\VinculacionFormatoController::class, 'destroy']);

    // Reglamentos
    Route::get('vinculacion/reglamento',              [\App\Http\Controllers\Api\Vinculacion\VinculacionReglamentoController::class, 'index']);
    Route::get('vinculacion/reglamento/activo',       [\App\Http\Controllers\Api\Vinculacion\VinculacionReglamentoController::class, 'getActivo']);
    Route::post('vinculacion/reglamento',             [\App\Http\Controllers\Api\Vinculacion\VinculacionReglamentoController::class, 'store']);
    Route::patch('vinculacion/reglamento/{id}/activo',[\App\Http\Controllers\Api\Vinculacion\VinculacionReglamentoController::class, 'setActivo']);
    Route::delete('vinculacion/reglamento/{id}',      [\App\Http\Controllers\Api\Vinculacion\VinculacionReglamentoController::class, 'destroy']);

    // Repositorio
    Route::get('vinculacion/repositorio',             [\App\Http\Controllers\Api\Vinculacion\VinculacionRepositorioController::class, 'index']);
    Route::post('vinculacion/repositorio',            [\App\Http\Controllers\Api\Vinculacion\VinculacionRepositorioController::class, 'store']);
    Route::patch('vinculacion/repositorio/{id}/toggle',[\App\Http\Controllers\Api\Vinculacion\VinculacionRepositorioController::class, 'toggleActivo']);
    Route::delete('vinculacion/repositorio/{id}',     [\App\Http\Controllers\Api\Vinculacion\VinculacionRepositorioController::class, 'destroy']);

    // Alumnos / Expedientes
    Route::get('vinculacion/estudiantes',                       [\App\Http\Controllers\Api\Vinculacion\VinculacionEstudianteController::class, 'index']);
    Route::get('vinculacion/estudiantes/{id}',                  [\App\Http\Controllers\Api\Vinculacion\VinculacionEstudianteController::class, 'getExpediente']);
    Route::put('vinculacion/estudiantes/{id}/habilitar',        [\App\Http\Controllers\Api\Vinculacion\VinculacionEstudianteController::class, 'habilitarServicio']);
    Route::put('vinculacion/estudiantes/{id}/inhabilitar',      [\App\Http\Controllers\Api\Vinculacion\VinculacionEstudianteController::class, 'inhabilitarServicio']);
    Route::patch('vinculacion/servicio-social/{id}/avance',     [\App\Http\Controllers\Api\Vinculacion\VinculacionEstudianteController::class, 'actualizarAvance']);
    Route::patch('vinculacion/documentos/{id}/dictaminar',      [\App\Http\Controllers\Api\Vinculacion\VinculacionEstudianteController::class, 'dictaminarDocumento']);

    // Dashboard 
    Route::get('vinculacion/reportes/resumen',        [\App\Http\Controllers\Api\Vinculacion\VinculacionDashboardController::class, 'getResumen']);
});

// ─── PORTAL ESTUDIANTE (SERVICIO SOCIAL) ──────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::get('estudiante/servicio-social/elegibilidad', [\App\Http\Controllers\Api\Estudiantes\ServicioSocialStudentController::class, 'checkElegibilidad']);
    Route::get('estudiante/servicio-social/avance',       [\App\Http\Controllers\Api\Estudiantes\ServicioSocialStudentController::class, 'getAvance']);
    Route::post('estudiante/servicio-social/documentos',  [\App\Http\Controllers\Api\Estudiantes\ServicioSocialStudentController::class, 'postDocumento']);
    Route::get('estudiante/servicio-social/recursos',     [\App\Http\Controllers\Api\Estudiantes\ServicioSocialStudentController::class, 'getDescargasActivas']);
});

// ─── PRÉSTAMOS INSTITUCIONALES ──────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    // Equipos
    Route::get('prestamos/equipos',             [\App\Http\Controllers\Api\Prestamos\EquipoPrestamoController::class, 'index']);
    Route::get('prestamos/equipos/disponibles', [\App\Http\Controllers\Api\Prestamos\EquipoPrestamoController::class, 'disponibles']);
    Route::post('prestamos/equipos',            [\App\Http\Controllers\Api\Prestamos\EquipoPrestamoController::class, 'store']);
    Route::put('prestamos/equipos/{equipo}',    [\App\Http\Controllers\Api\Prestamos\EquipoPrestamoController::class, 'update']);
    Route::delete('prestamos/equipos/{equipo}', [\App\Http\Controllers\Api\Prestamos\EquipoPrestamoController::class, 'destroy']);

    // Solicitudes y Préstamos
    Route::get('prestamos/solicitudes',                 [\App\Http\Controllers\Api\Prestamos\SolicitudPrestamoController::class, 'index']);
    Route::post('prestamos/solicitudes',                [\App\Http\Controllers\Api\Prestamos\SolicitudPrestamoController::class, 'store']);
    Route::patch('prestamos/solicitudes/{solicitud}/estatus', [\App\Http\Controllers\Api\Prestamos\SolicitudPrestamoController::class, 'updateEstatus']);
    Route::get('prestamos/activos',                     [\App\Http\Controllers\Api\Prestamos\SolicitudPrestamoController::class, 'activos']);
    Route::post('prestamos/solicitudes/{solicitud}/devolver', [\App\Http\Controllers\Api\Prestamos\SolicitudPrestamoController::class, 'devolver']);
    Route::get('prestamos/historial',                   [\App\Http\Controllers\Api\Prestamos\SolicitudPrestamoController::class, 'historial']);

    // Dashboard y Reportes
    Route::get('prestamos/resumen',             [\App\Http\Controllers\Api\Prestamos\PrestamoDashboardController::class, 'resumen']);
});
