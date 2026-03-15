<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alumno;
use App\Models\Egresado;
use App\Models\Calificacion;
use App\Models\Inscripcion;
use App\Models\ServicioSocial;
use App\Models\Pago;
use App\Models\Empleado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $user  = $request->user();
        $roles = $user->getRoleNames()->toArray();

        // Use caching to reduce DB load on frequent dashboard visits
        $cacheKey = 'dashboard_stats_' . implode('_', $roles);
        
        $data = Cache::remember($cacheKey, 3600, function () use ($roles, $user) {
            $stats = [];

            if (array_intersect(['admin', 'servicios_escolares'], $roles)) {
                $stats['estudiantes'] = [
                    'total'         => Alumno::count(),
                    'activos'       => Alumno::where('estatus', 'activo')->count(),
                    'bajas'         => Alumno::where('estatus', 'baja_definitiva')->count(),
                    'egresados'     => Alumno::where('estatus', 'egresado')->count(),
                    'titulados'     => Alumno::where('estatus', 'titulado')->count(),
                ];

                $stats['por_licenciatura'] = Alumno::where('estatus', 'activo')
                    ->join('licenciaturas', 'alumnos.licenciatura_id', '=', 'licenciaturas.id')
                    ->selectRaw('licenciaturas.nombre, COUNT(alumnos.id) as total')
                    ->groupBy('licenciaturas.nombre')
                    ->orderByDesc('total')
                    ->get();

                $stats['por_semestre'] = Alumno::where('estatus', 'activo')
                    ->selectRaw('semestre_actual, COUNT(id) as total')
                    ->groupBy('semestre_actual')
                    ->orderBy('semestre_actual')
                    ->get();

                $stats['ingresos_mensuales'] = Pago::selectRaw(
                    'MONTH(fecha_pago) as mes, YEAR(fecha_pago) as anio, SUM(monto_pagado) as total'
                )->whereYear('fecha_pago', now()->year)
                 ->groupByRaw('anio, mes')
                 ->orderByRaw('anio, mes')
                 ->get();
            }

            if (in_array('rrhh', $roles) || in_array('admin', $roles)) {
                $stats['empleados'] = [
                    'total'   => Empleado::count(),
                    'activos' => Empleado::where('estatus', 'activo')->count(),
                    'bajas'   => Empleado::where('estatus', 'baja')->count(),
                ];
            }
            
            return $stats;
        });

        // Personal data should not be cached globally or should use per-user cache
        if (in_array('docente', $roles)) {
            $data['mis_grupos'] = $user->docente?->grupos()
                ->with(['materia', 'periodo'])
                ->where('activo', true)
                ->get();
        }

        if (in_array('estudiante', $roles)) {
            $alumno = $user->alumno;
            if ($alumno) {
                $data['mi_avance'] = [
                    'materias_aprobadas' => Calificacion::where('alumno_id', $alumno->id)
                        ->where('estatus', 'aprobado')->count(),
                    'materias_reprobadas' => Calificacion::where('alumno_id', $alumno->id)
                        ->where('estatus', 'reprobado')->count(),
                    'promedio' => $alumno->promedio_general,
                    'semestre' => $alumno->semestre_actual,
                ];
            }
        }

        return response()->json($data);
    }
}
