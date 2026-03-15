<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureModuleAccess
{
    /**
     * Mapa de permisos: módulo => roles con acceso completo o restringido.
     * 'full'      = acceso CRUD completo
     * 'read'      = solo GET
     * 'own'       = solo recursos propios (el controller aplica scope)
     * 'group'     = solo recursos de sus grupos (docentes)
     */
    protected array $modulePermissions = [
        'estudiantes'     => [
            'full'  => ['admin', 'servicios_escolares'],
            'read'  => ['finanzas'],
            'group' => ['docente'],
        ],
        'aspirantes'      => [
            'full'  => ['admin', 'servicios_escolares'],
        ],
        'kardex'          => [
            'full'  => ['admin', 'servicios_escolares', 'docente'],
            'own'   => ['estudiante'],
        ],
        'calificaciones'  => [
            'full'  => ['admin', 'servicios_escolares', 'docente'],
        ],
        'asistencias'     => [
            'full'  => ['admin', 'servicios_escolares', 'docente'],
        ],
        'inscripciones'   => [
            'full'  => ['admin', 'servicios_escolares'],
            'own'   => ['estudiante'],
        ],
        'documentos'      => [
            'full'  => ['admin', 'servicios_escolares'],
            'own'   => ['estudiante'],
        ],
        'egresados'       => [
            'full'  => ['admin', 'servicios_escolares'],
        ],
        'reportes'        => [
            'full'  => ['admin', 'servicios_escolares'],
            'own'   => ['estudiante'],
        ],
        'finanzas'        => [
            'full'  => ['admin', 'finanzas'],
            'read'  => ['servicios_escolares'],
        ],
        'rrhh'            => [
            'full'  => ['admin', 'rrhh'],
        ],
        'inventario'      => [
            'full'  => ['admin', 'rrhh'],
        ],
        'correspondencia' => [
            'full'  => ['admin', 'correspondencia', 'servicios_escolares', 'docente', 'rrhh', 'finanzas', 'juridico', 'vinculacion'],
        ],
        'juridico'        => [
            'full'  => ['admin', 'juridico'],
        ],
        'vinculacion'     => [
            'full'  => ['admin', 'vinculacion'],
            'own'   => ['estudiante'],
        ],
        'auditoria'       => [
            'full'  => ['admin'],
        ],
        'academico'       => [
            'full'  => ['admin', 'servicios_escolares'],
            'read'  => ['docente', 'estudiante'],
        ],
        'dashboard'       => [
            'full'  => ['admin', 'servicios_escolares', 'docente', 'rrhh', 'finanzas', 'juridico', 'vinculacion', 'estudiante', 'correspondencia'],
        ],
    ];

    public function handle(Request $request, Closure $next, string $module): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $permissions = $this->modulePermissions[$module] ?? null;

        if (!$permissions) {
            return response()->json(['message' => "Módulo '{$module}' no reconocido."], 404);
        }

        // Admin siempre pasa
        if ($user->hasRole('admin')) {
            $request->merge(['module_scope' => 'full']);
            return $next($request);
        }

        // Verificar acceso completo
        foreach ($permissions['full'] ?? [] as $role) {
            if ($user->hasRole($role)) {
                $request->merge(['module_scope' => 'full']);
                return $next($request);
            }
        }

        // Verificar acceso de solo lectura (bloquear POST/PUT/DELETE)
        foreach ($permissions['read'] ?? [] as $role) {
            if ($user->hasRole($role)) {
                if (!in_array($request->method(), ['GET', 'HEAD', 'OPTIONS'])) {
                    return response()->json([
                        'message' => 'No tienes permiso para modificar este módulo.',
                        'error'   => 'READ_ONLY_ACCESS',
                    ], 403);
                }
                $request->merge(['module_scope' => 'read']);
                return $next($request);
            }
        }

        // Verificar acceso de solo recursos propios
        foreach ($permissions['own'] ?? [] as $role) {
            if ($user->hasRole($role)) {
                $request->merge(['module_scope' => 'own']);
                return $next($request);
            }
        }

        // Verificar acceso solo de su grupo (docente)
        foreach ($permissions['group'] ?? [] as $role) {
            if ($user->hasRole($role)) {
                $request->merge(['module_scope' => 'group']);
                return $next($request);
            }
        }

        return response()->json([
            'message' => 'No tienes acceso a este módulo.',
            'error'   => 'MODULE_ACCESS_DENIED',
            'module'  => $module,
        ], 403);
    }
}
